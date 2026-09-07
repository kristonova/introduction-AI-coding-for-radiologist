/* ===========================================================================
   Widget interaktif deck.

   Setiap widget adalah fungsi `WIDGETS[nama](host)` yang mengisi elemen host
   dan boleh mengembalikan fungsi pembersih. Engine memanggilnya saat slide
   menjadi aktif dan memanggil pembersihnya saat slide ditinggalkan.

   Aturan yang berlaku untuk semuanya:

   1. Tidak ada inferensi saat presentasi. Seluruh angka berasal dari
      `window.DECK_DATA` yang dihasilkan build-figures.py dari berkas
      terverifikasi di repo materi. Deck tidak pernah menjalankan model.
   2. Tidak ada fetch, tidak ada CDN, tidak ada dependensi. Deck harus utuh
      dari file:// tanpa internet.
   3. Bisa dijalankan dengan keyboard saja - presenter sering memakai clicker.
   4. Selalu punya default state yang benar, karena itulah yang tercetak di PDF.
   5. Tidak membaca piksel lewat canvas dari berkas lokal: pada file:// Chrome
      menandai canvas sebagai tainted dan getImageData() melempar SecurityError.
      Widget menggambar sendiri dari DECK_DATA.pixelMatrix.
   =========================================================================== */

(function () {
  'use strict';

  var W = (window.WIDGETS = window.WIDGETS || {});
  var DATA = window.DECK_DATA || {};

  /* --- Pembantu kecil ---------------------------------------------------- */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* Membuat sekelompok tombol yang saling eksklusif (radio, tapi bergaya .ctl) */
  function segmented(options, onPick, initial) {
    var wrap = el('div', 'ctl');
    var buttons = options.map(function (o, i) {
      var b = el('button', null, o.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(i === initial));
      b.addEventListener('click', function () {
        buttons.forEach(function (x, j) { x.setAttribute('aria-pressed', String(i === j)); });
        onPick(o.value, i);
      });
      wrap.appendChild(b);
      return b;
    });
    return { node: wrap, buttons: buttons };
  }

  /* =========================================================================
     W1 - index-zero: mengapa elemen pertama berindeks 0
     ========================================================================= */

  W['index-zero'] = function (host) {
    var items = [
      'karies 74', 'karies 75', 'periapikal 75',
      'pit dalam 36', 'karies 85', 'lainnya'
    ];
    var picked = 0;

    host.innerHTML = '';

    var code = el('pre', 'code code--sm');
    code.textContent = 'temuan = ["' + items.join('", "') + '"]';
    host.appendChild(code);

    var strip = el('div');
    strip.style.cssText = 'display:grid;grid-template-columns:repeat(' + items.length +
      ',1fr);gap:10px;margin-top:4px';

    var cells = items.map(function (label, i) {
      var c = el('button');
      c.type = 'button';
      c.tabIndex = 0;
      c.setAttribute('aria-label', 'Indeks ' + i + ': ' + label);
      c.style.cssText =
        'font:inherit;cursor:pointer;text-align:center;padding:16px 8px 12px;' +
        'border:2px solid var(--border-subtle);border-radius:var(--radius-lg);' +
        'background:var(--white);transition:background var(--duration-fast) var(--ease-standard),' +
        'border-color var(--duration-fast) var(--ease-standard)';
      c.innerHTML =
        '<span style="display:block;font-family:var(--font-mono);font-size:26px;' +
        'font-weight:700;color:var(--ugm-blue);line-height:1">' + i + '</span>' +
        '<span style="display:block;font-size:14px;color:var(--text-muted);margin-top:8px">' +
        label + '</span>';
      c.addEventListener('click', function () { pick(i); });
      strip.appendChild(c);
      return c;
    });
    host.appendChild(strip);

    var controls = el('div', 'inline');
    controls.style.marginTop = '4px';
    var askLabel = el('span', 'sm muted', 'Pilih indeks:');
    controls.appendChild(askLabel);

    var opts = items.map(function (_, i) { return { label: String(i), value: i }; });
    opts.push({ label: '6', value: 6 });
    var seg = segmented(opts, function (v) { pick(v); }, 0);
    controls.appendChild(seg.node);
    host.appendChild(controls);

    var out = el('div');
    out.style.cssText = 'margin-top:2px';
    host.appendChild(out);

    var hint = el('p', 'wg__hint',
      'Klik kotak elemen atau pilih tombol indeks di bawah. Tombol <b>6</b> mendemonstrasikan ' +
      'respons Python ketika meminta indeks di luar rentang daftar (list).');
    host.appendChild(hint);

    function pick(i) {
      picked = i;
      cells.forEach(function (c, j) {
        var on = j === i;
        c.style.borderColor = on ? 'var(--ugm-yellow)' : 'var(--border-subtle)';
        c.style.background = on ? 'var(--surface-tint-warm)' : 'var(--white)';
      });
      seg.buttons.forEach(function (b, j) {
        b.setAttribute('aria-pressed', String(j === i));
      });

      if (i < items.length) {
        out.innerHTML =
          '<pre class="code code--sm" style="border-color:var(--ugm-blue-100);' +
          'background:var(--surface-tint)">temuan[<b>' + i + '</b>]  &#8594;  \'' +
          items[i] + '\'</pre>';
      } else {
        out.innerHTML =
          '<pre class="code code--sm" style="border-color:#EAC5C5;' +
          'background:var(--status-danger-surface);color:var(--status-danger)">' +
          'temuan[<b>6</b>]\nIndexError: list index out of range' +
          '\n\n<i>Daftar ini memiliki panjang 6 elemen, sehingga indeks yang sah adalah 0 hingga 5.</i></pre>';
      }
    }

    pick(0);
  };

  /* =========================================================================
     W2 - pixel-loupe: radiograf sebagai matriks angka
     ========================================================================= */

  W['pixel-loupe'] = function (host) {
    var M = DATA.pixelMatrix;
    if (!M) throw new Error('pixelMatrix tidak tersedia di DECK_DATA');

    var SCALE = 3;                       // piksel layar per piksel citra
    var GRID = 8;                        // lup menampilkan 8x8 piksel (petak angka)
    var cx = Math.round(M.w * 0.62);     // posisi awal: regio gigi posterior kanan
    var cy = Math.round(M.h * 0.55);

    host.innerHTML = '';
    var row = el('div');
    row.style.cssText = 'display:flex;gap:22px;flex:1;min-height:0;align-items:flex-start';
    host.appendChild(row);

    /* --- Kiri: citra digambar dari matriks --- */
    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    var cv = document.createElement('canvas');
    cv.width = M.w * SCALE;
    cv.height = M.h * SCALE;
    cv.style.cssText = 'width:100%;height:auto;display:block;cursor:crosshair;' +
      'border-radius:var(--radius-lg);border:1px solid var(--border-subtle)';
    cv.tabIndex = 0;
    cv.setAttribute('role', 'application');
    cv.setAttribute('aria-label',
      'Radiograf panoramik. Gerakkan kursor atau gunakan tombol panah untuk ' +
      'mengarahkan lup dan membaca nilai intensitas piksel.');
    left.appendChild(cv);
    left.appendChild(el('p', 'figcap',
      'Kasus <b>' + M.case + '</b> &middot; matriks ' + M.w +
      ' &times; ' + M.h + ' piksel untuk inspeksi nilai intensitas tingkat keabuan.'));

    /* Citra dasar dirender sekali ke buffer, lalu disalin tiap frame. */
    var base = document.createElement('canvas');
    base.width = M.w; base.height = M.h;
    var bctx = base.getContext('2d');
    var imgData = bctx.createImageData(M.w, M.h);
    for (var i = 0; i < M.data.length; i++) {
      var v = M.data[i], p = i * 4;
      imgData.data[p] = v; imgData.data[p + 1] = v; imgData.data[p + 2] = v;
      imgData.data[p + 3] = 255;
    }
    bctx.putImageData(imgData, 0, 0);

    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    /* --- Kanan: petak angka --- */
    var right = el('div');
    right.style.cssText = 'flex:none;width:286px;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:7px';
    row.appendChild(right);

    var readout = el('div', 'card');
    readout.style.cssText = 'padding:11px 13px;gap:3px;flex:none';
    right.appendChild(readout);

    var gridWrap = el('div');
    gridWrap.style.cssText =
      'display:grid;grid-template-columns:repeat(' + GRID + ',1fr);gap:2px;' +
      'border:1px solid var(--border-subtle);border-radius:var(--radius-sm);' +
      'padding:2px;background:var(--border-subtle)';
    right.appendChild(gridWrap);

    var gridCells = [];
    for (var g = 0; g < GRID * GRID; g++) {
      var c = el('div');
      c.style.cssText =
        'aspect-ratio:1;display:flex;align-items:center;justify-content:center;' +
        'font-family:var(--font-mono);font-size:12.5px;font-weight:700';
      gridWrap.appendChild(c);
      gridCells.push(c);
    }

    right.appendChild(el('p', 'wg__hint',
      'Arahkan kursor di atas radiograf atau gunakan tombol panah keyboard untuk memindahkan fokus lup.'));

    function at(x, y) {
      x = clamp(x, 0, M.w - 1); y = clamp(y, 0, M.h - 1);
      return M.data[y * M.w + x];
    }

    function render() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(base, 0, 0, cv.width, cv.height);

      var half = GRID >> 1;
      var x0 = clamp(cx - half, 0, M.w - GRID);
      var y0 = clamp(cy - half, 0, M.h - GRID);

      /* Bingkai lup di atas citra */
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FDD402';
      ctx.strokeRect(x0 * SCALE, y0 * SCALE, GRID * SCALE, GRID * SCALE);

      /* Petak angka */
      for (var yy = 0; yy < GRID; yy++) {
        for (var xx = 0; xx < GRID; xx++) {
          var v = at(x0 + xx, y0 + yy);
          var cell = gridCells[yy * GRID + xx];
          cell.style.background = 'rgb(' + v + ',' + v + ',' + v + ')';
          cell.style.color = v > 128 ? '#01416B' : '#FFFFFF';
          cell.textContent = v;
        }
      }

      var centre = at(cx, cy);
      readout.innerHTML =
        '<p class="card__k">Nilai Piksel Pusat Lup</p>' +
        '<p class="mono" style="font-size:17px;color:var(--ugm-blue);font-weight:700;margin:0">' +
        'image[' + clamp(cy, 0, M.h - 1) + ', ' + clamp(cx, 0, M.w - 1) + ']  =  ' + centre +
        '</p>' +
        '<p class="card__d" style="font-size:13.5px;margin:0">' +
        (centre < 60 ? 'Densitas rendah (radiolusen): udara, rongga pulpa, atau kanalis.'
          : centre > 195 ? 'Densitas tinggi (radiopak): email gigi, tulang kortikal, atau restorasi logam.'
            : 'Densitas menengah: dentin, tulang trabekular, atau superimposisi jaringan.') +
        '</p>';
    }

    function fromEvent(e) {
      var r = cv.getBoundingClientRect();
      cx = Math.floor((e.clientX - r.left) / r.width * M.w);
      cy = Math.floor((e.clientY - r.top) / r.height * M.h);
      render();
    }

    function onKey(e) {
      var step = e.shiftKey ? 8 : 1, used = true;
      if (e.key === 'ArrowLeft') cx -= step;
      else if (e.key === 'ArrowRight') cx += step;
      else if (e.key === 'ArrowUp') cy -= step;
      else if (e.key === 'ArrowDown') cy += step;
      else used = false;
      if (used) {
        /* Panah dipakai lup, jangan sampai ikut memindahkan slide. */
        e.preventDefault(); e.stopPropagation();
        cx = clamp(cx, 0, M.w - 1); cy = clamp(cy, 0, M.h - 1);
        render();
      }
    }

    cv.addEventListener('mousemove', fromEvent);
    cv.addEventListener('click', fromEvent);
    cv.addEventListener('keydown', onKey);
    render();

    return function () {
      cv.removeEventListener('mousemove', fromEvent);
      cv.removeEventListener('click', fromEvent);
      cv.removeEventListener('keydown', onKey);
    };
  };

  /* =========================================================================
     W3 - roi-explorer: bounding box menjadi slicing
     ========================================================================= */

  W['roi-explorer'] = function (host) {
    var CASE = 'test_cate1_004';
    var IW = 2000, IH = 942;                 // ukuran citra asli
    var roi = [1140, 470, 1450, 760];        // [x1, y1, x2, y2]
    var MIN = 40;                            // ukuran minimum ROI dalam piksel citra

    host.innerHTML = '';
    var row = el('div');
    row.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    host.appendChild(row);

    /* --- Kiri: citra + kotak yang bisa digeser --- */
    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    var stageBox = el('div');
    stageBox.style.cssText = 'position:relative;line-height:0;border-radius:var(--radius-lg);' +
      'overflow:hidden;border:1px solid var(--border-subtle);cursor:move';
    left.appendChild(stageBox);

    var img = new Image();
    img.src = 'assets/figures/f7-opg-' + CASE + '.png';
    img.alt = 'Radiograf panoramik ' + CASE;
    img.style.cssText = 'width:100%;height:auto;display:block';
    stageBox.appendChild(img);

    var box = el('div');
    box.tabIndex = 0;
    box.setAttribute('role', 'application');
    box.setAttribute('aria-label',
      'Region of Interest (ROI). Geser untuk memindahkan posisi, gunakan tombol panah ' +
      'untuk menggeser, serta Shift + panah untuk mengubah dimensi ukuran.');
    box.style.cssText =
      'position:absolute;box-sizing:border-box;border:3px solid var(--ugm-yellow);' +
      'background:rgba(253,212,2,.14);cursor:move';
    stageBox.appendChild(box);

    var handle = el('div');
    handle.style.cssText =
      'position:absolute;right:-7px;bottom:-7px;width:14px;height:14px;' +
      'background:var(--ugm-yellow);border:2px solid var(--white);cursor:nwse-resize';
    box.appendChild(handle);

    left.appendChild(el('p', 'wg__hint',
      'Geser kotak untuk memindahkan posisi; tarik titik sudut kanan bawah untuk mengubah dimensi. ' +
      'Dukungan keyboard: tombol panah untuk memindahkan, <b>Shift</b> + panah untuk mengubah ukuran.'));

    /* --- Kanan: pembacaan kode dan pratinjau potongan --- */
    var right = el('div');
    right.style.cssText = 'flex:none;width:430px;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:12px';
    row.appendChild(right);

    var codeBox = el('pre', 'code code--sm');
    right.appendChild(codeBox);

    var previewCard = el('div', 'card');
    previewCard.style.cssText = 'padding:14px 16px;gap:9px;flex:1;min-height:0';
    right.appendChild(previewCard);

    var previewHead = el('p', 'card__k', 'Hasil Pemotongan (Cropping)');
    previewCard.appendChild(previewHead);

    var previewBox = el('div');
    previewBox.style.cssText =
      'position:relative;overflow:hidden;flex:1;min-height:0;background:var(--paper);' +
      'border:1px solid var(--border-subtle);border-radius:var(--radius-sm)';
    previewCard.appendChild(previewBox);

    var previewImg = new Image();
    previewImg.src = img.src;
    previewImg.alt = 'Pratinjau potongan region of interest';
    previewImg.style.cssText = 'position:absolute;max-width:none;display:block';
    previewBox.appendChild(previewImg);

    var shapeLine = el('p', 'card__d');
    shapeLine.style.fontSize = '14.5px';
    previewCard.appendChild(shapeLine);

    function render() {
      var x1 = roi[0], y1 = roi[1], x2 = roi[2], y2 = roi[3];

      box.style.left = (x1 / IW * 100) + '%';
      box.style.top = (y1 / IH * 100) + '%';
      box.style.width = ((x2 - x1) / IW * 100) + '%';
      box.style.height = ((y2 - y1) / IH * 100) + '%';

      codeBox.innerHTML =
        'ROI  = [<b>' + x1 + '</b>, <b>' + y1 + '</b>, <b>' + x2 + '</b>, <b>' + y2 + '</b>]' +
        '   <i># [x1, y1, x2, y2]</i>\n\n' +
        'crop = image[<b>' + y1 + '</b>:<b>' + y2 + '</b>, <b>' + x1 + '</b>:<b>' + x2 + '</b>]' +
        '   <i># indeks baris (sumbu-Y), lalu kolom (sumbu-X)</i>';

      shapeLine.innerHTML = 'crop.shape &rarr; <b class="mono">(' + (y2 - y1) + ', ' +
        (x2 - x1) + ', 3)</b> &middot; ' +
        ((y2 - y1) * (x2 - x1)).toLocaleString('id-ID') + ' piksel';

      /* Pratinjau: skalakan citra penuh lalu geser sehingga hanya ROI yang terlihat. */
      var pw = previewBox.clientWidth, ph = previewBox.clientHeight;
      if (pw > 0 && ph > 0) {
        var k = Math.min(pw / (x2 - x1), ph / (y2 - y1));
        previewImg.style.width = (IW * k) + 'px';
        previewImg.style.left = (-x1 * k + (pw - (x2 - x1) * k) / 2) + 'px';
        previewImg.style.top = (-y1 * k + (ph - (y2 - y1) * k) / 2) + 'px';
      }
    }

    /* --- Seret --- */
    var drag = null;

    function toImage(e) {
      var r = stageBox.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width * IW,
        y: (e.clientY - r.top) / r.height * IH
      };
    }

    function onDown(e, mode) {
      e.preventDefault(); e.stopPropagation();
      drag = { mode: mode, start: toImage(e), roi: roi.slice() };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }

    function onMove(e) {
      if (!drag) return;
      var p = toImage(e);
      var dx = p.x - drag.start.x, dy = p.y - drag.start.y;
      var r = drag.roi;
      if (drag.mode === 'move') {
        var w = r[2] - r[0], h = r[3] - r[1];
        var nx = clamp(Math.round(r[0] + dx), 0, IW - w);
        var ny = clamp(Math.round(r[1] + dy), 0, IH - h);
        roi = [nx, ny, nx + w, ny + h];
      } else {
        roi = [
          r[0], r[1],
          clamp(Math.round(r[2] + dx), r[0] + MIN, IW),
          clamp(Math.round(r[3] + dy), r[1] + MIN, IH)
        ];
      }
      render();
    }

    function onUp() {
      drag = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    function boxDown(e) { onDown(e, 'move'); }
    function handleDown(e) { onDown(e, 'resize'); }

    function onKey(e) {
      var step = 20, used = true, r = roi.slice();
      if (e.shiftKey) {
        if (e.key === 'ArrowRight') r[2] += step;
        else if (e.key === 'ArrowLeft') r[2] -= step;
        else if (e.key === 'ArrowDown') r[3] += step;
        else if (e.key === 'ArrowUp') r[3] -= step;
        else used = false;
        r[2] = clamp(r[2], r[0] + MIN, IW);
        r[3] = clamp(r[3], r[1] + MIN, IH);
      } else {
        var w = r[2] - r[0], h = r[3] - r[1];
        if (e.key === 'ArrowRight') r[0] += step;
        else if (e.key === 'ArrowLeft') r[0] -= step;
        else if (e.key === 'ArrowDown') r[1] += step;
        else if (e.key === 'ArrowUp') r[1] -= step;
        else used = false;
        r[0] = clamp(r[0], 0, IW - w); r[1] = clamp(r[1], 0, IH - h);
        r[2] = r[0] + w; r[3] = r[1] + h;
      }
      if (used) {
        e.preventDefault(); e.stopPropagation();
        roi = r; render();
      }
    }

    box.addEventListener('mousedown', boxDown);
    handle.addEventListener('mousedown', handleDown);
    box.addEventListener('keydown', onKey);
    img.addEventListener('load', render);
    window.addEventListener('resize', render);
    render();

    return function () {
      onUp();
      window.removeEventListener('resize', render);
    };
  };

  /* =========================================================================
     W4 - clahe-slider: asli vs histogram equalization vs CLAHE
     ========================================================================= */

  W['clahe-slider'] = function (host) {
    var frames = [
      { key: 'asli', label: 'Asli', note: 'Citra radiograf asli tanpa proses pengolahan kontras.' },
      { key: 'he', label: 'HE', note: '<i>Global Histogram Equalization</i>: perataan fungsi distribusi global; rentan over-enhancement pada latar belakang.' },
      { key: 'clahe10', label: '1,0', note: 'CLAHE (clip limit 1,0): peningkatan kontras adaptif lokal ringan dengan penguatan derau minimal.' },
      { key: 'clahe20', label: '2,0', note: 'CLAHE (clip limit 2,0): parameter standar rekomendasi praktikum; batas kontras optimal dan terkontrol.' },
      { key: 'clahe40', label: '4,0', note: 'CLAHE (clip limit 4,0): kontras tepi meningkat lebih tajam, namun artefak derau latar mulai tampak.' },
      { key: 'clahe80', label: '8,0', note: 'CLAHE (clip limit 8,0): amplifikasi kontras berlebih; derau granular mendominasi area citra.' }
    ];
    var idx = 0;

    host.innerHTML = '';
    var row = el('div');
    row.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    host.appendChild(row);

    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    var imgWrap = el('div');
    /* position:relative + gambar absolut: dengan max-height:100% pada induk yang
       tingginya belum pasti, gambar dirender seukuran aslinya dan mendorong
       histogram di bawahnya keluar panggung. */
    imgWrap.style.cssText = 'flex:1;min-height:0;position:relative;' +
      'border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;' +
      'background:var(--paper)';
    left.appendChild(imgWrap);

    var img = new Image();
    img.alt = 'Potongan radiograf panoramik dengan pengolahan kontras terpilih';
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;' +
      'object-fit:contain;display:block';
    imgWrap.appendChild(img);

    var hist = new Image();
    hist.alt = 'Histogram intensitas untuk tampilan terpilih';
    hist.style.cssText = 'width:100%;height:82px;object-fit:fill;display:block;' +
      'border:1px solid var(--border-subtle);border-radius:var(--radius-sm)';
    left.appendChild(hist);

    var right = el('div');
    right.style.cssText = 'flex:none;width:330px;min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:10px';
    row.appendChild(right);

    var seg = segmented(
      frames.map(function (f, i) { return { label: f.label, value: i }; }),
      function (v) { pick(v); }, 0
    );
    seg.node.style.flexWrap = 'wrap';
    seg.buttons.forEach(function (b) { b.style.padding = '8px 11px'; });
    right.appendChild(seg.node);

    var noteCard = el('div', 'card card--tint');
    noteCard.style.cssText = 'padding:12px 14px;gap:4px;flex:none';
    right.appendChild(noteCard);

    var noteBox = el('div', 'note');
    noteBox.style.cssText = 'padding:12px 14px;flex:none';
    noteBox.innerHTML = '<p class="note__t">Prinsip Konservasi Piksel</p>' +
      '<p style="font-size:14.5px">Distribusi intensitas pada histogram mengalami pergeseran ' +
      'dan peregangan kontras, namun jumlah total piksel citra tetap konstan.</p>';
    right.appendChild(noteBox);

    var clHint = el('p', 'wg__hint',
      'Pilih nilai clip limit bertahap dan amati bagaimana derau muncul pada struktur yang seharusnya homogen.');
    clHint.style.flex = 'none';
    right.appendChild(clHint);

    function pick(i) {
      idx = i;
      var f = frames[i];
      img.src = 'assets/figures/f3-kontras-' + f.key + '.png';
      hist.src = 'assets/figures/f4-kontras-' + f.key + '-hist.png';
      seg.buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });
      noteCard.innerHTML =
        '<p class="card__k">' + f.label + '</p>' +
        '<p class="card__d" style="font-size:15px;margin:0">' + f.note + '</p>';
    }

    pick(0);
  };

})();

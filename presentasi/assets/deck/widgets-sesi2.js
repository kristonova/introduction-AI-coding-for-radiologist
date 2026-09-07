/* ===========================================================================
   Widget Sesi 2. Aturan yang sama dengan widgets.js berlaku di sini:
   tanpa inferensi, tanpa fetch, bisa keyboard, punya default state yang benar.

   Seluruh kotak dan skor berasal dari window.DECK_DATA - salinan terverifikasi
   dari cases.json dan precomputed_predictions.json di repo materi. Deck tidak
   pernah menjalankan best.onnx.
   =========================================================================== */

(function () {
  'use strict';

  var W = (window.WIDGETS = window.WIDGETS || {});
  var DATA = window.DECK_DATA || {};

  var IW = 2000, IH = 942;   // ukuran citra asli semua kasus

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

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

  /* Kotak dalam koordinat citra -> gaya CSS persentase, supaya overlay tetap
     pas berapa pun lebar tampilan citranya. */
  function boxStyle(b) {
    return 'position:absolute;box-sizing:border-box;' +
      'left:' + (b[0] / IW * 100) + '%;top:' + (b[1] / IH * 100) + '%;' +
      'width:' + ((b[2] - b[0]) / IW * 100) + '%;' +
      'height:' + ((b[3] - b[1]) / IH * 100) + '%;';
  }

  /* =========================================================================
     W5 - task-trio: klasifikasi vs deteksi vs segmentasi
     ========================================================================= */

  W['task-trio'] = function (host) {
    var CASE = 'test_cate1_012';
    var ann = (DATA.cases[CASE] || {}).annotations || [];

    var tasks = [
      {
        key: 'klasifikasi', label: 'Klasifikasi',
        out: 'Prediksi label kategori global untuk seluruh citra',
        q: '&ldquo;Apakah terdapat kelainan spesifik pada radiograf ini?&rdquo;',
        limit: 'Tidak menyertakan informasi lokalisasi maupun koordinat spasial lesi.'
      },
      {
        key: 'deteksi', label: 'Deteksi Objek',
        out: 'Label kelas + skor keyakinan + koordinat bounding box',
        q: '&ldquo;Kelainan apa yang terdeteksi, dan di mana perkiraan lokalisasinya?&rdquo;',
        limit: 'Batas prediksi berbentuk kotak ortogonal (persegi), bukan delineasi kontur lesi.'
      },
      {
        key: 'segmentasi', label: 'Segmentasi',
        out: 'Mask delineasi batas piksel per piksel',
        q: '&ldquo;Piksel mana sajakah yang secara presisi menyusun batas anatomis/lesi?&rdquo;',
        limit: 'Biaya anotasi sangat tinggi dan rentan variasi inter-observer antarspesialis.'
      }
    ];
    var idx = 0;

    host.innerHTML = '';
    var seg = segmented(
      tasks.map(function (t, i) { return { label: t.label, value: i }; }),
      function (v) { pick(v); }, 0
    );
    host.appendChild(seg.node);

    var row = el('div');
    row.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    host.appendChild(row);

    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    var frame = el('div');
    frame.style.cssText = 'position:relative;flex:1;min-height:0;line-height:0;' +
      'border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden';
    left.appendChild(frame);

    var img = new Image();
    img.src = 'assets/figures/f7-opg-' + CASE + '.png';
    img.alt = 'Radiograf panoramik ' + CASE;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
    frame.appendChild(img);

    /* Lapisan overlay diletakkan di atas citra dengan rasio yang sama, sehingga
       koordinat persen selalu jatuh di tempat yang benar. */
    var layer = el('div');
    layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;aspect-ratio:' +
      IW + '/' + IH + ';max-height:100%;pointer-events:none';
    frame.appendChild(layer);

    var cap = el('p', 'figcap');
    left.appendChild(cap);

    var right = el('div');
    right.style.cssText = 'flex:none;width:352px;min-height:0;overflow:hidden;display:flex;' +
      'flex-direction:column;gap:12px';
    row.appendChild(right);

    var card = el('div', 'card card--tint');
    card.style.cssText = 'padding:14px 16px;gap:7px;flex:none';
    right.appendChild(card);

    var limitCard = el('div', 'note');
    right.appendChild(limitCard);

    right.appendChild(el('p', 'wg__hint',
      'Satu radiograf yang sama dianalisis melalui tiga paradigma komputasi visual berbeda.'));

    function pick(i) {
      idx = i;
      var t = tasks[i];
      seg.buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', String(i === j)); });

      card.innerHTML =
        '<p class="card__k">Bentuk Representasi Luaran</p>' +
        '<p class="card__t" style="font-size:19px">' + t.out + '</p>' +
        '<p class="card__k" style="margin-top:6px">Relevansi Pertanyaan Klinis</p>' +
        '<p class="card__d" style="font-size:16px;margin:0">' + t.q + '</p>';
      limitCard.innerHTML =
        '<p class="note__t">Keterbatasan Representasi Model</p><p>' + t.limit + '</p>';

      layer.innerHTML = '';

      if (t.key === 'klasifikasi') {
        var chip = el('div');
        chip.style.cssText =
          'position:absolute;left:3%;top:5%;background:var(--ugm-blue);color:#fff;' +
          'padding:8px 14px;border-radius:4px;font-size:15px;font-weight:700;line-height:1.5';
        chip.innerHTML = 'Citra ini: <span style="color:var(--ugm-yellow)">karies</span>, ' +
          '<span style="color:var(--ugm-yellow)">periapical_lesion</span>';
        layer.appendChild(chip);
        cap.innerHTML = 'Prediksi label global berlaku untuk <b>seluruh citra panoramik</b> tanpa koordinat lokalisasi spasial.';

      } else if (t.key === 'deteksi') {
        ann.forEach(function (a) {
          var b = el('div');
          b.style.cssText = boxStyle(a.bbox) +
            'border:3px solid var(--ugm-yellow);background:rgba(253,212,2,.12)';
          var tag = el('div', null, a.label);
          tag.style.cssText = 'position:absolute;left:0;top:-23px;background:var(--ugm-yellow);' +
            'color:var(--ugm-blue);font-size:12px;font-weight:700;padding:2px 7px;white-space:nowrap';
          b.appendChild(tag);
          layer.appendChild(b);
        });
        cap.innerHTML = 'Setiap temuan dilokalisasi dalam <b>bounding box ortogonal</b> berformat ' +
          '<span class="mono">[x1, y1, x2, y2]</span>.';

      } else {
        /* Mask di bawah ini digambar tangan sebagai elips di dalam kotak anotasi.
           Dataset tidak menyediakan mask segmentasi, dan menampilkan bentuk
           seperti ini tanpa label yang jelas akan menyesatkan audiens klinis. */
        ann.forEach(function (a) {
          var b = el('div');
          b.style.cssText = boxStyle(a.bbox) +
            'border-radius:50%;background:rgba(1,65,107,.55);' +
            'border:2px solid var(--ugm-blue)';
          layer.appendChild(b);
        });
        cap.innerHTML = '<b>Visualisasi skematis (konseptual).</b> ' +
          'Dataset acuan tidak menyertakan ground truth mask segmentasi; elips di atas ' +
          'semata-mata mengilustrasikan delineasi tingkat piksel.';
      }
    }

    pick(0);
  };

  /* =========================================================================
     W6 - match-quiz: cocokkan kebutuhan klinis dengan tugas visi komputer
     ========================================================================= */

  W['match-quiz'] = function (host) {
    var needs = [
      {
        need: 'Menilai apakah mutu radiograf panoramik memenuhi standar diagnostik ' +
          'atau perlu diulang akibat artefak pergerakan.',
        answer: 'Klasifikasi',
        why: 'Penilaian berlaku menyeluruh terhadap citra secara utuh tanpa ' +
          'perlu melokalisasi koordinat lesi spesifik.'
      },
      {
        need: 'Menandai dugaan lokasi lesi periapikal untuk verifikasi ulang dan ' +
          'telaah mendalam oleh spesialis radiologi.',
        answer: 'Deteksi Objek',
        why: 'Dibutuhkan klasifikasi kelas sekaligus lokalisasi spasial (bounding box) ' +
          'untuk mengarahkan fokus pandang radiolog.'
      },
      {
        need: 'Mengukur margin jarak aman secara presisi dari apeks implan ke kanalis mandibularis.',
        answer: 'Segmentasi',
        why: 'Memerlukan batas kontur anatomis tingkat piksel yang akurat; ' +
          'kotak persegi tidak dapat merepresentasikan struktur kurvilinear tulang.'
      }
    ];
    var options = ['Klasifikasi', 'Deteksi Objek', 'Segmentasi'];
    var chosen = [null, null, null];
    var revealed = false;

    host.innerHTML = '';
    var list = el('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:14px;flex:1;min-height:0';
    host.appendChild(list);

    var rows = needs.map(function (n, i) {
      var card = el('div', 'card');
      card.style.cssText = 'padding:16px 18px;gap:12px;flex-direction:row;align-items:center';

      var text = el('div');
      text.style.cssText = 'flex:1;min-width:0';
      text.innerHTML = '<p style="margin:0;font-size:17.5px;line-height:1.4">' +
        '<b style="color:var(--ugm-blue)">' + (i + 1) + '.</b> ' + n.need + '</p>' +
        '<p class="why" style="margin:8px 0 0;font-size:15px;line-height:1.4;' +
        'color:var(--text-muted);display:none"></p>';
      card.appendChild(text);

      var seg = segmented(
        options.map(function (o) { return { label: o, value: o }; }),
        function (v) { chosen[i] = v; paint(); }, -1
      );
      seg.node.style.flex = 'none';
      card.appendChild(seg.node);

      list.appendChild(card);
      return { card: card, seg: seg, why: text.querySelector('.why') };
    });

    var bar = el('div', 'inline');
    bar.style.cssText = 'gap:12px;align-items:center;flex:none';
    var btn = el('button', 'btn', 'Buka Jawaban');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      revealed = !revealed;
      btn.textContent = revealed ? 'Sembunyikan Jawaban' : 'Buka Jawaban';
      paint();
    });
    bar.appendChild(btn);
    bar.appendChild(el('span', 'wg__hint',
      'Diskusikan bersama peserta sebelum membuka kunci jawaban komparasi.'));
    host.appendChild(bar);

    function paint() {
      rows.forEach(function (r, i) {
        var n = needs[i];
        r.seg.buttons.forEach(function (b, j) {
          b.setAttribute('aria-pressed', String(chosen[i] === options[j]));
        });

        if (!revealed) {
          r.card.style.borderColor = 'var(--border-subtle)';
          r.card.style.background = 'var(--white)';
          r.why.style.display = 'none';
          return;
        }

        var ok = chosen[i] === n.answer;
        r.card.style.borderColor = ok ? '#C6DED2' : '#EAC5C5';
        r.card.style.background = ok ? 'var(--status-success-surface)' : 'var(--status-danger-surface)';
        r.why.style.display = 'block';
        r.why.innerHTML = '<b style="color:' + (ok ? 'var(--status-success)' : 'var(--status-danger)') +
          '">' + n.answer + '.</b> ' + n.why;
      });
    }

    paint();
  };

  /* =========================================================================
     W7 - threshold-slider: pengaruh ambang keyakinan
     ========================================================================= */

  W['threshold-slider'] = function (host) {
    var cases = ['test_cate1_004', 'test_cate1_012', 'test_cate1_001', 'test_cate1_000'];
    var caseNote = {
      test_cate1_004: '8 anotasi karies acuan. Fenomena deteksi parsial.',
      test_cate1_012: 'Terdapat anotasi periodontitis periapikal nyata.',
      test_cate1_001: 'Anotasi acuan di luar cakupan kamus kelas model.',
      test_cate1_000: 'Kedua anotasi acuan berlabel “Lainnya” (label mismatch).'
    };
    var ci = 0, conf = '025';

    host.innerHTML = '';
    var bar = el('div', 'inline');
    bar.style.cssText = 'gap:12px;align-items:center;flex:none'; bar.style.fontSize = '0';
    host.appendChild(bar);

    bar.appendChild(el('span', 'card__k', 'Kasus'));
    var segCase = segmented(
      cases.map(function (c) { return { label: c.replace('test_cate1_', ''), value: c }; }),
      function (v, i) { ci = i; render(); }, 0
    );
    bar.appendChild(segCase.node);

    bar.appendChild(el('span', 'card__k', 'Ambang'));
    var segConf = segmented(
      [{ label: '0,25', value: '025' }, { label: '0,45', value: '045' }],
      function (v) { conf = v; render(); }, 0
    );
    bar.appendChild(segConf.node);

    var row = el('div');
    row.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    host.appendChild(row);

    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    var frame = el('div');
    frame.style.cssText = 'flex:1;min-height:0;line-height:0;border-radius:var(--radius-lg);' +
      'overflow:hidden;border:1px solid var(--border-subtle);background:var(--paper)';
    left.appendChild(frame);

    var img = new Image();
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
    frame.appendChild(img);

    var cap = el('p', 'figcap');
    left.appendChild(cap);

    var right = el('div');
    right.style.cssText = 'flex:none;width:318px;min-height:0;overflow:hidden;display:flex;' +
      'flex-direction:column;gap:10px';
    row.appendChild(right);

    var countCard = el('div', 'card card--navy');
    countCard.style.cssText = 'padding:14px 16px;gap:4px;flex:none';
    right.appendChild(countCard);

    var breakdown = el('div', 'card card--tint');
    breakdown.style.cssText = 'padding:13px 15px;gap:6px;flex:1;min-height:0;overflow:hidden';
    right.appendChild(breakdown);

    var thHint = el('p', 'wg__hint',
      'Ubah nilai ambang pada kasus yang sama untuk mengamati dinamika eliminasi kotak prediksi.');
    thHint.style.flex = 'none';
    right.appendChild(thHint);

    function render() {
      var c = cases[ci];
      var preds = ((DATA.predictions || {})[c] || {})[conf === '025' ? '0.25' : '0.45'] || [];
      var other = ((DATA.predictions || {})[c] || {})[conf === '025' ? '0.45' : '0.25'] || [];
      var ann = ((DATA.cases || {})[c] || {}).annotations || [];

      segCase.buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === ci)); });
      segConf.buttons.forEach(function (b, j) {
        b.setAttribute('aria-pressed', String((j === 0) === (conf === '025')));
      });

      img.src = 'assets/figures/f7-overlay-' + c + '-conf' + conf + '.png';
      img.alt = 'Keluaran detektor pada ' + c + ' dengan ambang ' +
        (conf === '025' ? '0,25' : '0,45');

      var byLabel = {};
      preds.forEach(function (p) { byLabel[p.label] = (byLabel[p.label] || 0) + 1; });

      var delta = preds.length - other.length;
      countCard.innerHTML =
        '<p class="card__k">Jumlah Kotak Terdeteksi (Ambang ' +
        (conf === '025' ? '0,25' : '0,45') + ')</p>' +
        '<p style="margin:0;font-size:44px;font-weight:700;line-height:1;color:var(--ugm-yellow)">' +
        preds.length + '</p>' +
        '<p class="card__d" style="font-size:15px;margin:0">' +
        (delta === 0
          ? 'Jumlah deteksi identik dengan ambang pembanding.'
          : (delta > 0 ? '+' : '') + delta + ' kotak dibanding ambang ' +
            (conf === '025' ? '0,45' : '0,25') + ' (' + other.length + ' kotak).') +
        '</p>';

      var labelRows = Object.keys(byLabel).map(function (k) {
        return '<dt>' + k + '</dt><dd>' + byLabel[k] + ' kotak</dd>';
      }).join('') || '<dt>&mdash;</dt><dd>tidak ada kotak</dd>';

      breakdown.innerHTML =
        '<p class="card__k">Rincian Kelas Prediksi</p>' +
        '<dl class="kv" style="font-size:14px;gap:4px 12px">' + labelRows + '</dl>' +
        '<p class="card__k" style="margin-top:6px">Anotasi Acuan (Ground Truth)</p>' +
        '<p class="card__d" style="font-size:14px;margin:0">' + ann.length +
        ' anotasi &middot; ' +
        ann.filter(function (a) { return a.evalClass; }).length +
        ' dapat dievaluasi secara valid</p>' +
        '<p class="card__d" style="font-size:14px;margin:5px 0 0">' +
        caseNote[c] + '</p>';

      cap.innerHTML = 'Kasus <b>' + c + '</b> &middot; arsip keluaran inferensi tersimpan ' +
        '(bukan komputasi langsung browser).';
    }

    render();
  };

  /* =========================================================================
     W8 - iou-lab: menghitung Intersection over Union
     ========================================================================= */

  W['iou-lab'] = function (host) {
    /* Kotak acuan diambil dari anotasi karies asli pada test_cate1_012. */
    var gt = [1132, 534, 1208, 678];
    var pred = [1160, 560, 1244, 700];
    var MATCH = 0.50;

    host.innerHTML = '';
    var row = el('div');
    row.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    host.appendChild(row);

    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    /* Panggung kerja memakai koordinat citra langsung; skala diatur SVG. */
    var svgWrap = el('div');
    svgWrap.style.cssText = 'flex:1;min-height:0;border:1px solid var(--border-subtle);' +
      'border-radius:var(--radius-lg);background:var(--paper);overflow:hidden;' +
      'position:relative;cursor:move';
    left.appendChild(svgWrap);

    var VB = { x: 1020, y: 440, w: 380, h: 320 };
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', VB.x + ' ' + VB.y + ' ' + VB.w + ' ' + VB.h);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('role', 'application');
    svg.setAttribute('aria-label',
      'Visualisasi komparasi Intersection over Union (IoU). Geser kotak prediksi atau gunakan ' +
      'tombol panah untuk mengamati perubahan rasio tumpang-tindih.');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    svg.setAttribute('tabindex', '0');
    svgWrap.appendChild(svg);

    left.appendChild(el('p', 'wg__hint',
      'Geser kotak biru prediksi (atau gunakan tombol panah keyboard). ' +
      'Amati perubahan vonis evaluasi tepat di sekitar ambang batas IoU 0,50.'));

    var right = el('div');
    right.style.cssText = 'flex:none;width:340px;min-height:0;overflow:hidden;display:flex;' +
      'flex-direction:column;gap:12px';
    row.appendChild(right);

    var scoreCard = el('div', 'card card--navy');
    scoreCard.style.cssText = 'padding:13px 16px;gap:3px;flex:none';
    right.appendChild(scoreCard);

    var verdictCard = el('div', 'card');
    verdictCard.style.cssText = 'padding:13px 15px;gap:5px;flex:none';
    right.appendChild(verdictCard);

    var iouNote = el('div', 'note');
    iouNote.style.cssText = 'padding:13px 15px;flex:none';
    iouNote.innerHTML = '<p class="note__t">Konvensi Ambang Batas IoU 0,50</p>' +
      '<p style="font-size:14.5px">Nilai ambang 0,50 adalah <b>standar kesepakatan evaluasi (benchmark)</b>, ' +
      'bukan batasan alamiah mutlak. Pergeseran ambang ini mengubah seluruh kalkulasi metrik TP, FP, dan FN ' +
      'tanpa mengubah satu pun koordinat prediksi model.</p>';
    right.appendChild(iouNote);

    function iou(a, b) {
      var ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
      var iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
      var inter = ix * iy;
      var ua = (a[2] - a[0]) * (a[3] - a[1]);
      var ub = (b[2] - b[0]) * (b[3] - b[1]);
      var uni = ua + ub - inter;
      return { v: uni > 0 ? inter / uni : 0, inter: inter, uni: uni };
    }

    function render() {
      var r = iou(gt, pred);
      var ok = r.v >= MATCH;

      var ix1 = Math.max(gt[0], pred[0]), iy1 = Math.max(gt[1], pred[1]);
      var ix2 = Math.min(gt[2], pred[2]), iy2 = Math.min(gt[3], pred[3]);
      var hasInter = ix2 > ix1 && iy2 > iy1;

      svg.innerHTML =
        (hasInter
          ? '<rect x="' + ix1 + '" y="' + iy1 + '" width="' + (ix2 - ix1) +
            '" height="' + (iy2 - iy1) + '" fill="#FDD402" opacity=".55"/>'
          : '') +
        '<rect x="' + gt[0] + '" y="' + gt[1] + '" width="' + (gt[2] - gt[0]) +
        '" height="' + (gt[3] - gt[1]) + '" fill="none" stroke="#2E7D52" stroke-width="4"/>' +
        '<rect x="' + pred[0] + '" y="' + pred[1] + '" width="' + (pred[2] - pred[0]) +
        '" height="' + (pred[3] - pred[1]) + '" fill="rgba(1,65,107,.10)" ' +
        'stroke="#01416B" stroke-width="4" stroke-dasharray="10 6"/>' +
        '<text x="' + gt[0] + '" y="' + (gt[1] - 9) + '" font-size="17" font-weight="700" ' +
        'fill="#2E7D52">Anotasi acuan (Ground Truth)</text>' +
        '<text x="' + pred[0] + '" y="' + (pred[3] + 24) + '" font-size="17" ' +
        'font-weight="700" fill="#01416B">Prediksi model</text>';

      scoreCard.innerHTML =
        '<p class="card__k">Intersection over Union (IoU)</p>' +
        '<p style="margin:0;font-size:40px;font-weight:700;line-height:1;' +
        'font-family:var(--font-mono);color:var(--ugm-yellow)">' +
        r.v.toFixed(2).replace('.', ',') + '</p>' +
        '<p class="card__d" style="font-size:13px;margin:3px 0 0;font-family:var(--font-mono)">' +
        'luas irisan ' + Math.round(r.inter).toLocaleString('id-ID') +
        ' &divide; luas gabungan ' + Math.round(r.uni).toLocaleString('id-ID') + '</p>';

      verdictCard.style.borderColor = ok ? '#C6DED2' : '#EAC5C5';
      verdictCard.style.background = ok ? 'var(--status-success-surface)' : 'var(--status-danger-surface)';
      verdictCard.innerHTML =
        '<p class="card__k" style="color:' + (ok ? 'var(--status-success)' : 'var(--status-danger)') +
        '">Vonis Klasifikasi (Ambang IoU 0,50)</p>' +
        (ok
          ? '<p class="card__t" style="color:var(--status-success);font-size:19px">' +
            '1 True Positive (TP)</p>' +
            '<p class="card__d" style="font-size:14px;margin:0">Koordinat prediksi ' +
            'dinilai valid dan berimpit cukup luas dengan anotasi acuan.</p>'
          : '<p class="card__t" style="color:var(--status-danger);font-size:19px">' +
            '1 False Positive (FP) + 1 False Negative (FN)</p>' +
            '<p class="card__d" style="font-size:14px;margin:0">Prediksi dihitung sebagai ' +
            'positif palsu, <i>sekaligus</i> lesi acuan dihitung terlewat (negatif palsu) &mdash; ' +
            'satu ketidaktepatan spasial menghasilkan dua penalti galat.</p>');
    }

    /* --- Seret --- */
    var drag = null;

    function toVB(e) {
      var r = svgWrap.getBoundingClientRect();
      /* preserveAspectRatio "meet": cari skala dan bantalan yang dipakai SVG. */
      var k = Math.min(r.width / VB.w, r.height / VB.h);
      var offX = (r.width - VB.w * k) / 2, offY = (r.height - VB.h * k) / 2;
      return {
        x: VB.x + (e.clientX - r.left - offX) / k,
        y: VB.y + (e.clientY - r.top - offY) / k
      };
    }

    function onDown(e) {
      e.preventDefault(); e.stopPropagation();
      drag = { start: toVB(e), box: pred.slice() };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }

    function onMove(e) {
      if (!drag) return;
      var p = toVB(e);
      var dx = p.x - drag.start.x, dy = p.y - drag.start.y;
      var b = drag.box, w = b[2] - b[0], h = b[3] - b[1];
      var nx = clamp(Math.round(b[0] + dx), VB.x, VB.x + VB.w - w);
      var ny = clamp(Math.round(b[1] + dy), VB.y, VB.y + VB.h - h);
      pred = [nx, ny, nx + w, ny + h];
      render();
    }

    function onUp() {
      drag = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    function onKey(e) {
      var step = e.shiftKey ? 4 : 12, used = true, b = pred.slice();
      var w = b[2] - b[0], h = b[3] - b[1];
      if (e.key === 'ArrowLeft') b[0] -= step;
      else if (e.key === 'ArrowRight') b[0] += step;
      else if (e.key === 'ArrowUp') b[1] -= step;
      else if (e.key === 'ArrowDown') b[1] += step;
      else used = false;
      if (used) {
        e.preventDefault(); e.stopPropagation();
        b[0] = clamp(b[0], VB.x, VB.x + VB.w - w);
        b[1] = clamp(b[1], VB.y, VB.y + VB.h - h);
        pred = [b[0], b[1], b[0] + w, b[1] + h];
        render();
      }
    }

    svgWrap.addEventListener('mousedown', onDown);
    svg.addEventListener('keydown', onKey);
    render();

    return function () { onUp(); };
  };

  /* =========================================================================
     W9 - occlusion-walk: cara kerja occlusion sensitivity
     ========================================================================= */

  W['occlusion-walk'] = function (host) {
    var CASE = 'test_cate1_004';
    var GRID = 6;
    var step = 0;                 // 0 .. GRID*GRID
    var timer = null;

    /* Skor turunan yang dipakai hanya untuk memperagakan mekanismenya:
       tinggi di sekitar kotak prediksi berskor tertinggi, rendah di tepi.
       Peta panas sungguhan dari notebook ditampilkan pada slide berikutnya. */
    var preds = ((DATA.predictions || {})[CASE] || {})['0.45'] || [];
    var focus = preds.length
      ? [(preds[0].bbox_xyxy[0] + preds[0].bbox_xyxy[2]) / 2 / IW,
         (preds[0].bbox_xyxy[1] + preds[0].bbox_xyxy[3]) / 2 / IH]
      : [0.6, 0.55];

    var drops = [];
    for (var gy = 0; gy < GRID; gy++) {
      for (var gx = 0; gx < GRID; gx++) {
        var cxn = (gx + 0.5) / GRID, cyn = (gy + 0.5) / GRID;
        var d = Math.hypot(cxn - focus[0], (cyn - focus[1]) * 0.55);
        drops.push(Math.max(0, Math.exp(-(d * d) / 0.035)));
      }
    }

    host.innerHTML = '';
    var row = el('div');
    row.style.cssText = 'display:flex;gap:20px;flex:1;min-height:0';
    host.appendChild(row);

    var left = el('div');
    left.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:8px';
    row.appendChild(left);

    var frame = el('div');
    frame.style.cssText = 'position:relative;flex:1;min-height:0;line-height:0;' +
      'border:1px solid var(--border-subtle);border-radius:var(--radius-lg);' +
      'overflow:hidden;background:var(--paper)';
    left.appendChild(frame);

    var img = new Image();
    img.src = 'assets/figures/f7-opg-' + CASE + '.png';
    img.alt = 'Radiograf panoramik ' + CASE;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
    frame.appendChild(img);

    var layer = el('div');
    layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;aspect-ratio:' +
      IW + '/' + IH + ';max-height:100%;display:grid;' +
      'grid-template-columns:repeat(' + GRID + ',1fr);' +
      'grid-template-rows:repeat(' + GRID + ',1fr);pointer-events:none';
    frame.appendChild(layer);

    var tiles = [];
    for (var i = 0; i < GRID * GRID; i++) {
      var t = el('div');
      t.style.cssText = 'width:100%;height:100%';
      layer.appendChild(t);
      tiles.push(t);
    }

    left.appendChild(el('p', 'figcap',
      'Simulasi mekanisme <b>occlusion sensitivity</b> pada kasus <b>' + CASE + '</b>.'));

    var right = el('div');
    right.style.cssText = 'flex:none;width:336px;min-height:0;overflow:hidden;display:flex;' +
      'flex-direction:column;gap:12px';
    row.appendChild(right);

    var ctlBar = el('div', 'inline');
    ctlBar.style.flex = 'none';
    var playBtn = el('button', 'btn', 'Mulai');
    playBtn.type = 'button';
    playBtn.addEventListener('click', toggle);
    var stepBtn = el('button', 'btn btn--ghost', 'Satu Langkah');
    stepBtn.type = 'button';
    stepBtn.addEventListener('click', function () { stop(); advance(1); });
    var resetBtn = el('button', 'btn btn--ghost', 'Reset');
    resetBtn.type = 'button';
    resetBtn.addEventListener('click', function () { stop(); step = 0; render(); });
    ctlBar.appendChild(playBtn); ctlBar.appendChild(stepBtn); ctlBar.appendChild(resetBtn);
    right.appendChild(ctlBar);

    var stateCard = el('div', 'card card--navy');
    stateCard.style.cssText = 'padding:13px 16px;gap:4px;flex:none';
    right.appendChild(stateCard);

    var occNote = el('div', 'note');
    occNote.style.cssText = 'padding:13px 15px;flex:none';
    occNote.innerHTML = '<p class="note__t">Logika Intuitif Perturbasi</p>' +
      '<p style="font-size:14.5px">Tutup satu blok piksel, jalankan ulang inferensi, lalu ukur ' +
      'defisit skor keyakinan. Ulangi pada seluruh partisi grid. Penurunan probabilitas yang drastis membuktikan bahwa ' +
      '<b>blok piksel tersebut memegang peranan krusial dalam keputusan prediksi model</b>.</p>';
    right.appendChild(occNote);

    right.appendChild(el('p', 'wg__hint',
      'Peta panas ini mendemonstrasikan mekanisme komputasi internal. ' +
      'Hasil inferensi riil beresolusi penuh ditampilkan pada slide berikutnya.'));

    function heat(v) {
      /* Kuning UGM untuk pengaruh besar, biru UGM untuk pengaruh kecil. */
      return v > 0.55
        ? 'rgba(253,212,2,' + (0.30 + v * 0.5) + ')'
        : 'rgba(1,65,107,' + (0.12 + v * 0.30) + ')';
    }

    function render() {
      tiles.forEach(function (t, i) {
        if (i < step) {
          t.style.background = heat(drops[i]);
          t.style.outline = 'none';
        } else if (i === step) {
          t.style.background = 'rgba(43,45,47,.88)';   // penutup yang sedang berjalan
          t.style.outline = '3px solid var(--ugm-yellow)';
          t.style.outlineOffset = '-3px';
        } else {
          t.style.background = 'transparent';
          t.style.outline = 'none';
        }
      });

      var done = step >= GRID * GRID;
      stateCard.innerHTML =
        '<p class="card__k">' + (done ? 'Peta Atribusi Selesai' : 'Blok Partisi Sedang Ditutup') + '</p>' +
        '<p style="margin:0;font-size:32px;font-weight:700;line-height:1.1;' +
        'font-family:var(--font-mono);color:var(--ugm-yellow)">' +
        Math.min(step, GRID * GRID) + ' / ' + (GRID * GRID) + '</p>' +
        '<p class="card__d" style="font-size:14px;margin:3px 0 0">' +
        (done
          ? 'Seluruh partisi grid telah diuji. Warna kuning-oranye menandai area yang ' +
            'penutupannya paling menurunkan skor keyakinan model.'
          : 'Blok piksel yang ditutup memicu evaluasi ulang inferensi model; ' +
            'selisih penurunan probabilitas dipetakan ke skala intensitas warna.') +
        '</p>';
      playBtn.textContent = timer ? 'Jeda' : (done ? 'Ulangi' : 'Mulai');
    }

    function advance(n) {
      step = Math.min(step + n, GRID * GRID);
      render();
      if (step >= GRID * GRID) stop();
    }

    function toggle() {
      if (timer) { stop(); return; }
      if (step >= GRID * GRID) step = 0;
      timer = setInterval(function () { advance(1); }, 170);
      render();
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      render();
    }

    render();

    /* Timer wajib dimatikan saat slide ditinggalkan; tanpa ini ia terus
       berjalan selama sisa presentasi. */
    return function () { if (timer) { clearInterval(timer); timer = null; } };
  };

  /* =========================================================================
     W10 - label-space: kamus model vs kenyataan klinis
     ========================================================================= */

  W['label-space'] = function (host) {
    var known = [
      { label: 'caries', id: 'Karies Gigi', note: 'Tercakup dalam kamus kelas model dan memiliki padanan anotasi acuan.' },
      { label: 'periapical_lesion', id: 'Lesi Periapikal', note: 'Tercakup dalam kamus kelas model; memerlukan perhatian pada penyelarasan kriteria klinis.' },
      { label: 'impacted_tooth', id: 'Gigi Impaksi', note: 'Tercakup dalam kamus kelas model, namun tidak pernah dianotasi pada dataset acuan praktikum.' }
    ];
    var unknown = [
      'Resorpsi akar', 'Kista dentigerous', 'Fraktur mandibula',
      'Anomali jumlah gigi', 'Penyakit periodontal', 'Lesi fibro-oseus',
      'Kelainan sendi temporomandibular', 'Kalsifikasi arteri karotis'
    ];
    var picked = null;

    host.innerHTML = '';
    var row = el('div');
    row.style.cssText = 'display:flex;gap:22px;flex:1;min-height:0';
    host.appendChild(row);

    /* Kiri: kamus model */
    var left = el('div', 'card card--navy');
    left.style.cssText = 'flex:none;width:352px;min-height:0;padding:15px 18px;gap:9px';
    left.innerHTML = '<p class="card__k">Kamus Kelas Model &mdash; 3 Kelas</p>';
    row.appendChild(left);

    known.forEach(function (k) {
      var b = el('button');
      b.type = 'button';
      b.style.cssText = 'font:inherit;text-align:left;cursor:pointer;' +
        'padding:11px 13px;border:1px solid rgba(255,255,255,.28);border-radius:6px;' +
        'background:rgba(255,255,255,.10);color:#fff';
      b.innerHTML = '<span class="mono" style="font-size:15px;font-weight:700;' +
        'color:var(--ugm-yellow)">' + k.label + '</span>' +
        '<span style="display:block;font-size:14px;color:rgba(255,255,255,.76);' +
        'margin-top:3px">' + k.id + '</span>';
      b.addEventListener('click', function () { pick(k.note, true); });
      b.addEventListener('mouseenter', function () { pick(k.note, true); });
      left.appendChild(b);
    });

    left.appendChild(el('p', 'card__d',
      'Apa pun spektrum patologi pada radiograf, model AI ini secara matematis ' +
      'hanya dapat mengklasifikasikan ke dalam salah satu dari 3 kelas di atas.'));

    /* Kanan: kenyataan klinis */
    var right = el('div');
    right.style.cssText = 'flex:1;min-width:0;min-height:0;display:flex;' +
      'flex-direction:column;gap:12px';
    row.appendChild(right);

    var head = el('div', 'card__k', 'Variasi temuan patologis lain yang kerap dijumpai pada radiograf panoramik serupa');
    right.appendChild(head);

    var cloud = el('div');
    cloud.style.cssText = 'display:flex;flex-wrap:wrap;gap:9px;align-content:flex-start';
    right.appendChild(cloud);

    unknown.forEach(function (u) {
      var b = el('button', 'chip');
      b.type = 'button';
      b.textContent = u;
      b.style.cssText += 'cursor:pointer;font-size:15px;padding:8px 13px;' +
        'background:var(--status-danger-surface);color:var(--status-danger);' +
        'border-color:#EAC5C5';
      var note = '<b>' + u + '</b> berada di luar taksonomi kelas model. Model tidak akan ' +
        'pernah mampu menandainya, dan tidak akan memberi peringatan bahwa kondisi tersebut di luar kapabilitasnya.';
      b.addEventListener('click', function () { pick(note, false); });
      b.addEventListener('mouseenter', function () { pick(note, false); });
      cloud.appendChild(b);
    });

    var out = el('div', 'note');
    out.style.cssText = 'margin-top:auto';
    right.appendChild(out);

    right.appendChild(el('p', 'wg__hint',
      'Arahkan kursor atau klik label untuk memeriksa status komparasi dalam model.'));

    function pick(note, inside) {
      picked = note;
      out.innerHTML =
        '<p class="note__t">' + (inside ? 'Termasuk Dalam Kamus Model' : 'Di Luar Cakupan Kamus Model') +
        '</p><p>' + note + '</p>';
    }

    pick('Ketiadaan kotak deteksi dari model <b>bukan bukti klinis</b> bahwa radiograf bebas kelainan. ' +
      'Hal itu semata-mata menunjukkan tidak ada temuan <b>dari 3 kelas yang dikenali model</b> ' +
      'yang melampaui nilai ambang batas keyakinan.', false);
  };

})();

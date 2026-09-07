/* ===========================================================================
   Engine deck. Merender slide, menyuntik chrome, dan menjalankan navigasi.

   Slide didaftarkan oleh berkas slides-*.js lewat DECK.push({...}) sebelum
   berkas ini dijalankan (urutan <script src> di index.html yang menjamin).
   Tidak ada modul ES: `import` diblokir CORS saat halaman dibuka dari file://,
   sedangkan <script src> klasik tidak. Itu syarat mutlak deck ini karena
   harus jalan dari flashdisk di Lab Radiologi tanpa server dan tanpa internet.
   =========================================================================== */

(function () {
  'use strict';

  var slides = window.DECK || [];
  var widgets = window.WIDGETS || {};

  var stage = document.getElementById('stage');
  var deckEl = document.getElementById('deck');
  var navEl = document.getElementById('nav');
  var countEl = document.getElementById('navCount');
  var progressEl = document.getElementById('progress');
  var ovEl = document.getElementById('ov');
  var ovGrid = document.getElementById('ovGrid');
  var menuEl = document.getElementById('menu');
  var menuList = document.getElementById('menuList');
  var notesEl = document.getElementById('notes');
  var notesBody = document.getElementById('notesBody');
  var helpEl = document.getElementById('help');
  var timerEl = document.getElementById('timer');
  var timerClock = document.getElementById('timerClock');
  var timerBlock = document.getElementById('timerBlock');

  var current = 0;
  var built = [];

  /* --- Bab ---------------------------------------------------------------
     Dipakai overview, menu bab, dan kicker default. Nomor bab pada objek
     slide (`chapter`) merujuk ke indeks di daftar ini. */

  var CHAPTERS = [
    { id: 0, label: 'Pembuka', desc: 'Kontrak belajar, peta pembelajaran, dan prinsip perlindungan data pasien' },
    { id: 1, label: 'Bab 1 — Sesi 1', desc: 'Fondasi Python dan pengolahan citra radiologi digital' },
    { id: 2, label: 'Jembatan', desc: 'Benang merah penghubung konsep Sesi 1 dan Sesi 2' },
    { id: 3, label: 'Bab 2 — Sesi 2', desc: 'Evaluasi model deteksi AI dan Explainable AI (XAI)' },
    { id: 4, label: 'Penutup', desc: 'Rangkuman, batasan etika klinis, dan transparansi referensi' }
  ];

  /* --- Blok agenda 150 menit --------------------------------------------
     Sumber: tabel "Alur dua sesi" di README repo materi. Dipakai timer
     supaya presenter tahu ia sedang di blok mana tanpa membuka silabus. */

  var AGENDA = [
    { at: 0, label: 'Orientasi, Colab, dan keamanan data pasien' },
    { at: 15, label: 'Dasar Python / 3 tugas visi komputer' },
    { at: 45, label: 'Citra sebagai array / telaah dataset & model card' },
    { at: 75, label: 'Istirahat dan checkpoint' },
    { at: 90, label: 'Bounding box & ROI / inferensi & confidence threshold' },
    { at: 115, label: 'Manipulasi kontras / evaluasi ground truth vs prediksi' },
    { at: 135, label: 'Latihan mandiri dan exit ticket' }
  ];

  /* --- Membangun slide --------------------------------------------------- */

  var LOGO = 'assets/ds/logo/logo-horizontal.png';
  var LOGO_PUTIH = 'assets/ds/logo/logo-horizontal-putih.png';
  var TAGLINE = 'MERAKYAT, MANDIRI, BERKELANJUTAN &nbsp;|&nbsp; INCLUSIVE, SELF-RELIANT, SUSTAINABLE';

  function footer(navy) {
    return '<div class="s-footer">' +
      '<div class="s-footer__block"><span class="s-url">ugm.ac.id</span></div>' +
      '<span class="s-tagline' + (navy ? ' s-tagline--light' : '') + '">' + TAGLINE + '</span>' +
      '</div>';
  }

  function build(s, i) {
    var wrap = document.createElement('div');
    wrap.className = 'slide-wrap';
    wrap.id = s.id;

    var layout = s.layout || 'content';
    var navy = layout === 'title' || layout === 'separator' || layout === 'quote' ||
      layout === 'closing' || s.navy === true;

    var cls = ['slide'];
    if (navy) cls.push('slide--navy');
    if (s.paper) cls.push('slide--paper');
    if (layout !== 'content') cls.push('slide--' + layout);

    var html = '';

    /* Logo: kiri-atas pada slide judul/penutup, kanan-atas pada slide isi.
       Lambang (seal) tidak dipakai di mana pun - itu khusus ijazah dan SK. */
    if (layout === 'title' || layout === 'closing') {
      html += '<img class="s-logo--tl" src="' + (navy ? LOGO_PUTIH : LOGO) +
        '" alt="Universitas Gadjah Mada">';
    } else if (layout !== 'separator') {
      html += '<img class="s-logo" src="' + (navy ? LOGO_PUTIH : LOGO) +
        '" alt="Universitas Gadjah Mada">';
    }

    html += s.html || '';

    /* Header standar untuk slide isi. Slide judul/separator/kutipan menyusun
       headernya sendiri karena posisinya absolut dan berbeda. */
    if (layout === 'content') {
      var head = '';
      if (s.kicker) head += '<p class="s-kicker">' + s.kicker + '</p>';
      if (s.title) head += '<h2 class="s-h2' + (s.titleSm ? ' s-h2--sm' : '') + '">' + s.title + '</h2>';
      head += '<hr class="s-rule">';
      html = html.replace('<!--head-->', head);
      if (html.indexOf(head) === -1) html = head + html;
    }

    html += footer(navy);

    wrap.innerHTML = '<section class="' + cls.join(' ') + '" data-title="' +
      (s.title || s.label || '').replace(/<[^>]+>/g, '').replace(/"/g, '&quot;') + '">' +
      html + '</section>';

    return wrap;
  }

  function boot() {
    slides.forEach(function (s, i) {
      var wrap = build(s, i);
      built.push(wrap);
      stage.appendChild(wrap);
    });

    buildOverview();
    buildMenu();
    fitStage();

    var start = slideFromHash();
    show(start === -1 ? 0 : start, true);
    pokeNav();
  }

  /* --- Menampilkan slide -------------------------------------------------- */

  function show(i, initial) {
    if (i < 0 || i >= built.length) return;

    /* Widget dibuang saat slide ditinggalkan supaya tidak ada listener atau
       animasi yang menumpuk selama presentasi 150 menit. */
    if (!initial && i !== current) teardownWidget(current);

    built[current].classList.remove('is-active');
    current = i;
    built[current].classList.add('is-active');

    setupWidget(current);

    countEl.textContent = (i + 1) + ' / ' + built.length;
    progressEl.style.width = ((i + 1) / built.length * 100) + '%';

    var note = slides[i].notes;
    notesBody.innerHTML = note || '<span style="opacity:.55">Tidak ada catatan presenter untuk slide ini.</span>';

    Array.prototype.forEach.call(ovGrid.children, function (c) {
      if (c.classList.contains('ov__cell')) c.classList.remove('is-current');
    });
    var cell = ovGrid.querySelector('[data-i="' + i + '"]');
    if (cell) cell.classList.add('is-current');

    if (history.replaceState) history.replaceState(null, '', '#' + slides[i].id);
  }

  function slideFromHash() {
    var h = (location.hash || '').replace('#', '');
    if (!h) return -1;
    for (var i = 0; i < slides.length; i++) if (slides[i].id === h) return i;
    var n = parseInt(h, 10);
    if (!isNaN(n) && n >= 1 && n <= slides.length) return n - 1;
    return -1;
  }

  /* --- Widget ------------------------------------------------------------- */

  var activeWidget = null;

  function setupWidget(i) {
    var name = slides[i].widget;
    if (!name) return;
    var host = built[i].querySelector('[data-widget]');
    if (!host) return;
    var fn = widgets[name];
    if (typeof fn !== 'function') {
      console.warn('Widget tidak terdaftar: ' + name);
      return;
    }
    /* Widget yang gagal tidak boleh menjatuhkan deck di tengah kelas -
       slide tetap tampil dengan isi statis yang sudah ada di markup. */
    try {
      activeWidget = { i: i, teardown: fn(host) || null };
    } catch (err) {
      console.error('Widget "' + name + '" gagal dijalankan:', err);
      activeWidget = null;
    }
  }

  function teardownWidget(i) {
    if (activeWidget && activeWidget.i === i && typeof activeWidget.teardown === 'function') {
      try { activeWidget.teardown(); } catch (err) { console.error(err); }
    }
    activeWidget = null;
  }

  /* --- Penskalaan panggung ------------------------------------------------ */

  function fitStage() {
    var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    stage.style.transform = 'scale(' + s + ')';
  }

  /* --- Overview ----------------------------------------------------------- */

  function buildOverview() {
    var lastChapter = -1;
    slides.forEach(function (s, i) {
      if (s.chapter !== lastChapter) {
        lastChapter = s.chapter;
        var h = document.createElement('div');
        h.className = 'ov__chapter';
        h.textContent = CHAPTERS[s.chapter] ? CHAPTERS[s.chapter].label : 'Lain-lain';
        ovGrid.appendChild(h);
      }
      var cell = document.createElement('div');
      cell.className = 'ov__cell';
      cell.tabIndex = 0;
      cell.setAttribute('role', 'button');
      cell.setAttribute('data-i', i);
      cell.setAttribute('aria-label', 'Slide ' + (i + 1) + ': ' + (s.title || s.label || ''));

      var thumb = document.createElement('div');
      thumb.className = 'ov__thumb';
      thumb.innerHTML = built[i].innerHTML;
      cell.appendChild(thumb);

      var no = document.createElement('span');
      no.className = 'ov__no';
      no.textContent = i + 1;
      cell.appendChild(no);

      cell.addEventListener('click', function () { setOverview(false); show(i); });
      cell.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOverview(false); show(i); }
      });
      ovGrid.appendChild(cell);
    });
  }

  function scaleThumbs() {
    var cells = ovGrid.querySelectorAll('.ov__cell');
    if (!cells.length) return;
    var w = cells[0].clientWidth;
    if (!w) return;
    var s = w / 1280;
    Array.prototype.forEach.call(ovGrid.querySelectorAll('.ov__thumb'), function (t) {
      t.style.transform = 'scale(' + s + ')';
    });
  }

  function setOverview(on) {
    ovEl.classList.toggle('is-open', on);
    if (on) { scaleThumbs(); ovEl.scrollTop = 0; }
  }

  /* --- Menu bab ----------------------------------------------------------- */

  function buildMenu() {
    CHAPTERS.forEach(function (c) {
      var first = -1;
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].chapter === c.id) { first = i; break; }
      }
      if (first === -1) return;
      var count = slides.filter(function (s) { return s.chapter === c.id; }).length;

      var b = document.createElement('button');
      b.className = 'menu__item';
      b.innerHTML = '<span class="menu__no">' + (first + 1) + '</span>' +
        '<span><b>' + c.label + '</b><span>' + c.desc + ' &middot; ' + count + ' slide</span></span>';
      b.addEventListener('click', function () { setMenu(false); show(first); });
      menuList.appendChild(b);
    });
  }

  function setMenu(on) { menuEl.classList.toggle('is-open', on); }

  /* --- Timer sesi --------------------------------------------------------- */

  var timerStart = null, timerTick = null, timerPaused = 0;

  function agendaFor(min) {
    var found = AGENDA[0];
    for (var i = 0; i < AGENDA.length; i++) if (min >= AGENDA[i].at) found = AGENDA[i];
    return found;
  }

  function renderTimer() {
    var ms = timerStart ? (Date.now() - timerStart) : timerPaused;
    var total = Math.floor(ms / 1000);
    var min = Math.floor(total / 60);
    var sec = total % 60;
    timerClock.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    var a = agendaFor(min);
    timerBlock.innerHTML = '<b>Menit ' + a.at + '+</b> &middot; ' + a.label;
    timerEl.classList.toggle('is-over', min >= 150);
  }

  function timerToggle() {
    if (timerStart) {
      timerPaused = Date.now() - timerStart;
      timerStart = null;
      clearInterval(timerTick);
    } else {
      timerStart = Date.now() - timerPaused;
      timerTick = setInterval(renderTimer, 1000);
    }
    renderTimer();
  }

  function timerReset() {
    clearInterval(timerTick);
    timerStart = null; timerPaused = 0;
    renderTimer();
  }

  /* --- Nav auto-hide ------------------------------------------------------ */

  var navHide = null;
  function pokeNav() {
    navEl.classList.add('is-visible');
    clearTimeout(navHide);
    navHide = setTimeout(function () { navEl.classList.remove('is-visible'); }, 2600);
  }

  /* --- Peristiwa ---------------------------------------------------------- */

  function overlayOpen() {
    return ovEl.classList.contains('is-open') ||
      menuEl.classList.contains('is-open') ||
      helpEl.classList.contains('is-open');
  }

  function closeOverlays() {
    setOverview(false); setMenu(false); helpEl.classList.remove('is-open');
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    /* Escape ditangani sebelum penjaga overlay supaya selalu bisa keluar. */
    if (e.key === 'Escape') { closeOverlays(); return; }

    var k = e.key.toLowerCase();

    if (k === 'o') { e.preventDefault(); setMenu(false); setOverview(!ovEl.classList.contains('is-open')); return; }
    if (k === 'm') { e.preventDefault(); setOverview(false); setMenu(!menuEl.classList.contains('is-open')); return; }
    if (k === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); helpEl.classList.toggle('is-open'); return; }
    if (k === 'n') { e.preventDefault(); notesEl.classList.toggle('is-open'); return; }
    if (k === 't') {
      e.preventDefault();
      var open = timerEl.classList.toggle('is-open');
      if (open && !timerStart && !timerPaused) timerToggle();
      renderTimer();
      return;
    }
    if (k === 'f') {
      e.preventDefault();
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
      return;
    }

    if (overlayOpen()) return;

    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Enter':
        e.preventDefault(); show(current + 1); pokeNav(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace':
        e.preventDefault(); show(current - 1); pokeNav(); break;
      case 'Home':
        e.preventDefault(); show(0); pokeNav(); break;
      case 'End':
        e.preventDefault(); show(built.length - 1); pokeNav(); break;
    }
  });

  /* Klik di sepertiga kiri / kanan layar untuk maju-mundur, supaya presenter
     bisa menyetir dengan mouse atau clicker tanpa mencari tombol. Klik pada
     kontrol widget di tengah tidak terganggu. */
  document.addEventListener('click', function (e) {
    if (overlayOpen() || notesEl.contains(e.target)) return;
    if (e.target.closest('button, a, input, select, textarea, [data-widget], .nav, .timer')) return;
    if (e.clientX > window.innerWidth * 0.68) show(current + 1);
    else if (e.clientX < window.innerWidth * 0.32) show(current - 1);
  });

  document.addEventListener('mousemove', pokeNav);
  window.addEventListener('resize', function () { fitStage(); scaleThumbs(); });
  window.addEventListener('hashchange', function () {
    var i = slideFromHash();
    if (i !== -1 && i !== current) show(i);
  });

  document.getElementById('navPrev').addEventListener('click', function () { show(current - 1); });
  document.getElementById('navNext').addEventListener('click', function () { show(current + 1); });
  document.getElementById('navOv').addEventListener('click', function () { setOverview(true); });
  document.getElementById('navMenu').addEventListener('click', function () { setMenu(true); });
  document.getElementById('navNotes').addEventListener('click', function () { notesEl.classList.toggle('is-open'); });
  document.getElementById('navHelp').addEventListener('click', function () { helpEl.classList.add('is-open'); });
  document.getElementById('timerToggle').addEventListener('click', timerToggle);
  document.getElementById('timerReset').addEventListener('click', timerReset);
  ovEl.addEventListener('click', function (e) { if (e.target === ovEl) setOverview(false); });
  menuEl.addEventListener('click', function (e) { if (e.target === menuEl) setMenu(false); });
  helpEl.addEventListener('click', function (e) { if (e.target === helpEl) helpEl.classList.remove('is-open'); });

  /* Saat mencetak semua slide dirender berurutan; widget dibiarkan di
     default state supaya PDF selalu memperlihatkan sesuatu yang benar. */
  window.addEventListener('beforeprint', function () { closeOverlays(); notesEl.classList.remove('is-open'); });

  boot();
})();

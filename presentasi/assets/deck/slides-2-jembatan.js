/* Jembatan - benang merah yang menyambungkan Sesi 1 dan Sesi 2.
   Sumber: bagian 3 ringkasan-materi-kuliah.md. */

(function () {
  'use strict';
  var D = (window.DECK = window.DECK || []);

  /* ----------------------------------------------------------------- J-01 */

  (function () {
    /* Empat pasangan konsep. Kiri = yang dipelajari Sesi 1, kanan = tempat
       konsep yang sama muncul kembali di Sesi 2. */
    var links = [
      ['Citra = matriks piksel', '[y, x]',
       'Masukan model = matriks citra RGB', '640 &times; 640'],
      ['Bounding box ROI', '[x1, y1, x2, y2]',
       'Keluaran model = koordinat prediksi', '[x1, y1, x2, y2]'],
      ['Pemotongan array (slicing)', '[y1:y2, x1:x2]',
       'Evaluasi IoU = irisan antarkotak', 'irisan / gabungan'],
      ['Skeptisisme kontras & CLAHE', 'tampilan visual &ne; informasi baru',
       'Skeptisisme prediksi, XAI, & domain shift', 'skor keyakinan &ne; kebenaran klinis']
    ];

    var ROW_H = 88, TOP = 54;
    var rows = links.map(function (l, i) {
      var y = TOP + i * ROW_H;
      return (
        /* Kartu kiri */
        '<rect x="0" y="' + y + '" width="452" height="70" rx="8" ' +
        'fill="#EAF0F5" stroke="#CBDAE6"/>' +
        '<text x="20" y="' + (y + 30) + '" font-size="16.5" font-weight="700" fill="#01416B">' +
        l[0] + '</text>' +
        '<text x="20" y="' + (y + 53) + '" font-size="14" ' +
        'font-family="ui-monospace,Consolas,monospace" fill="#4D7A9E">' + l[1] + '</text>' +

        /* Panah */
        '<path d="M466 ' + (y + 35) + ' h230" stroke="#FDD402" stroke-width="4"/>' +
        '<path d="M700 ' + (y + 35) + ' l-14 -8 v16 z" fill="#FDD402"/>' +

        /* Kartu kanan */
        '<rect x="714" y="' + y + '" width="458" height="70" rx="8" ' +
        'fill="#01416B"/>' +
        '<text x="734" y="' + (y + 30) + '" font-size="16.5" font-weight="700" fill="#FFFFFF">' +
        l[2] + '</text>' +
        '<text x="734" y="' + (y + 53) + '" font-size="14" ' +
        'font-family="ui-monospace,Consolas,monospace" fill="#FDD402">' + l[3] + '</text>'
      );
    }).join('');

    D.push({
      id: 'j-01',
      chapter: 2,
      kicker: 'Benang merah antarsesi',
      title: 'Empat Konsep Sesi 1 yang Menjadi Landasan di Sesi 2',
      notes: 'SLIDE PENGHUBUNG. Jika Sesi 2 diselenggarakan pada hari yang berbeda, awali pertemuan dari ' +
        'slide ini. Tunjukkan bahwa: <em>seluruh pemahaman yang telah Anda kuasai pada pertemuan sebelumnya ' +
        'akan langsung diterapkan kembali di sesi ini</em>, hanya sudut pandangnya yang ditingkatkan ke ranah audit model AI.',
      html:
        '<div class="s-body">' +
        '<svg class="dg dg--fit" viewBox="0 0 1172 420" preserveAspectRatio="xMidYMid meet" ' +
        'role="img" aria-label="Empat konsep Sesi 1 dipetakan ke padanannya di Sesi 2">' +
        '<text x="0" y="24" font-size="13" font-weight="700" fill="#55585B" ' +
        'letter-spacing="1.6">SESI 1 &middot; FONDASI CITRA DIGITAL</text>' +
        '<text x="714" y="24" font-size="13" font-weight="700" fill="#55585B" ' +
        'letter-spacing="1.6">SESI 2 &middot; AUDIT DETEKSI AI DAN XAI</text>' +
        rows +
        '</svg></div>'
    });
  })();

  /* ----------------------------------------------------------------- J-02 */

  D.push({
    id: 'j-02',
    chapter: 2,
    kicker: 'Pergeseran paradigma berpikir',
    title: 'Dari Algoritma Deterministik Menuju Model Probabilistik yang Wajib Diaudit',
    notes: 'Inilah perbedaan mendasar yang paling sering terlewat oleh klinisi. Metode CLAHE selalu ' +
      'memberikan keluaran identik untuk masukan yang sama secara deterministik. Sebaliknya, model AI menghasilkan ' +
      '<em>skor probabilitas</em>, dan skor tersebut sangat bergantung pada distribusi data latih yang berada di luar kendali Anda.',
    html:
      '<div class="s-body"><div class="grid2" style="gap:24px">' +

      '<div class="card card--tint" style="gap:14px">' +
      '<p class="card__k">Sesi 1 &middot; Pengolahan citra digital klasik</p>' +
      '<p class="card__t">Deterministik</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Berlandaskan aturan matematika baku yang pasti dan eksplisit.</li>' +
      '<li>Masukan yang sama pasti menghasilkan keluaran yang persis sama.</li>' +
      '<li>Setiap langkah transformasi dapat ditelusuri dan dihitung manual.</li>' +
      '<li>Tidak melibatkan konsep &ldquo;keyakinan&rdquo; &mdash; murni kalkulasi nilai piksel.</li>' +
      '</ul>' +
      '<div class="note mt" style="background:var(--white);border-color:var(--ugm-blue-100)">' +
      '<p class="note__t">Pertanyaan kunci audit</p>' +
      '<p>&ldquo;Apakah parameter yang saya pilih sudah tepat, dan apakah manipulasi ini ' +
      'memunculkan distorsi artefak pada citra?&rdquo;</p></div>' +
      '</div>' +

      '<div class="card card--navy" style="gap:14px">' +
      '<p class="card__k">Sesi 2 &middot; Visi komputer dan AI modern</p>' +
      '<p class="card__t">Probabilistik</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Pola hubungan dipelajari dari data latih, bukan dirumuskan manual oleh manusia.</li>' +
      '<li>Keluaran berbentuk skor keyakinan statistik, bukan kepastian biologis mutlak.</li>' +
      '<li>Logika penalaran internal model sulit diinterpretasi secara transparan (black-box).</li>' +
      '<li>Akurasi deteksi sangat bergantung pada karakteristik data yang pernah dipelajari model.</li>' +
      '</ul>' +
      '<div class="note note--navy mt" style="background:var(--ugm-blue-deep);border-color:var(--ugm-blue-deep)">' +
      '<p class="note__t">Pertanyaan kunci audit</p>' +
      '<p>&ldquo;Karakteristik data apa yang digunakan untuk melatih model ini, dan apakah populasi pasien ' +
      'di klinik saya memiliki karakteristik serupa?&rdquo;</p></div>' +
      '</div>' +

      '</div></div>'
  });

})();

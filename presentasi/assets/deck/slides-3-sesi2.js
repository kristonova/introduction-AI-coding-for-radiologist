/* Bab 2 - Sesi 2: Implementasi Model AI dan Explainable AI (22 September 2026).
   Mengikuti urutan notebook Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb. */

(function () {
  'use strict';
  var D = (window.DECK = window.DECK || []);

  var ARROW = '<div class="flow__arrow"><svg viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M5 12h13M13 6l6 6-6 6"/></svg></div>';

  /* ---------------------------------------------------------------- S2-01 */

  D.push({
    id: 's2-01',
    chapter: 3,
    layout: 'separator',
    label: 'Bab 2',
    notes: 'Jika ini merupakan pertemuan kedua, awali dengan membuka slide Jembatan terlebih dahulu (tekan tombol M, lalu pilih menu Jembatan) sebelum memulai bab ini.',
    html:
      '<div class="s-sep-gold"></div><div class="s-sep-navy"></div>' +
      '<p class="s-kicker">Bab 2 &middot; Sesi 2 &middot; 22 September 2026</p>' +
      '<h2 class="s-h2">Implementasi Model AI dan Explainable AI</h2>' +
      '<p class="s-sub">&ldquo;Bagaimana model AI mendeteksi kelainan radiografis, dan bagaimana ' +
      'klinisi mengaudit kebenaran serta penalarannya secara kritis?&rdquo;</p>'
  });

  /* ---------------------------------------------------------------- S2-02 */

  D.push({
    id: 's2-02',
    chapter: 3,
    kicker: 'Capaian pembelajaran',
    title: 'Enam Kompetensi Audit Klinis yang Dilatih Hari Ini',
    notes: 'Cermati kata kerja operasional yang digunakan: <em>membedakan, menjelaskan, memodifikasi, mengevaluasi, menganalisis</em>. ' +
      'Tidak ada target &ldquo;membuat arsitektur model&rdquo;. Peran yang kita bangun adalah auditor klinis yang kritis, bukan teknisi pengembang software.',
    html:
      '<div class="s-body"><div class="row">' +
      '<div class="col col--wide">' +
      '<ol class="steps">' +
      '<li>Membedakan karakteristik luaran antara <i>classification</i>, <i>object detection</i>, dan <i>segmentation</i>.</li>' +
      '<li>Menganalisis isi <i>dataset card</i>, <i>model card</i>, pemisahan subset data latih&ndash;uji, serta batas <i>label space</i>.</li>' +
      '<li>Menjalankan detektor berbasis format ONNX di CPU serta memodifikasi nilai <code>CASE_ID</code> dan <code>CONF_THRESHOLD</code>.</li>' +
      '<li>Mengevaluasi temuan TP, FP, dan FN <b>hanya</b> pada kelas label yang memiliki padanan acuan yang valid.</li>' +
      '<li>Menghitung dan memvisualisasikan peta panas <i>occlusion sensitivity</i> melalui variasi parameter <code>OCCLUSION_GRID</code>.</li>' +
      '<li>Menjelaskan batasan nyata penerapan AI: risiko <i>domain shift</i>, ketidakcocokan ruang label, bahaya <i>automation bias</i>, regulasi privasi, dan pentingnya supervisi manusia.</li>' +
      '</ol></div>' +
      '<div class="col col--narrow">' +
      '<div class="card card--navy" style="height:100%">' +
      '<p class="card__k">Peran Anda hari ini</p>' +
      '<p class="card__t" style="color:var(--ugm-yellow)">Auditor kritis, bukan sekadar pengguna pasif</p>' +
      '<p class="card__d" style="font-size:16px">Model yang kita uji pada praktikum ini diperlakukan sebagai ' +
      '<b>artefak eksternal yang sedang diaudit</b> &mdash; bukan perangkat lunak siap pakai untuk diagnosis pasien.</p>' +
      '<p class="card__d mt" style="font-size:15px">Seluruh hasil deteksi dan skor pada sesi ini ' +
      'sama sekali tidak boleh diterapkan untuk pengambilan keputusan klinis pasien.</p>' +
      '</div></div>' +
      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-03 */

  D.push({
    id: 's2-03',
    chapter: 3,
    kicker: 'Tahap evaluasi mandiri (Menit 0–15)',
    title: 'Evaluasi Radiograf Secara Mandiri Sebelum Melihat Deteksi AI',
    notes: 'Terapkan langkah ini secara disiplin: tampilkan satu OPG, lalu minta peserta mencatat ' +
      'maksimal tiga temuan radiografis objektif dan satu aspek keraguan, <em>sebelum</em> ' +
      'model AI dijalankan. Tanpa langkah ini, sesi evaluasi selanjutnya akan kehilangan pembanding independen.',
    html:
      '<div class="s-body"><div class="stack" style="gap:18px;height:100%">' +

      '<div class="grid2" style="height:auto;gap:22px;flex:1;min-height:0">' +

      '<div class="card card--tint" style="gap:10px;padding:16px 18px">' +
      '<p class="card__k" style="color:var(--status-success)">Urutan evaluasi yang tepat</p>' +
      '<div class="flow flow--stack" style="gap:0">' +
      '<div class="flow__step" style="padding:11px 15px">' +
      '<p class="flow__t">1. Evaluasi mandiri oleh klinisi; catat dan kunci temuan terlebih dahulu</p></div>' +
      '<div class="flow__arrow">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></div>' +
      '<div class="flow__step" style="padding:11px 15px">' +
      '<p class="flow__t">2. Jalankan model AI setelah catatan klinisi tersimpan rapi</p></div>' +
      '<div class="flow__arrow">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></div>' +
      '<div class="flow__step flow__step--navy" style="padding:11px 15px">' +
      '<p class="flow__t">3. Jadikan perbedaan temuan sebagai bahan telaah ilmiah, bukan koreksi otomatis</p></div>' +
      '</div></div>' +

      '<div class="card" style="gap:10px;padding:16px 18px;border-color:#EAC5C5;background:var(--status-danger-surface)">' +
      '<p class="card__k" style="color:var(--status-danger)">Pola bahaya yang harus dihindari</p>' +
      '<p class="card__t" style="color:var(--status-danger)">Automation Bias</p>' +
      '<p class="card__d" style="font-size:16px">Melihat kotak deteksi AI terlebih dahulu, lalu pikiran secara tidak sadar ' +
      '&ldquo;mencari-cari pembenaran&rdquo; atas area yang ditunjuk. Evaluasi klinis Anda kehilangan independensi &mdash; dan patologi nyata di area lain yang ' +
      '<b>tidak ditandai</b> oleh AI justru cenderung luput dari pengamatan.</p>' +
      '<div class="note mt" style="background:var(--white);border-color:#EAC5C5">' +
      '<p class="note__t">Gunakan deskripsi radiografis objektif</p>' +
      '<p>&ldquo;Area radiolusen berbatas tegas pada mahkota gigi 75&rdquo; (deskripsi tanda radiografis objektif), ' +
      'bukan langsung menuliskan &ldquo;karies dentin profunda&rdquo; (kesimpulan interpretasi klinis).</p></div>' +
      '</div>' +

      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-04 */

  D.push({
    id: 's2-04',
    chapter: 3,
    widget: 'task-trio',
    kicker: 'Tinjauan konseptual (Menit 15–45)',
    title: 'Tiga Ragam Tugas Visi Komputer pada Radiograf yang Sama',
    notes: 'Klik ketiga tab tugas di atas radiograf yang sama. Garisbawahi poin utamanya: ' +
      '<em>format luaran model menentukan jenis pertanyaan klinis apa yang mampu dijawab</em>. ' +
      'Masking segmentasi pada slide ini digambar manual semata-mata sebagai ilustrasi perbandingan, bukan luaran model asli.',
    html:
      '<div class="s-body"><div class="wg" data-widget="task-trio"></div></div>'
  });

  /* ---------------------------------------------------------------- S2-05 */

  D.push({
    id: 's2-05',
    chapter: 3,
    widget: 'match-quiz',
    kicker: 'Latihan interaktif 3 menit',
    title: 'Menyelaraskan Kebutuhan Klinis dengan Pendekatan AI yang Tepat',
    notes: 'Beri waktu sejenak bagi peserta untuk berpikir dan berdiskusi sebelum membuka kunci jawaban. Jika seluruh peserta ' +
      'menjawab tepat, lanjutkan paparan; bila masih ada keraguan, ulas kembali slide sebelumnya.',
    html:
      '<div class="s-body"><div class="wg" data-widget="match-quiz"></div></div>'
  });

  /* ---------------------------------------------------------------- S2-06 */

  D.push({
    id: 's2-06',
    chapter: 3,
    widget: 'label-space',
    kicker: 'Konsep kunci evaluasi',
    title: 'Ruang Label: Model AI Hanya Mengenali Apa yang Pernah Dilatihkan',
    notes: 'Arahkan kursor ke temuan di luar kamus model. Beri penekanan: ' +
      '<em>model tidak akan pernah memunculkan notifikasi &ldquo;saya tidak tahu&rdquo;</em>. ' +
      'Ia hanya akan diam. Sikap diam model bukanlah bukti bahwa rahang pasien bebas dari kelainan patologis.',
    html:
      '<div class="s-body"><div class="wg" data-widget="label-space"></div></div>'
  });

  /* ---------------------------------------------------------------- S2-07 */

  D.push({
    id: 's2-07',
    chapter: 3,
    kicker: 'Audit dokumentasi model (Menit 45–75)',
    title: 'Model Card: Dokumen Spesifikasi dan Rekam Jejak Model',
    notes: 'Arahkan perhatian peserta pada baris lisensi: berkas model card mencantumkan lisensi CC BY-NC 4.0, sedangkan ' +
      'metadata di dalam berkas ONNX memuat lisensi AGPL-3.0. Keduanya disajikan secara transparan apa adanya. ' +
      '<em>Ketidakjelasan klausul lisensi software itu sendiri merupakan temuan penting dalam audit teknologi.</em>',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide">' +
      '<div class="card card--navy" style="height:100%;gap:14px">' +
      '<p class="card__k">Spesifikasi teknis model yang diaudit</p>' +
      '<dl class="kv" style="font-size:14.5px;gap:5px 14px">' +
      '<dt>Repositori</dt><dd class="mono">liodon-ai/dental-panoramic-detector</dd>' +
      '<dt>Berkas</dt><dd class="mono">best.onnx</dd>' +
      '<dt>Revisi</dt><dd class="mono" style="font-size:13.5px">8bef2036b099e80e51f93f24de4b0c0edd366256</dd>' +
      '<dt>SHA-256</dt><dd class="mono" style="font-size:13.5px">4cee38b54203634d895ed30a8910f5d7c4cefe22b18f9116b5561d9dd6e83a71</dd>' +
      '<dt>Format masukan</dt><dd>RGB <i>letterbox</i> 640 &times; 640, nilai padding 114</dd>' +
      '<dt>Mesin eksekusi</dt><dd>ONNX Runtime 1.27.0 &middot; CPU &middot; satu utas (deterministik)</dd>' +
      '<dt>Kelas deteksi</dt><dd class="mono">caries &middot; periapical_lesion &middot; impacted_tooth</dd>' +
      '<dt>Batas NMS IoU</dt><dd class="mono">0,35 (konstan)</dd>' +
      '</dl>' +
      '<div class="note note--navy mt" style="background:var(--ugm-blue-deep);border-color:var(--ugm-blue-deep)">' +
      '<p class="note__t">Klausul lisensi yang tidak konsisten</p>' +
      '<p>Dokumentasi model card mencantumkan <b>CC BY-NC 4.0</b>, sedangkan metadata internal ' +
      'berkas ONNX memuat lisensi <b>Ultralytics AGPL-3.0</b>. Materi praktikum ini ' +
      'membatasi penggunaan murni untuk kegiatan edukasi akademik nonkomersial dan tidak ' +
      'mendistribusikan ulang bobot model.</p></div>' +
      '</div></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card card--tint" style="padding:15px 17px">' +
      '<p class="card__k">Dataset card &middot; Data acuan</p>' +
      '<p class="card__d" style="font-size:15px"><b>Children’s Dental Panoramic ' +
      'Radiographs Dataset</b>, subset panoramik anak, kelompok uji (<i>Test split</i>). Lisensi publik CC0 1.0. ' +
      'Empat kasus telah dipaketkan untuk bahan praktikum.</p>' +
      '</div>' +
      '<div class="note" style="flex:1;padding:14px 16px">' +
      '<p class="note__t">Pertanyaan wajib dalam audit dataset</p>' +
      '<ul class="bullets bullets--sm" style="margin-top:6px;gap:8px;font-size:15px">' +
      '<li>Siapa karakteristik demografi pasien dan berapa rentang usianya?</li>' +
      '<li>Merek dan spesifikasi mesin rontgen apa yang digunakan untuk perekaman?</li>' +
      '<li>Siapa tim ahli yang melakukan anotasi batas lesi?</li>' +
      '<li>Apakah data uji benar-benar terisolasi penuh dari data latih (bebas data leakage)?</li>' +
      '</ul>' +
      '<p class="disclaimer" style="margin-top:8px">Aspek yang belum terjawab merupakan ' +
      'faktor risiko teknis yang harus selalu diwaspadai klinisi.</p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-08 */

  D.push({
    id: 's2-08',
    chapter: 3,
    kicker: 'Tahap pra-pemrosesan citra',
    title: 'Penyesuaian Resolusi dan Dimensi Sebelum Citra Masuk ke Model',
    notes: 'Tahapan yang sering luput dari perhatian, padahal sangat penting: model tidak pernah memproses radiograf panoramik ' +
      'dalam resolusi aslinya. Model menerima citra berukuran 640 &times; 640 piksel yang telah diperkecil dan ' +
      'ditambahkan bantalan (padding) abu-abu. Detail struktur mikro anatomis dapat terdegradasi pada tahap ini.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide stack" style="gap:16px">' +
      '<div class="flow">' +
      '<div class="flow__step flow__step--tint">' +
      '<p class="flow__k">Masukan</p><p class="flow__t">2000 &times; 942</p>' +
      '<p class="flow__d">OPG resolusi asli, rasio aspek 2,12 : 1</p></div>' +
      ARROW +
      '<div class="flow__step">' +
      '<p class="flow__k">Skala proporsional</p><p class="flow__t">640 &times; 301</p>' +
      '<p class="flow__d">Rasio dijaga ketat agar bentuk anatomi tidak terdistorsi</p></div>' +
      ARROW +
      '<div class="flow__step flow__step--accent">' +
      '<p class="flow__k">Letterbox</p><p class="flow__t">640 &times; 640</p>' +
      '<p class="flow__d">Sisa ruang kosong diisi warna abu-abu netral (nilai 114)</p></div>' +
      '</div>' +
      '<div class="note">' +
      '<p class="note__t">Pentingnya proses pemetaan balik koordinat (Reverse Mapping)</p>' +
      '<p>Model AI mendeteksi dan menghasilkan koordinat kotak pada ruang kerja 640 &times; 640. Agar bounding box ' +
      'tersebut dapat digambar tepat di atas radiograf asli, koordinat tersebut harus dikurangi bantalan padding terlebih dahulu, ' +
      'lalu dibagi dengan faktor skala perbesaran. Kesalahan perhitungan matematika pada tahap ini akan menyebabkan ' +
      'kotak prediksi tampak meleset dari posisi lesi yang sebenarnya.</p>' +
      '</div></div>' +

      '<div class="col col--narrow">' +
      '<div class="fig fig--grow">' +
      '<div class="fig__frame"><img src="assets/figures/f6-letterbox-640.png" ' +
      'alt="OPG yang telah diskalakan ke dalam kanvas 640 kali 640 dengan bantalan abu di atas dan bawah"></div>' +
      '<p class="figcap">Tampilan visual yang sesungguhnya diproses oleh model. Area abu-abu di bagian atas dan bawah ' +
      'merupakan <b>bantalan komputasi (padding)</b>, bukan bagian dari anatomi pasien.</p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-09 */

  D.push({
    id: 's2-09',
    chapter: 3,
    kicker: 'Alur inferensi deteksi',
    title: 'Dari Matriks Citra Menuju Penetapan Bounding Box Final',
    notes: 'Proses ini melewati dua tahap penyaringan bertingkat: ambang batas keyakinan menyaring kandidat ' +
      'kotak berskor rendah, sedangkan algoritma NMS mengeliminasi kotak ganda yang saling bertumpuk pada objek yang sama. ' +
      'Peserta hanya mengeksplorasi parameter ambang keyakinan, sementara nilai NMS dikunci pada 0,35.',
    html:
      '<div class="s-body"><div class="stack" style="gap:18px;height:100%">' +

      '<div class="flow">' +
      '<div class="flow__step flow__step--tint">' +
      '<p class="flow__k">1</p><p class="flow__t">Citra 640 &times; 640</p>' +
      '<p class="flow__d">Matriks numerik terstandarisasi, persis seperti bahasan Sesi 1</p></div>' +
      ARROW +
      '<div class="flow__step">' +
      '<p class="flow__k">2</p><p class="flow__t">Ribuan kandidat</p>' +
      '<p class="flow__d">Setiap kandidat: koordinat kotak + kelas + skor keyakinan</p></div>' +
      ARROW +
      '<div class="flow__step flow__step--accent">' +
      '<p class="flow__k">3 &middot; yang Anda ubah</p><p class="flow__t">Ambang keyakinan</p>' +
      '<p class="flow__d">Mengeliminasi kandidat dengan skor di bawah <code>CONF_THRESHOLD</code></p></div>' +
      ARROW +
      '<div class="flow__step">' +
      '<p class="flow__k">4 &middot; dikunci 0,35</p><p class="flow__t">NMS IoU</p>' +
      '<p class="flow__d">Menghapus kotak-kotak redundan yang bertumpuk pada objek yang sama</p></div>' +
      ARROW +
      '<div class="flow__step flow__step--navy">' +
      '<p class="flow__k">5</p><p class="flow__t">Bounding box final</p>' +
      '<p class="flow__d">Kotak hasil seleksi akhir yang ditampilkan di layar</p></div>' +
      '</div>' +

      '<div class="row" style="flex:1;min-height:0;gap:22px">' +
      '<div class="col col--wide">' +
      '<svg class="dg dg--fit" viewBox="0 0 640 230" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Non-maximum suppression: empat kotak bertindih disederhanakan menjadi satu">' +
      '<text x="0" y="18" font-size="13" font-weight="700" fill="#55585B" ' +
      'letter-spacing="1.4">SEBELUM NMS</text>' +
      '<rect x="14" y="44" width="150" height="120" fill="none" stroke="#4D7A9E" stroke-width="2"/>' +
      '<rect x="30" y="52" width="150" height="120" fill="none" stroke="#4D7A9E" stroke-width="2"/>' +
      '<rect x="22" y="36" width="150" height="120" fill="none" stroke="#4D7A9E" stroke-width="2"/>' +
      '<rect x="40" y="60" width="150" height="120" fill="none" stroke="#4D7A9E" stroke-width="2"/>' +
      '<text x="14" y="200" font-size="14" fill="#55585B">Empat kandidat mendeteksi objek yang sama</text>' +
      '<text x="14" y="220" font-size="14" fill="#55585B">Skor: 0,71 &middot; 0,66 &middot; 0,58 &middot; 0,44</text>' +

      '<path d="M250 104 h84" stroke="#FDD402" stroke-width="4"/>' +
      '<path d="M338 104 l-14 -8 v16 z" fill="#FDD402"/>' +
      '<text x="252" y="92" font-size="13" font-weight="700" fill="#8a6d00">IoU &gt; 0,35</text>' +

      '<text x="380" y="18" font-size="13" font-weight="700" fill="#55585B" ' +
      'letter-spacing="1.4">SESUDAH NMS</text>' +
      '<rect x="396" y="36" width="150" height="120" fill="rgba(1,65,107,.10)" ' +
      'stroke="#01416B" stroke-width="3"/>' +
      '<text x="396" y="200" font-size="14" fill="#55585B">Satu kotak terbaik dipertahankan</text>' +
      '<text x="396" y="220" font-size="14" fill="#01416B" font-weight="700">Skor tertinggi: 0,71</text>' +
      '</svg></div>' +
      '<div class="col col--narrow">' +
      '<div class="note" style="height:100%">' +
      '<p class="note__t">Poin penting yang wajib diingat</p>' +
      '<p>Banyaknya kotak yang muncul di layar <b>bukanlah</b> representasi total kandidat yang dianalisis oleh model. ' +
      'Itu hanyalah sisa seleksi dari dua tahap filter. Mengubah angka threshold sama sekali tidak membuat model ' +
      '&ldquo;lebih cerdas&rdquo; &mdash; tindakan tersebut hanya menggeser batas garis seleksi pada daftar ' +
      'prediksi yang sudah dihitung.</p></div>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-10 */

  D.push({
    id: 's2-10',
    chapter: 3,
    widget: 'threshold-slider',
    kicker: 'Slide kunci Sesi 2 &middot; Menit 90–115',
    title: 'Pengaruh Ambang Keyakinan terhadap Tampilan Hasil Deteksi',
    notes: 'INTI PRAKTIKUM SESI 2. Ganti kasus radiograf, lalu geser nilai ambang keyakinan antara 0,25 &harr; 0,45. ' +
      'Ajak peserta menghitung sendiri perubahan drastis pada jumlah kotak deteksi. Pada kasus ' +
      '<code>test_cate1_004</code>, jumlah kotak berkurang drastis dari 12 menjadi tinggal 3. ' +
      'Tanyakan secara kritis: <em>siapa pihak yang paling berwenang menentukan nilai ambang keyakinan yang tepat untuk standar pelayanan di klinik Anda?</em>',
    html:
      '<div class="s-body"><div class="wg" data-widget="threshold-slider"></div></div>'
  });

  /* ---------------------------------------------------------------- S2-11 */

  D.push({
    id: 's2-11',
    chapter: 3,
    kicker: 'Kompromi Sensitivitas dan Spesifisitas',
    title: 'Tidak Ada Satu Nilai Ambang yang Sempurna untuk Semua Skenario',
    notes: 'Gunakan analogi klinis yang familiar: ini setara dengan trade-off ' +
      'sensitivitas dan spesifisitas pada kriteria diagnosis. Bedanya, di sini ' +
      'pergeseran garis batas ditentukan oleh sebuah parameter numerik di dalam kode.',
    html:
      '<div class="s-body"><div class="stack" style="gap:18px;height:100%">' +

      '<svg class="dg" viewBox="0 0 1172 200" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Garis kontinum ambang keyakinan dari rendah ke tinggi beserta konsekuensi klinisnya">' +
      '<line x1="60" y1="60" x2="1112" y2="60" stroke="#E3E5E7" stroke-width="6"/>' +
      '<line x1="60" y1="60" x2="1112" y2="60" stroke="#01416B" stroke-width="2"/>' +
      '<circle cx="330" cy="60" r="11" fill="#FDD402" stroke="#01416B" stroke-width="2.5"/>' +
      '<circle cx="800" cy="60" r="11" fill="#FDD402" stroke="#01416B" stroke-width="2.5"/>' +
      '<text x="330" y="38" font-size="16" font-weight="700" fill="#01416B" text-anchor="middle">0,25</text>' +
      '<text x="800" y="38" font-size="16" font-weight="700" fill="#01416B" text-anchor="middle">0,45</text>' +
      '<text x="60" y="90" font-size="13" font-weight="700" fill="#55585B" letter-spacing="1.4">AMBANG RENDAH</text>' +
      '<text x="1112" y="90" font-size="13" font-weight="700" fill="#55585B" ' +
      'letter-spacing="1.4" text-anchor="end">AMBANG TINGGI</text>' +

      '<rect x="60" y="108" width="480" height="76" rx="8" fill="#FAEAEA" stroke="#EAC5C5"/>' +
      '<text x="80" y="134" font-size="16" font-weight="700" fill="#A32020">Sensitivitas Tinggi (Lebih Banyak Kotak)</text>' +
      '<text x="80" y="158" font-size="14.5" fill="#55585B">Lesi kecil terminimalisasi dari risiko terlewat,</text>' +
      '<text x="80" y="176" font-size="14.5" fill="#55585B">namun temuan positif palsu (FP) meningkat signifikan.</text>' +

      '<rect x="632" y="108" width="480" height="76" rx="8" fill="#FAEAEA" stroke="#EAC5C5"/>' +
      '<text x="652" y="134" font-size="16" font-weight="700" fill="#A32020">Spesifisitas Tinggi (Lebih Sedikit Kotak)</text>' +
      '<text x="652" y="158" font-size="14.5" fill="#55585B">Hanya deteksi berkepastian tinggi yang tampil,</text>' +
      '<text x="652" y="176" font-size="14.5" fill="#55585B">namun risiko lesi nyata terlewat (negatif palsu / FN) meningkat.</text>' +
      '</svg>' +

      '<div class="grid3 grid--auto" style="flex:1;min-height:0">' +
      '<div class="card card--tint">' +
      '<p class="card__k">Skenario Skrining Awal</p>' +
      '<p class="card__d" style="font-size:16px">Konsekuensi melewatkan lesi jauh lebih berisiko ' +
      'dibanding memeriksa ulang positif palsu. Ambang batas diatur <b>cenderung lebih rendah</b>.</p></div>' +
      '<div class="card card--tint">' +
      '<p class="card__k">Skenario Konfirmasi / Triase Khusus</p>' +
      '<p class="card__d" style="font-size:16px">Positif palsu membebani alur kerja dan memicu kekhawatiran berlebih. ' +
      'Ambang batas diatur <b>cenderung lebih tinggi</b>.</p></div>' +
      '<div class="card card--navy">' +
      '<p class="card__k">Prinsip Kunci</p>' +
      '<p class="card__d" style="font-size:16px">Nilai ambang adalah ' +
      '<b>cerminan keputusan klinis</b> yang diformulasikan ke dalam angka &mdash; bukan ' +
      'sekadar setelan teknis yang netral.</p></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-12 */

  D.push({
    id: 's2-12',
    chapter: 3,
    widget: 'iou-lab',
    kicker: 'Menit 115–135',
    title: 'IoU: Mengukur Tingkat Tumpang-Tindih Prediksi terhadap Anotasi Acuan',
    notes: 'Ajak peserta menggeser kotak prediksi. Berhenti di sekitar IoU 0,50 ' +
      'untuk mendemonstrasikan bagaimana pergeseran beberapa piksel mengubah klasifikasi ' +
      'evaluasi dari True Positive (TP) menjadi False Positive (FP) + False Negative (FN). ' +
      '<em>Garis batas 0,50 adalah konvensi metrik, bukan batas alamiah mutlak.</em>',
    html:
      '<div class="s-body"><div class="wg" data-widget="iou-lab"></div></div>'
  });

  /* ---------------------------------------------------------------- S2-13 */

  D.push({
    id: 's2-13',
    chapter: 3,
    kicker: 'Audit 4 Kasus Evaluasi',
    title: 'Empat Kasus Praktikum Memperlihatkan Ragam Bentuk Kegagalan AI',
    notes: 'Urutan studi kasus pada notebook disusun bertahap untuk menyingkap ' +
      'berbagai variasi galat dan keterbatasan model di dunia nyata.',
    html:
      '<div class="s-body">' +
      '<table class="tbl" style="font-size:16.5px">' +
      '<thead><tr>' +
      '<th style="width:170px">Kasus</th>' +
      '<th style="width:210px">Fenomena / Temuan</th>' +
      '<th>Analisis &amp; Implikasi Evaluasi</th>' +
      '</tr></thead><tbody>' +

      '<tr><td class="num" style="font-weight:700;color:var(--ugm-blue)">test_cate1_004</td>' +
      '<td>Deteksi parsial</td>' +
      '<td>Dari 8 anotasi karies pada citra acuan, hanya 3 kotak yang bertahan pada ambang 0,45. ' +
      'Model hanya mengenali sebagian lesi, sementara karies yang tidak tertandai diabaikan ' +
      'tanpa peringatan tingkat ketidakpastian.</td></tr>' +

      '<tr><td class="num" style="font-weight:700;color:var(--ugm-blue)">test_cate1_012</td>' +
      '<td>Negatif palsu pada lesi periapikal</td>' +
      '<td>Terdapat anotasi periodontitis periapikal nyata. Amati pada ambang berapa kotak ' +
      'prediksi model hilang. Ini contoh klinis <i>false negative</i> (FN) yang paling berisiko ' +
      'luput dari perhatian.</td></tr>' +

      '<tr><td class="num" style="font-weight:700;color:var(--ugm-blue)">test_cate1_001</td>' +
      '<td>Anotasi di luar lingkup latih</td>' +
      '<td>Salah satu anotasi acuan adalah &ldquo;pit/fisur dalam&rdquo; yang ' +
      '<b>tidak</b> tercakup dalam kamus kelas model. Anotasi ini tidak boleh dihitung ' +
      'sebagai FN &mdash; model memang tidak pernah dilatih untuk mengenalinya.</td></tr>' +

      '<tr><td class="num" style="font-weight:700;color:var(--ugm-blue)">test_cate1_000</td>' +
      '<td>Miskomparasi ruang label</td>' +
      '<td>Kedua anotasi acuan berlabel &ldquo;Lainnya&rdquo;, yang tidak memiliki padanan ' +
      'dalam taksonomi kelas model. Seluruh kotak prediksi pada kasus ini tidak dapat divalidasi ' +
      'kebenarannya menggunakan skema anotasi yang tersedia.</td></tr>' +

      '</tbody></table>' +
      '<p class="disclaimer" style="margin-top:14px">Jumlah kotak prediksi merujuk pada ' +
      'hasil keluaran inferensi tersimpan yang disediakan dalam paket praktikum, bukan hasil ' +
      'komputasi langsung di slide browser ini.</p>' +
      '</div>'
  });

  /* ---------------------------------------------------------------- S2-14 */

  D.push({
    id: 's2-14',
    chapter: 3,
    kicker: 'Rigor Metrik Evaluasi',
    title: 'Prinsip Rigor: Tidak Semua Anotasi Valid Dihitung sebagai TP, FP, atau FN',
    notes: 'Poin krusial evaluasi saintifik: memasukkan label tak sepadan sebagai FN ' +
      'akan mendistorsi performa model menjadi tampak jauh lebih buruk dari aslinya, ' +
      'demikian pula sebaliknya jika kelas tak berpasangan diabaikan begitu saja.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide">' +
      '<table class="tbl tbl--sm" style="font-size:15.5px">' +
      '<thead><tr><th style="width:230px">Label anotasi acuan</th>' +
      '<th style="width:210px">Kelas model</th><th>Status evaluasi</th></tr></thead>' +
      '<tbody>' +
      '<tr><td>Karies</td><td class="num">caries</td>' +
      '<td><span class="chip chip--ok">Dapat dievaluasi secara valid</span></td></tr>' +
      '<tr><td>Periodontitis periapikal</td><td class="num">periapical_lesion</td>' +
      '<td><span class="chip chip--warn">Dapat dievaluasi (dengan catatan penyelarasan)</span></td></tr>' +
      '<tr><td>Pit/fisur dalam</td><td class="subtle">&mdash;</td>' +
      '<td><span class="chip chip--danger">Dikecualikan dari evaluasi</span></td></tr>' +
      '<tr><td>Lainnya</td><td class="subtle">&mdash;</td>' +
      '<td><span class="chip chip--danger">Dikecualikan dari evaluasi</span></td></tr>' +
      '<tr><td class="subtle">&mdash;</td><td class="num">impacted_tooth</td>' +
      '<td><span class="chip chip--danger">Tidak dapat dinilai (ketiadaan label acuan)</span></td></tr>' +
      '</tbody></table>' +
      '<div class="note" style="margin-top:12px">' +
      '<p class="note__t">Prinsip Dasar Perhitungan Metrik</p>' +
      '<p>Kotak prediksi hanya dapat dievaluasi secara objektif jika memiliki label acuan ' +
      'sepadan yang terdefinisi jelas. Tanpa padanan yang valid, prediksi harus dikategorikan ' +
      'sebagai <b>tidak dapat dinilai (out of scope)</b> &mdash; bukan serta-merta divonis sebagai galat model.</p>' +
      '</div></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card card--navy">' +
      '<p class="card__k">Konsekuensi Pelanggaran Rigor</p>' +
      '<p class="card__d" style="font-size:16px">Metrik akurasi yang dipublikasikan akan bias ' +
      'dan menyesatkan karena membandingkan dua taksonomi diagnosis yang tidak setara.</p></div>' +
      '<div class="card card--warm" style="flex:1">' +
      '<p class="card__k">Kasus Khusus: impacted_tooth</p>' +
      '<p class="card__d" style="font-size:16px">Model mampu mendeteksi gigi impaksi dan ' +
      'rutin menghasilkan prediksi, namun dataset acuan tidak menyertakan anotasi kelas ini. ' +
      'Seluruh prediksi <span class="mono">impacted_tooth</span> berada di luar lingkup evaluasi ' +
      '&mdash; tidak dapat divonis benar maupun salah.</p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-15 */

  D.push({
    id: 's2-15',
    chapter: 3,
    kicker: 'Tantangan Generalisasi Klinis',
    title: 'Domain Shift: Penurunan Kinerja Model di Luar Lingkungan Latih',
    notes: 'Kaitkan dengan realitas klinis harian: variasi pesawat rontgen, detektor ' +
      'sensor, protokol penyinaran, dan demografi pasien di RSGM sangat berbeda dari data ' +
      'pelatihan publik. <em>Tingkat akurasi dalam artikel jurnal tidak otomatis terefleksi di klinik kita.</em>',
    html:
      '<div class="s-body"><div class="stack" style="gap:18px;height:100%">' +

      '<svg class="dg" viewBox="0 0 1172 214" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Perbedaan antara kondisi data latih dan kondisi klinik penerapan">' +
      '<rect x="0" y="0" width="470" height="196" rx="8" fill="#EAF0F5" stroke="#CBDAE6"/>' +
      '<text x="22" y="32" font-size="13" font-weight="700" fill="#4D7A9E" ' +
      'letter-spacing="1.6">LINGKUNGAN DATA LATIH (TRAINING DOMAIN)</text>' +
      '<text x="22" y="64" font-size="16" fill="#2B2D2F">Demografi pasien tertentu (mis. pediatrik)</text>' +
      '<text x="22" y="92" font-size="16" fill="#2B2D2F">Unit radiografi dan sensor dari vendor tunggal</text>' +
      '<text x="22" y="120" font-size="16" fill="#2B2D2F">Protokol kVp/mA dan geometri terstandar ketat</text>' +
      '<text x="22" y="148" font-size="16" fill="#2B2D2F">Kriteria anotasi spesifik tim periset</text>' +
      '<text x="22" y="176" font-size="16" fill="#2B2D2F">Kontras dan ketajaman citra relatif seragam</text>' +

      '<path d="M494 98 h184" stroke="#A97400" stroke-width="4"/>' +
      '<path d="M682 98 l-14 -8 v16 z" fill="#A97400"/>' +
      '<text x="586" y="84" font-size="14" font-weight="700" fill="#A97400" ' +
      'text-anchor="middle">DOMAIN SHIFT</text>' +
      '<text x="586" y="126" font-size="13.5" fill="#55585B" text-anchor="middle">' +
      'risiko penurunan performa di populasi baru</text>' +

      '<rect x="702" y="0" width="470" height="196" rx="8" fill="#01416B"/>' +
      '<text x="724" y="32" font-size="13" font-weight="700" fill="#FDD402" ' +
      'letter-spacing="1.6">LINGKUNGAN KLINIK REALITAS (TARGET DOMAIN)</text>' +
      '<text x="724" y="64" font-size="16" fill="#FFFFFF">Demografi heterogen (dewasa dan anak)</text>' +
      '<text x="724" y="92" font-size="16" fill="#FFFFFF">Ragam vendor mesin panoramik dan sensor digital</text>' +
      '<text x="724" y="120" font-size="16" fill="#FFFFFF">Variasi dosis eksposur dan teknik radiografer</text>' +
      '<text x="724" y="148" font-size="16" fill="#FFFFFF">Perbedaan interpretasi dan batas klasifikasi</text>' +
      '<text x="724" y="176" font-size="16" fill="#FFFFFF">Distorsi posisi, pergerakan, dan superimposisi</text>' +
      '</svg>' +

      '<div class="row" style="flex:1;min-height:0;gap:20px">' +
      '<div class="col"><div class="note" style="height:100%">' +
      '<p class="note__t">Mengapa Fenomena Ini Berisiko?</p>' +
      '<p>Model AI tidak memiliki kesadaran untuk berhenti saat menerima data di luar distribusinya. ' +
      'Model akan tetap memunculkan kotak deteksi dengan skor keyakinan tinggi, sehingga penurunan ' +
      'performa terjadi <b>secara senyap tanpa peringatan sistem</b>.</p>' +
      '</div></div>' +
      '<div class="col"><div class="card card--tint" style="height:100%">' +
      '<p class="card__k">Langkah Mitigasi Klinis</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Lakukan validasi lokal mandiri pada sampel radiograf dari unit rontgen sendiri.</li>' +
      '<li>Bandingkan luaran AI terhadap konsensus pembacaan spesialis radiologi setempat.</li>' +
      '<li>Lakukan kalibrasi dan audit berkala saat terjadi pergantian alat atau protokol pencitraan.</li>' +
      '</ul></div></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-16 */

  D.push({
    id: 's2-16',
    chapter: 3,
    widget: 'occlusion-walk',
    kicker: 'Menit 135–150',
    title: 'Occlusion Sensitivity: Menguji Respon Model dengan Menutup Area Citra',
    notes: 'Jalankan simulasi interaktifnya. Prinsip XAI ini sangat intuitif: ' +
      '<em>apabila penutupan suatu blok piksel menyebabkan skor probabilitas anjlok, ' +
      'maka area tersebut memiliki kontribusi krusial terhadap prediksi model</em>.',
    html:
      '<div class="s-body"><div class="wg" data-widget="occlusion-walk"></div></div>'
  });

  /* ---------------------------------------------------------------- S2-17 */

  D.push({
    id: 's2-17',
    chapter: 3,
    kicker: 'Audit Kritis Peta Atribusi',
    title: 'Uji Stabilitas XAI: Penjelasan yang Berubah-ubah Menunjukkan Kerapuhan',
    notes: 'Uji sensitivitas resolusi ini membedakan XAI sejati dari visualisasi semu. ' +
      'Jika peta atribusi berubah drastis hanya karena ukuran grid diubah dari 4 ke 8, ' +
      'maka pola tersebut tidak cukup stabil untuk dijadikan acuan penalaran klinis.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide">' +
      '<div class="fig fig--grow">' +
      '<div class="fig__frame"><img src="assets/figures/f7-oklusi-grid6.png" ' +
      'alt="Peta panas occlusion sensitivity pada kasus test_cate1_004 dengan grid 6 kali 6"></div>' +
      '<p class="figcap">Studi kasus <b>test_cate1_004</b> pada parameter <span class="mono">OCCLUSION_GRID = 6</span> ' +
      '(arsip visualisasi inferensi praktikum).</p>' +
      '</div></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card card--warm" style="padding:14px 16px">' +
      '<p class="card__k">Metode Uji Stabilitas Resolusi</p>' +
      '<p class="card__d" style="font-size:15px">Uji komparasi dengan variasi ' +
      '<span class="mono">OCCLUSION_GRID</span> = <b>4</b>, <b>6</b>, dan <b>8</b>. ' +
      'Perhatikan apakah area beratribusi tinggi tetap konsisten. Jika pola berpindah liar, ' +
      'visualisasi tersebut lebih mencerminkan artefak partisi grid dibanding representasi fitur anatomis.</p>' +
      '</div>' +
      '<div class="card" style="flex:1;padding:14px 16px;border-color:#EAC5C5;' +
      'background:var(--status-danger-surface)">' +
      '<p class="card__k" style="color:var(--status-danger)">Kekeliruan Interpretasi Peta Atribusi</p>' +
      '<ul class="bullets bullets--sm" style="gap:7px;font-size:15px">' +
      '<li>&ldquo;Area bersuhu tinggi (merah) pasti lokasi lesi patologis.&rdquo;</li>' +
      '<li>&ldquo;Area bersuhu rendah (biru) terkonfirmasi bebas dari kelainan.&rdquo;</li>' +
      '<li>&ldquo;Peta atribusi mencerminkan penalaran klinis biologis model.&rdquo;</li>' +
      '</ul>' +
      '<p class="card__d" style="font-size:14.5px">Fakta teknis yang terukur semata-mata adalah: ' +
      '<b>penurunan nilai probabilitas ketika blok area tertentu ditutup pada resolusi grid tersebut.</b></p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-18 */

  D.push({
    id: 's2-18',
    chapter: 3,
    kicker: 'Panduan Tata Kelola Klinis',
    title: 'Enam Prinsip Kritis untuk Mencegah Salah Tafsir Luaran AI',
    notes: 'Tegaskan poin-poin fundamental ini secara bertahap. Aspek tata kelola ' +
      'dan pemahaman batasan teknologi inilah warisan kompetensi utama yang harus melekat ' +
      'pada setiap dokter spesialis radiologi.',
    html:
      '<div class="s-body"><div class="grid2" style="gap:18px">' +
      '<div class="stack" style="gap:16px">' +
      '<div class="card card--tint"><p class="card__d" style="font-size:18px;color:var(--text-body)">' +
      '<b>1.</b> Skor probabilitas model bukan representasi estimasi risiko personal pasien.</p></div>' +
      '<div class="card card--tint"><p class="card__d" style="font-size:18px;color:var(--text-body)">' +
      '<b>2.</b> Kotak deteksi (bounding box) tidak merefleksikan etiologi patologis lesi.</p></div>' +
      '<div class="card card--tint"><p class="card__d" style="font-size:18px;color:var(--text-body)">' +
      '<b>3.</b> <i>Heatmap</i> atribusi hanya mencerminkan sensitivitas perturbasi piksel ' +
      'pada konfigurasi tertentu, bukan bukti diagnostik mutlak.</p></div>' +
      '</div>' +
      '<div class="stack" style="gap:16px">' +
      '<div class="card card--tint"><p class="card__d" style="font-size:18px;color:var(--text-body)">' +
      '<b>4.</b> Kesesuaian dengan anotasi dataset latih tidak setara dengan bukti validasi klinis prospektif.</p></div>' +
      '<div class="card card--tint"><p class="card__d" style="font-size:18px;color:var(--text-body)">' +
      '<b>5.</b> Variasi dataset, taksonomi label, spesifikasi alat, dan demografi populasi ' +
      'dapat berbeda signifikan dari data pelatihan awal.</p></div>' +
      '<div class="card card--navy"><p class="card__d" style="font-size:18px;color:var(--white)">' +
      '<b>6.</b> Setiap luaran komputasi wajib ditelaah melalui pertimbangan klinis dan supervisi independen dokter penanggung jawab.</p></div>' +
      '</div>' +
      '</div></div>'
  });

  /* ---------------------------------------------------------------- S2-19 */

  D.push({
    id: 's2-19',
    chapter: 3,
    kicker: 'Sintesis Peran Klinis',
    title: 'AI Berperan sebagai Pembaca Kedua, Bukan Pengambil Keputusan Klinis',
    notes: 'Tutup dengan menegaskan asas akuntabilitas medikolegal: algoritma tidak ' +
      'dapat memikul tanggung jawab hukum dan etika medis; dokter penanggung jawablah yang ' +
      'berwenang. Keterampilan audit yang dipelajari menjadi proteksi profesional Anda.',
    html:
      '<div class="s-body"><div class="stack" style="gap:20px;height:100%">' +

      '<div class="flow">' +
      '<div class="flow__step flow__step--tint">' +
      '<p class="flow__k">Langkah 1</p><p class="flow__t">Interpretasi Mandiri</p>' +
      '<p class="flow__d">Pembacaan radiograf mandiri tanpa bias asistensi algoritma</p></div>' +
      ARROW +
      '<div class="flow__step">' +
      '<p class="flow__k">Langkah 2</p><p class="flow__t">Telaah AI (Pembaca Kedua)</p>' +
      '<p class="flow__d">Model menandai area kandidat untuk verifikasi ulang</p></div>' +
      ARROW +
      '<div class="flow__step">' +
      '<p class="flow__k">Langkah 3</p><p class="flow__t">Evaluasi Diskrepansi</p>' +
      '<p class="flow__d">Setiap perbedaan interpretasi dianalisis secara kritis</p></div>' +
      ARROW +
      '<div class="flow__step flow__step--navy">' +
      '<p class="flow__k">Langkah 4</p><p class="flow__t">Keputusan Klinis Final</p>' +
      '<p class="flow__d">Validasi klinis, penetapan diagnosis, dan legalitas resume medik</p></div>' +
      '</div>' +

      '<div class="row" style="flex:1;min-height:0;gap:20px">' +
      '<div class="col"><div class="card card--tint" style="height:100%">' +
      '<p class="card__k">Kelebihan Kapabilitas AI</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Konsistensi tinggi &mdash; bebas dari kelelahan fisik dan fluktuasi fokus.</li>' +
      '<li>Pemrosesan komputasi cepat pada volume data yang masif.</li>' +
      '<li>Efektif sebagai penyaring awal untuk menandai area potensi lesi.</li>' +
      '</ul></div></div>' +
      '<div class="col"><div class="card" style="height:100%;border-color:#EAC5C5;' +
      'background:var(--status-danger-surface)">' +
      '<p class="card__k" style="color:var(--status-danger)">Keterbatasan Mendasar AI</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Buta terhadap riwayat medis, gejala subjektif, dan pemeriksaan fisik pasien.</li>' +
      '<li>Tidak memiliki kesadaran internal saat melakukan halusinasi atau salah deteksi.</li>' +
      '<li>Tidak dapat memikul beban etika dan tanggung jawab medikolegal.</li>' +
      '</ul></div></div>' +
      '<div class="col"><div class="card card--navy" style="height:100%">' +
      '<p class="card__k">Kesimpulan Filosofis</p>' +
      '<p class="card__d" style="font-size:16.5px">Kompetensi terpenting seorang radiolog di era AI ' +
      'bukanlah kemahiran menjalankan kode komputasi, melainkan <b>ketajaman kritis dalam mengenali ' +
      'kapan luaran AI tidak layak dipercaya</b> &mdash; fondasi yang telah kita bangun bersama selama dua pertemuan ini.</p>' +
      '</div></div>' +
      '</div>' +

      '</div></div>'
  });

})();

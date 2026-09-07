/* Bab 1 - Sesi 1: Dasar Python dan Pengolahan Citra Radiologi (15 September 2026).
   Mengikuti urutan notebook Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb. */

(function () {
  'use strict';
  var D = (window.DECK = window.DECK || []);

  /* Panah kanan untuk komponen .flow */
  var ARROW = '<div class="flow__arrow"><svg viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M5 12h13M13 6l6 6-6 6"/></svg></div>';

  /* ---------------------------------------------------------------- S1-01 */

  D.push({
    id: 's1-01',
    chapter: 1,
    layout: 'separator',
    label: 'Bab 1',
    notes: 'Tuliskan pertanyaan pemantik ini di papan tulis jika tersedia. Seluruh materi pada Sesi 1 ' +
      'merupakan rangkaian jawaban bertahap atas pertanyaan mendasar ini.',
    html:
      '<div class="s-sep-gold"></div><div class="s-sep-navy"></div>' +
      '<p class="s-kicker">Bab 1 &middot; Sesi 1 &middot; 15 September 2026</p>' +
      '<h2 class="s-h2">Dasar Python dan Pengolahan Citra Radiologi</h2>' +
      '<p class="s-sub">&ldquo;Bagaimana komputer membaca, merepresentasikan, dan ' +
      'memanipulasi citra radiograf secara digital?&rdquo;</p>'
  });

  /* ---------------------------------------------------------------- S1-02 */

  D.push({
    id: 's1-02',
    chapter: 1,
    kicker: 'Capaian pembelajaran',
    title: 'Lima Keterampilan Praktis yang Dikuasai dalam 150 Menit',
    notes: 'Tunjukkan kriteria evaluasi di kolom kanan. Kriteria inilah yang menjadi tolok ukur ' +
      'capaian di menit 135&ndash;150, bukan hafalan sintaksis kode.',
    html:
      '<div class="s-body"><div class="row">' +
      '<div class="col col--wide">' +
      '<ol class="steps">' +
      '<li>Menjalankan sel Colab secara runtut dan mengatasi pesan error umum yang kerap muncul.</li>' +
      '<li>Memahami konsep variabel, <i>list</i>, pengindeksan berbasis nol, fungsi, dan struktur <i>array</i> citra.</li>' +
      '<li>Menghubungkan koordinat <i>bounding box</i> <code>[x1,y1,x2,y2]</code> ' +
      'dengan pemotongan array matriks <code>[y1:y2, x1:x2]</code>.</li>' +
      '<li>Membandingkan karakteristik citra asli, <i>histogram equalization</i>, dan CLAHE secara objektif.</li>' +
      '<li>Menjelaskan alasan mendasar mengapa peningkatan kontras tidak menghasilkan informasi diagnostik baru.</li>' +
      '</ol></div>' +
      '<div class="col col--narrow">' +
      '<div class="card card--tint" style="height:100%">' +
      '<p class="card__k">Kriteria evaluasi</p>' +
      '<p class="card__d" style="font-size:16px">Di akhir sesi praktikum, peserta mampu:</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>mengganti nilai <code>CASE_ID</code> dan menjalankan ulang notebook tanpa kendala;</li>' +
      '<li>menentukan koordinat ROI yang valid dan memotong area citra dengan tepat;</li>' +
      '<li>menjelaskan satu manfaat klinis <b>serta</b> satu risiko teknis penggunaan CLAHE.</li>' +
      '</ul></div></div>' +
      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-03 */

  D.push({
    id: 's1-03',
    chapter: 1,
    kicker: 'Menyikapi pesan error',
    title: 'Anatomi Pesan Error: Membaca Alur dari Bawah ke Atas',
    notes: 'Tunjukkan bahwa baris paling bawah adalah diagnosis utamanya, dan baris ' +
      'bertanda panah adalah lokasinya. Analogi medis: <em>traceback itu mirip sistem rujukan ' +
      'berjenjang</em> &mdash; baris terbawah merupakan kesimpulan diagnosis akhirnya.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide stack">' +
      '<pre class="code code--dark code--sm">' +
      '<i>Traceback (most recent call last):</i>\n' +
      '  File "&lt;ipython-input-7&gt;", line 3, in &lt;module&gt;\n' +
      '    crop = <b>image</b>[270:710, 620:920]\n' +
      '           <b>^^^^^</b>\n' +
      '<b>NameError</b>: name \'image\' is not defined</pre>' +
      '<div class="grid3 grid--auto" style="gap:14px">' +
      '<div class="card" style="padding:14px 16px">' +
      '<p class="card__k">1. Baris terakhir</p>' +
      '<p class="card__d" style="font-size:15px">Jenis error dan penjelasannya. ' +
      'Ini adalah <b>diagnosis utamanya</b>.</p></div>' +
      '<div class="card" style="padding:14px 16px">' +
      '<p class="card__k">2. Tanda panah</p>' +
      '<p class="card__d" style="font-size:15px">Menunjuk tepat kata atau sintaksis yang ' +
      'bermasalah. Ini adalah <b>lokasi kelainannya</b>.</p></div>' +
      '<div class="card" style="padding:14px 16px">' +
      '<p class="card__k">3. Nomor baris</p>' +
      '<p class="card__d" style="font-size:15px">Menunjukkan sel dan nomor baris keberapa. ' +
      'Ini adalah <b>titik intervensinya</b>.</p></div>' +
      '</div></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="note">' +
      '<p class="note__t">Maksud pesan di atas</p>' +
      '<p>&ldquo;Python belum mengenal variabel <code>image</code>. ' +
      'Apakah sel yang mendefinisikan citra tersebut sudah dijalankan sebelumnya?&rdquo;</p>' +
      '</div>' +
      '<div class="card card--navy" style="flex:1">' +
      '<p class="card__k">Langkah penanganan yang tepat</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Tetap tenang dan jangan langsung menutup notebook.</li>' +
      '<li>Baca baris pesan paling bawah terlebih dahulu.</li>' +
      '<li>Gulir ke sel sebelumnya, lalu jalankan sel yang terlewat.</li>' +
      '<li>Jalankan kembali sel yang sempat mengalami error.</li>' +
      '</ul>' +
      '<p class="card__d mt" style="font-size:14.5px">Catatan: Sebagian besar error ' +
      'dalam praktikum ini terselesaikan hanya dengan menjalankan ulang sel yang terlewat di atasnya.</p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-04 */

  D.push({
    id: 's1-04',
    chapter: 1,
    kicker: 'Fondasi dasar Python',
    title: 'Setiap Baris Perintah Mengikuti Pola yang Konsisten',
    notes: 'Pola tiga tahap ini (objek &rarr; fungsi &rarr; luaran) berlaku untuk <em>seluruh</em> ' +
      'kode pada kedua sesi. Bila peserta hanya mengingat satu konsep dasar dari 30 menit ini, pola konsisten inilah yang paling penting.',
    html:
      '<div class="s-body"><div class="stack" style="gap:20px;height:100%">' +

      '<div class="flow">' +
      '<div class="flow__step flow__step--tint">' +
      '<p class="flow__k">Objek</p>' +
      '<p class="flow__t">Data yang tersimpan</p>' +
      '<p class="flow__d">Dapat berupa angka, teks, daftar (list), maupun matriks citra utuh. ' +
      'Diberi nama variabel agar mudah dipanggil kembali.</p></div>' +
      ARROW +
      '<div class="flow__step flow__step--accent">' +
      '<p class="flow__k">Fungsi</p>' +
      '<p class="flow__t">Tindakan yang dijalankan</p>' +
      '<p class="flow__d">Selalu dikenali dari tanda kurung setelah namanya. Menerima masukan, ' +
      'dan mengembalikan hasil pengolahan.</p></div>' +
      ARROW +
      '<div class="flow__step flow__step--navy">' +
      '<p class="flow__k">Luaran</p>' +
      '<p class="flow__t">Hasil yang ditampilkan</p>' +
      '<p class="flow__d">Dapat berupa angka di bawah sel, maupun visualisasi gambar. ' +
      'Inilah komponen yang akan Anda audit secara klinis.</p></div>' +
      '</div>' +

      '<div class="row" style="flex:1;min-height:0">' +
      '<div class="col">' +
      '<pre class="code">' +
      '<i># objek: sebuah nama variabel diisi nilai tertentu</i>\n' +
      '<b>usia_pasien</b> = 9\n' +
      '<b>temuan</b> = ["karies", "periapikal"]\n\n' +
      '<i># fungsi: dikenali dari tanda kurung</i>\n' +
      '<b>print</b>(usia_pasien)\n' +
      '<b>len</b>(temuan)</pre>' +
      '</div>' +
      '<div class="col">' +
      '<div class="card card--warm" style="height:100%">' +
      '<p class="card__k">Yang tidak perlu dihafalkan</p>' +
      '<p class="card__d" style="font-size:16.5px">Nama fungsi pustaka, urutan argumen parameter, ' +
      'maupun tanda baca khusus. Semuanya telah disediakan lengkap di dalam notebook.</p>' +
      '<p class="card__k" style="margin-top:8px">Yang penting dipahami</p>' +
      '<p class="card__d" style="font-size:16.5px">Mengidentifikasi mana objek data, mana ' +
      'fungsi pemroses, dan seperti apa luarannya &mdash; sehingga Anda memahami bagian mana ' +
      'yang terpengaruh saat parameter diubah.</p>' +
      '</div></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-05 */

  D.push({
    id: 's1-05',
    chapter: 1,
    widget: 'index-zero',
    kicker: 'Sumber kekeliruan umum',
    title: 'Sistem Pengindeksan Komputer Dimulai dari Angka Nol',
    notes: 'Gunakan widget interaktif ini. Ajak peserta menebak terlebih dahulu: ' +
      '&ldquo;kalau kita meminta indeks 4, elemen gigi mana yang terpanggil?&rdquo; ' +
      'Kesalahan pergeseran satu angka di sini adalah penyebab utama munculnya <em>IndexError</em> di notebook nanti.',
    html:
      '<div class="s-body"><div class="row">' +
      '<div class="col col--wide">' +
      '<div class="wg" data-widget="index-zero"></div>' +
      '</div>' +
      '<div class="col col--narrow stack">' +
      '<div class="note">' +
      '<p class="note__t">Konsekuensi praktis</p>' +
      '<p>Daftar berisi lima elemen memiliki indeks <code>0</code> sampai ' +
      '<code>4</code>. Memanggil indeks <code>5</code> akan memicu ' +
      '<code>IndexError</code>, bukan mengambil elemen kelima.</p>' +
      '</div>' +
      '<div class="card card--tint" style="flex:1">' +
      '<p class="card__k">Mengapa demikian?</p>' +
      '<p class="card__d" style="font-size:16px">Dalam ilmu komputer, indeks bukanlah &ldquo;nomor urut konvensional&rdquo;, ' +
      'melainkan <b>jarak pergeseran (offset) dari elemen pertama</b>. Elemen paling awal berjarak ' +
      'nol langkah dari titik awal.</p>' +
      '<p class="card__d" style="font-size:16px">Prinsip yang sama nantinya juga berlaku penuh ' +
      'saat kita mengakses baris dan kolom piksel pada citra radiograf.</p>' +
      '</div></div>' +
      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-06 */

  D.push({
    id: 's1-06',
    chapter: 1,
    kicker: 'Integritas dan keaslian berkas',
    title: 'Checksum SHA-256: Sidik Jari Digital untuk Verifikasi Data',
    notes: 'Tekankan hal ini: notebook <em>akan otomatis menolak berjalan</em> bila nilai checksum tidak cocok. ' +
      'Ini bukan sekadar formalitas &mdash; bila berkas bobot model berubah tanpa disengaja, ' +
      'seluruh hasil audit pada Sesi 2 kehilangan validitas ilmiahnya.',
    html:
      '<div class="s-body"><div class="stack" style="gap:18px;height:100%">' +

      '<svg class="dg" viewBox="0 0 1172 220" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Dua berkas yang hampir identik menghasilkan checksum yang sama sekali berbeda">' +

      '<rect x="0" y="10" width="330" height="86" rx="8" fill="#EAF0F5" stroke="#CBDAE6"/>' +
      '<text x="20" y="38" font-size="13" font-weight="700" fill="#4D7A9E" ' +
      'letter-spacing="1.4">BERKAS ASLI</text>' +
      '<text x="20" y="66" font-size="15" fill="#2B2D2F">best.onnx</text>' +
      '<text x="20" y="86" font-size="13" fill="#55585B">11.972.531 byte</text>' +

      '<path d="M340 53 h72" stroke="#01416B" stroke-width="2"/>' +
      '<path d="M412 53 l-9 -5 v10 z" fill="#01416B"/>' +
      '<rect x="422" y="28" width="118" height="50" rx="4" fill="#01416B"/>' +
      '<text x="481" y="58" font-size="14" font-weight="700" fill="#FFFFFF" ' +
      'text-anchor="middle">SHA-256</text>' +
      '<path d="M550 53 h72" stroke="#01416B" stroke-width="2"/>' +
      '<path d="M622 53 l-9 -5 v10 z" fill="#01416B"/>' +

      '<rect x="632" y="24" width="540" height="58" rx="4" fill="#F8F9FA" stroke="#E3E5E7"/>' +
      '<text x="650" y="48" font-size="13.5" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#2E7D52">4cee38b54203634d895ed30a8910f5d7</text>' +
      '<text x="650" y="68" font-size="13.5" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#2E7D52">c4cefe22b18f9116b5561d9dd6e83a71</text>' +

      '<rect x="0" y="122" width="330" height="86" rx="8" fill="#FAEAEA" stroke="#EAC5C5"/>' +
      '<text x="20" y="150" font-size="13" font-weight="700" fill="#A32020" ' +
      'letter-spacing="1.4">BEDA SATU BIT SAJA</text>' +
      '<text x="20" y="178" font-size="15" fill="#2B2D2F">best.onnx (terunduh sebagian / korup)</text>' +
      '<text x="20" y="198" font-size="13" fill="#55585B">11.972.530 byte</text>' +

      '<path d="M340 165 h72" stroke="#A32020" stroke-width="2"/>' +
      '<path d="M412 165 l-9 -5 v10 z" fill="#A32020"/>' +
      '<rect x="422" y="140" width="118" height="50" rx="4" fill="#01416B"/>' +
      '<text x="481" y="170" font-size="14" font-weight="700" fill="#FFFFFF" ' +
      'text-anchor="middle">SHA-256</text>' +
      '<path d="M550 165 h72" stroke="#A32020" stroke-width="2"/>' +
      '<path d="M622 165 l-9 -5 v10 z" fill="#A32020"/>' +

      '<rect x="632" y="136" width="540" height="58" rx="4" fill="#FAEAEA" stroke="#EAC5C5"/>' +
      '<text x="650" y="160" font-size="13.5" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#A32020">9f1b07ea6c4d8823bb50e7712a0c6d94</text>' +
      '<text x="650" y="180" font-size="13.5" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#A32020">e83aa1f0d55c9b26417ff8c3ab61d072</text>' +

      '</svg>' +

      '<div class="row" style="flex:1;min-height:0;gap:20px">' +
      '<div class="col"><div class="card card--tint" style="height:100%">' +
      '<p class="card__k">Karakteristik penting checksum</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Berkas yang identik akan selalu menghasilkan checksum yang sama persis.</li>' +
      '<li>Perubahan sekecil apa pun pada isi berkas akan mengubah total kode checksum.</li>' +
      '<li>Checksum bersifat satu arah; berkas asli tidak dapat direkonstruksi dari kode hash.</li>' +
      '</ul></div></div>' +
      '<div class="col"><div class="note" style="height:100%">' +
      '<p class="note__t">Relevansi krusial dalam audit AI</p>' +
      '<p>Bila berkas model dapat termodifikasi tanpa terdeteksi, hasil audit saat ini ' +
      'tidak akan bisa dibandingkan secara valid dengan evaluasi di masa mendatang. Penguncian nilai ' +
      'checksum menjamin eksperimen dapat direplikasi secara konsisten oleh pihak lain.</p>' +
      '</div></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-07 */

  D.push({
    id: 's1-07',
    chapter: 1,
    widget: 'pixel-loupe',
    kicker: 'Konsep kunci Sesi 1',
    title: 'Bagi Komputer, Radiograf adalah Matriks Angka',
    notes: 'FOKUS UTAMA SESI 1. Gerakkan lup pembesar perlahan dari area email gigi menuju ruang udara bebas. ' +
      'Minta peserta memperhatikan nilainya. Intinya: ' +
      '<em>komputer tidak mengenali organ gigi secara biologis, ia hanya membaca matriks nilai intensitas</em> &mdash; ' +
      'seluruh kemampuan deteksi AI pada Sesi 2 dibangun di atas manipulasi angka-angka ini.',
    html:
      '<div class="s-body"><div class="wg" data-widget="pixel-loupe"></div></div>'
  });

  /* ---------------------------------------------------------------- S1-08 */

  D.push({
    id: 's1-08',
    chapter: 1,
    kicker: 'Membaca dimensi citra',
    title: 'Dua Informasi Citra yang Wajib Diperiksa Pertama Kali',
    notes: 'Bila nilai <code>shape</code> tidak sesuai dengan spesifikasi yang diharapkan, semua langkah ' +
      'setelahnya akan keliru. Ini merupakan langkah pemeriksaan pertama yang wajib dilakukan ' +
      'sebelum memproses citra apa pun.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide stack" style="gap:18px">' +
      '<svg class="dg" viewBox="0 0 700 190" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Arti setiap komponen angka pada shape matriks citra 942, 2000, 3">' +
      '<text x="14" y="52" font-size="26" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#2B2D2F">image.shape</text>' +
      '<text x="196" y="52" font-size="26" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#2B2D2F">&#8594;</text>' +
      '<text x="240" y="52" font-size="26" font-family="ui-monospace,Consolas,monospace" ' +
      'fill="#2B2D2F">(</text>' +
      '<text x="258" y="52" font-size="26" font-weight="700" ' +
      'font-family="ui-monospace,Consolas,monospace" fill="#01416B">942</text>' +
      '<text x="312" y="52" font-size="26" font-family="ui-monospace,Consolas,monospace" fill="#2B2D2F">,</text>' +
      '<text x="332" y="52" font-size="26" font-weight="700" ' +
      'font-family="ui-monospace,Consolas,monospace" fill="#01416B">2000</text>' +
      '<text x="404" y="52" font-size="26" font-family="ui-monospace,Consolas,monospace" fill="#2B2D2F">,</text>' +
      '<text x="424" y="52" font-size="26" font-weight="700" ' +
      'font-family="ui-monospace,Consolas,monospace" fill="#01416B">3</text>' +
      '<text x="444" y="52" font-size="26" font-family="ui-monospace,Consolas,monospace" fill="#2B2D2F">)</text>' +

      '<path d="M275 66 v34 h-60 v22" stroke="#FDD402" stroke-width="2.5" fill="none"/>' +
      '<text x="120" y="140" font-size="15" font-weight="700" fill="#01416B">Tinggi (baris)</text>' +
      '<text x="120" y="160" font-size="13.5" fill="#55585B">sumbu y &middot; ke bawah</text>' +

      '<path d="M368 66 v52 h-10 v22" stroke="#FDD402" stroke-width="2.5" fill="none"/>' +
      '<text x="300" y="160" font-size="15" font-weight="700" fill="#01416B">Lebar (kolom)</text>' +
      '<text x="300" y="180" font-size="13.5" fill="#55585B">sumbu x &middot; ke kanan</text>' +

      '<path d="M432 66 v34 h60 v22" stroke="#FDD402" stroke-width="2.5" fill="none"/>' +
      '<text x="504" y="140" font-size="15" font-weight="700" fill="#01416B">Kanal warna</text>' +
      '<text x="504" y="160" font-size="13.5" fill="#55585B">format RGB &middot; grayscale = 1</text>' +
      '</svg>' +

      '<div class="note">' +
      '<p class="note__t">Penting: Cermati urutan penulisan dimensi</p>' +
      '<p>Nilai tinggi (baris) dituliskan terlebih dahulu, baru kemudian lebar (kolom) &mdash; ' +
      'berbanding terbalik dengan kebiasaan umum saat menyebut ukuran gambar (&ldquo;2000 &times; 942&rdquo;). Urutan ' +
      '<b>baris (y) dahulu, kolom (x) kemudian</b> inilah yang mendasari mengapa pemotongan area ROI ' +
      'pada Python ditulis <code>[y1:y2, x1:x2]</code>, bukan sebaliknya.</p>' +
      '</div></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card">' +
      '<p class="card__k">Tipe data: uint8</p>' +
      '<p class="card__d" style="font-size:15.5px">Setiap nilai piksel disimpan sebagai ' +
      'bilangan bulat tanpa tanda 0&ndash;255. Tidak ada nilai negatif maupun pecahan desimal.</p>' +
      '<div class="ladder" id="ladder8">' +
      '<span style="background:#000"></span><span style="background:#1c1c1c"></span>' +
      '<span style="background:#383838"></span><span style="background:#555"></span>' +
      '<span style="background:#717171"></span><span style="background:#8d8d8d"></span>' +
      '<span style="background:#aaa"></span><span style="background:#c6c6c6"></span>' +
      '<span style="background:#e2e2e2"></span><span style="background:#fff"></span>' +
      '</div>' +
      '<div class="ladder__labels"><span>0</span><span>128</span><span>255</span></div>' +
      '<p class="card__d" style="font-size:15px">' +
      '<b>0</b> = hitam pekat (densitas udara/ruang radiolusen)<br><b>255</b> = putih terang (struktur radiopak padat: email, logam)</p>' +
      '</div>' +
      '<div class="card card--navy" style="flex:1">' +
      '<p class="card__k">Praktik baik yang perlu dibiasakan</p>' +
      '<p class="card__d" style="font-size:16px">Selalu periksa nilai <code>shape</code> dan ' +
      '<code>dtype</code> setiap kali memuat citra baru. Sebagian besar kekeliruan teknis ' +
      'pengolahan citra langsung terdeteksi dari dua baris informasi ini.</p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-09 */

  D.push({
    id: 's1-09',
    chapter: 1,
    kicker: 'Keterbatasan statistik global',
    title: 'Dua Citra Ini Menghasilkan Histogram yang Sama Persis',
    notes: 'BUKTI VISUAL TERKUAT PADA SESI 1. Citra di sebelah kanan adalah citra asli yang ' +
      'posisi pikselnya diacak total. Jumlah kemunculan tiap tingkat keabuan tetap sama persis, ' +
      'sehingga bentuk histogramnya identik hingga bin terakhir. Tanyakan kepada peserta: <em>jika histogram ' +
      'tidak mampu membedakan kedua citra ini, informasi apa yang sebenarnya diukur oleh histogram?</em>',
    html:
      '<div class="s-body"><div class="stack" style="gap:14px;height:100%">' +
      '<div class="grid2" style="height:auto;flex:1;min-height:0">' +

      '<div class="fig">' +
      '<div class="fig__frame"><img src="assets/figures/f1-histogram-asli.png" ' +
      'alt="Radiograf panoramik anak dengan anatomi utuh"></div>' +
      '<img src="assets/figures/f1-histogram-asli-hist.png" ' +
      'alt="Histogram intensitas citra asli" ' +
      'style="height:76px;object-fit:fill;flex:none">' +
      '<p class="figcap"><b>Citra asli.</b> Struktur anatomi tampak utuh dan terbaca.</p>' +
      '</div>' +

      '<div class="fig">' +
      '<div class="fig__frame"><img src="assets/figures/f1-histogram-acak.png" ' +
      'alt="Citra yang sama dengan posisi piksel diacak, tidak ada anatomi yang terbaca"></div>' +
      '<img src="assets/figures/f1-histogram-acak-hist.png" ' +
      'alt="Histogram intensitas citra acak, identik dengan histogram citra asli" ' +
      'style="height:76px;object-fit:fill;flex:none">' +
      '<p class="figcap"><b>Piksel yang sama dengan posisi teracak.</b> Struktur anatomi lenyap total.</p>' +
      '</div>' +

      '</div>' +
      '<div class="note" style="flex:none">' +
      '<p class="note__t">Poin kunci untuk dipahami</p>' +
      '<p>Histogram hanya menghitung <b>distribusi frekuensi kemunculan</b> piksel pada setiap tingkat ' +
      'keabuan. Histogram sama sekali tidak menyimpan informasi <b>posisi spasial</b> piksel tersebut. ' +
      'Oleh karena itu, histogram sangat berguna untuk mengevaluasi kualitas eksposur dan rentang kontras, ' +
      'namun sama sekali buta terhadap geometri anatomi &mdash; serta tidak dapat dijadikan dasar tunggal ' +
      'dalam penegakan temuan radiografis.</p>' +
      '</div>' +
      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-10 */

  D.push({
    id: 's1-10',
    chapter: 1,
    widget: 'roi-explorer',
    kicker: 'Konsep kunci Sesi 1',
    title: 'Menentukan ROI: Dari Kotak di Layar Menjadi Slicing Matriks',
    notes: 'FOKUS UTAMA KEDUA SESI 1. Geser dan ubah ukuran kotaknya; perhatikan bagaimana baris kode di ' +
      'bawah ikut terbarui otomatis. Tekankan kembali pertukaran urutan: koordinat bounding box dinyatakan dengan ' +
      '<em>x terlebih dahulu</em>, sedangkan perintah pemotongan array Python ditulis dengan <em>y terlebih dahulu</em>. ' +
      'Latihan notebook pada kasus <code>test_cate1_012</code> menggunakan mekanisme yang persis sama.',
    html:
      '<div class="s-body"><div class="wg" data-widget="roi-explorer"></div></div>'
  });

  /* ---------------------------------------------------------------- S1-11 */

  D.push({
    id: 's1-11',
    chapter: 1,
    kicker: 'Refleksi klinis',
    title: 'Bounding Box Bukan Batas Biologis Lesi yang Sesungguhnya',
    notes: 'Jembatan konseptual penting menuju Sesi 2: seluruh luaran detektor AI menghasilkan kotak ' +
      'persegi pembatas yang serupa. Jika kotak di tahap ini masih bersifat perkiraan kasar, ' +
      'kotak prediksi dari model AI nantinya juga memiliki sifat aproksimasi yang sama.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide">' +
      '<svg class="dg dg--fit" viewBox="0 0 660 380" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Kontur biologis lesi yang tidak beraturan dibandingkan dengan batas kotak persegi">' +
      '<rect x="0" y="0" width="660" height="380" fill="#F8F9FA"/>' +

      /* Kotak pembatas */
      '<rect x="150" y="70" width="330" height="240" fill="rgba(253,212,2,.16)" ' +
      'stroke="#FDD402" stroke-width="3"/>' +

      /* Kontur lesi tidak beraturan (skematis) */
      '<path d="M255 118 C300 96 372 110 396 152 C420 194 410 244 372 266 ' +
      'C334 288 282 280 258 246 C234 212 232 148 255 118 Z" ' +
      'fill="#01416B" opacity=".82"/>' +

      '<text x="150" y="58" font-size="14" font-weight="700" fill="#8a6d00">' +
      'Bounding box [x1, y1, x2, y2]</text>' +
      '<text x="404" y="196" font-size="14" font-weight="700" fill="#01416B">Lesi patologis</text>' +

      /* Penanda area yang ikut terkurung */
      '<circle cx="196" cy="112" r="5" fill="#A32020"/>' +
      '<circle cx="440" cy="128" r="5" fill="#A32020"/>' +
      '<circle cx="196" cy="286" r="5" fill="#A32020"/>' +
      '<circle cx="444" cy="284" r="5" fill="#A32020"/>' +
      '<text x="150" y="338" font-size="14" fill="#A32020">' +
      'Titik merah: jaringan sehat di sekitar lesi yang ikut terkurung di dalam kotak</text>' +
      '<text x="150" y="360" font-size="14" fill="#55585B">' +
      'Sisi kotak selalu sejajar sumbu &mdash; tidak dapat miring ataupun melengkung mengikuti jaringan</text>' +
      '</svg></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card card--navy">' +
      '<p class="card__k">Hakekat bounding box sebenarnya</p>' +
      '<p class="card__d" style="font-size:16.5px">Hanyalah empat angka koordinat spasial. ' +
      'Merupakan <b>alat bantu komputasi</b> untuk mendefinisikan wilayah seleksi, bukan hasil ' +
      'delineasi tepi jaringan anatomis.</p>' +
      '</div>' +
      '<div class="card card--warm" style="flex:1">' +
      '<p class="card__k">Relevansi praktis di ruang baca radiologi</p>' +
      '<ul class="bullets bullets--sm">' +
      '<li>Ukuran kotak <b>bukanlah</b> ukuran lesi yang sebenarnya.</li>' +
      '<li>Kotak prediksi yang saling bertumpang-tindih <b>bukan</b> berarti lesi menyatu secara biologis.</li>' +
      '<li>Batas tepi lesi tetap harus dinilai oleh mata klinisi radiolog, bukan mengandalkan batas kotak.</li>' +
      '</ul>' +
      '<p class="disclaimer mt">Ilustrasi skematis. Bentuk lesi digambar semata-mata ' +
      'untuk menjelaskan konsep, bukan hasil segmentasi dari data klinis.</p>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-12 */

  D.push({
    id: 's1-12',
    chapter: 1,
    widget: 'clahe-slider',
    kicker: 'Teknik peningkatan kontras',
    title: 'Perbandingan Citra Asli, Histogram Equalization, dan CLAHE',
    notes: 'Tingkatkan nilai clip limit secara bertahap sambil mengarahkan perhatian peserta ke area ' +
      'citra yang relatif homogen. Pada clip limit 8,0, ajak peserta berdiskusi: <em>apakah detail ' +
      'informasi diagnostik yang bertambah, ataukah derau (noise) latar yang justru makin teramplifikasi?</em>',
    html:
      '<div class="s-body"><div class="wg" data-widget="clahe-slider"></div></div>'
  });

  /* ---------------------------------------------------------------- S1-13 */

  D.push({
    id: 's1-13',
    chapter: 1,
    kicker: 'Skeptisisme teknis',
    title: 'Peningkatan Kontras Tidak Menghasilkan Informasi Diagnostik Baru',
    notes: 'Inilah kesimpulan konseptual terpenting pada Sesi 1, dan pola pikir kritis ini pula yang ' +
      'akan kita gunakan untuk mengevaluasi keluaran AI pada Sesi 2: ' +
      '<em>tampilan visual yang tampak lebih tajam belum tentu memuat bukti diagnostik yang lebih valid</em>.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide stack">' +
      '<div class="grid2" style="height:auto">' +
      '<div class="fig">' +
      '<img src="assets/figures/f2-derau-asli.png" alt="Area radiografis homogen, citra asli">' +
      '<p class="figcap"><b>Asli.</b> Area radiografis yang relatif homogen.</p></div>' +
      '<div class="fig">' +
      '<img src="assets/figures/f2-derau-clahe80.png" ' +
      'alt="Area yang sama setelah CLAHE clip limit 8,0, bintik derau menjadi jauh lebih jelas">' +
      '<p class="figcap"><b>CLAHE clip limit 8,0.</b> Bintik granularitas yang muncul merupakan amplifikasi derau (noise), ' +
      'bukan detail struktur anatomis baru.</p></div>' +
      '</div>' +
      '<div class="note">' +
      '<p class="note__t">Hakikat proses yang terjadi</p>' +
      '<p>Peningkatan kontras semata-mata <b>memetakan ulang (redistribusi)</b> nilai derajat keabuan yang sudah ada pada citra. ' +
      'Tidak ada penambahan foton radiasi baru dan tidak ada perekaman detail jaringan tambahan &mdash; sebaliknya, derau (noise) ' +
      'bawaan ikut terangkat dan makin kentara.</p></div>' +
      '<div class="note note--navy mt">' +
      '<p class="note__t">Panduan praktis penggunaan klinis</p>' +
      '<p>Peningkatan kontras boleh dimanfaatkan untuk membantu visualisasi awal, namun <b>tidak boleh</b> dijadikan dasar ' +
      'tunggal untuk menyatakan adanya lesi patologis yang pada citra aslinya memang tidak tampak.</p></div>' +
      '</div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card card--tint">' +
      '<p class="card__k">Manfaat klinis</p>' +
      '<p class="card__d" style="font-size:16px">Membantu memperjelas visualisasi struktur ' +
      'dengan perbedaan densitas rendah, terutama pada radiograf dengan kualitas ' +
      'eksposur awal yang kurang optimal.</p>' +
      '</div>' +
      '<div class="card" style="border-color:#EAC5C5;background:var(--status-danger-surface)">' +
      '<p class="card__k" style="color:var(--status-danger)">Risiko teknis yang perlu diwaspadai</p>' +
      '<ul class="bullets bullets--sm" style="gap:10px">' +
      '<li>Derau latar (noise) dan artefak radiografis ikut teramplifikasi secara nyata.</li>' +
      '<li>Garis batas tepi anatomis dapat tampak menipu dan lebih tegas dari kondisi aslinya.</li>' +
      '<li>Perbandingan serial antarcitra menjadi tidak valid apabila menggunakan parameter pengolahan yang berbeda.</li>' +
      '</ul></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-14 */

  D.push({
    id: 's1-14',
    chapter: 1,
    kicker: 'Konteks praktikum vs realitas klinis',
    title: 'Format PNG 8-Bit pada Praktikum vs DICOM 12-Bit di Layanan Klinis',
    notes: 'Catatan transparansi teknis. Citra yang digunakan dalam praktikum telah mengalami penurunan ' +
      'rentang dinamis sebelum sampai ke tangan kita. Oleh sebab itu, seluruh kesimpulan hari ini ' +
      'ditekankan pada pemahaman konseptual, bukan penentuan mutu diagnostik baku.',
    html:
      '<div class="s-body"><div class="stack" style="gap:18px;height:100%">' +

      '<svg class="dg" viewBox="0 0 1172 168" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Perbandingan 256 tingkat keabuan pada format 8-bit dengan 4096 tingkat pada 12-bit">' +
      '<text x="0" y="20" font-size="14" font-weight="700" fill="#01416B">' +
      'PNG 8-bit &mdash; 256 tingkat keabuan (bahan praktikum)</text>' +
      '<g>' +
      '<rect x="0" y="30" width="1172" height="34" fill="#F8F9FA" stroke="#E3E5E7"/>' +
      '<rect x="0" y="30" width="73" height="34" fill="#000"/>' +
      '<rect x="73" y="30" width="73" height="34" fill="#1c1c1c"/>' +
      '<rect x="146" y="30" width="74" height="34" fill="#333"/>' +
      '<rect x="220" y="30" width="73" height="34" fill="#4a4a4a"/>' +
      '<rect x="293" y="30" width="73" height="34" fill="#616161"/>' +
      '<rect x="366" y="30" width="74" height="34" fill="#787878"/>' +
      '<rect x="440" y="30" width="73" height="34" fill="#8f8f8f"/>' +
      '<rect x="513" y="30" width="73" height="34" fill="#a6a6a6"/>' +
      '<rect x="586" y="30" width="74" height="34" fill="#bdbdbd"/>' +
      '<rect x="660" y="30" width="73" height="34" fill="#d4d4d4"/>' +
      '<rect x="733" y="30" width="73" height="34" fill="#e6e6e6"/>' +
      '<rect x="806" y="30" width="366" height="34" fill="#fff"/>' +
      '</g>' +
      '<text x="0" y="104" font-size="14" font-weight="700" fill="#01416B">' +
      'DICOM 12-bit &mdash; 4.096 tingkat keabuan (standar citra klinis di RSGM)</text>' +
      '<defs><linearGradient id="g12" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/>' +
      '</linearGradient></defs>' +
      '<rect x="0" y="114" width="1172" height="34" fill="url(#g12)" stroke="#E3E5E7"/>' +
      '<text x="0" y="164" font-size="13" fill="#55585B">' +
      'Rentang dinamis 16 kali lebih kaya &mdash; ' +
      'sebagian besar perbedaannya hanya dapat dieksplorasi melalui pengaturan windowing yang tepat</text>' +
      '</svg>' +

      '<div class="grid3 grid--auto" style="flex:1;min-height:0">' +
      '<div class="card">' +
      '<p class="card__k">Kedalaman bit (Bit Depth)</p>' +
      '<p class="card__d" style="font-size:16px">Berkas PNG latihan menyimpan 256 tingkat keabuan. ' +
      'Radiograf panoramik DICOM umumnya memiliki kedalaman 12-bit (4.096 tingkat keabuan). Konversi ke format 8-bit ' +
      'telah memangkas informasi rentang dinamis secara permanen.</p></div>' +
      '<div class="card">' +
      '<p class="card__k">Fleksibilitas Windowing (WW/WL)</p>' +
      '<p class="card__d" style="font-size:16px">Pada format DICOM, Anda leluasa memilih ' +
      'rentang jendela (window width/level) yang ingin dipetakan ke skala hitam&ndash;putih. ' +
      'Pada PNG 8-bit, rentang keabuan sudah terkunci permanen pada satu jendela tampilan.</p></div>' +
      '<div class="card">' +
      '<p class="card__k">Kelengkapan Metadata</p>' +
      '<p class="card__d" style="font-size:16px">Format DICOM memuat ' +
      '<i>rescale slope/intercept</i>, kalibrasi fisik ukuran piksel, ' +
      'jenis modalitas, dan riwayat pemeriksaan. Format PNG biasa sama sekali tidak menyimpan metadata klinis tersebut.</p></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-15 */

  D.push({
    id: 's1-15',
    chapter: 1,
    kicker: 'Evaluasi akhir Sesi 1 (Menit 135–150)',
    title: 'Tantangan Mandiri Kasus Kedua dan Pengisian Exit Ticket',
    notes: 'Berikan waktu sekitar 7 menit bagi peserta untuk menyelesaikan latihan mandiri berpasangan, ' +
      'dilanjutkan 8 menit untuk mengisi exit ticket. Kumpulkan lembar exit ticket sebagai bukti capaian belajar ' +
      'untuk penilaian partisipatif.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col stack">' +
      '<div class="card card--warm">' +
      '<p class="card__k">Latihan berpasangan &middot; Kasus test_cate1_012</p>' +
      '<p class="card__d" style="font-size:15.5px">Lengkapi tiga baris kode berikut pada notebook Anda, ' +
      'lalu jalankan sel hingga potongan citra ROI berhasil ditampilkan.</p>' +
      '<pre class="code code--sm" style="margin-top:4px">' +
      'CASE_ID = "______________"\n' +
      'ROI     = [____, ____, ____, ____]\n' +
      'crop    = image[____:____, ____:____]</pre>' +
      '</div>' +
      '<div class="note" style="flex:1">' +
      '<p class="note__t">Petunjuk bila menemui kendala</p>' +
      '<p>Buka kembali slide panduan ROI: dua angka pertama pada variabel <code>ROI</code> adalah ' +
      'koordinat sudut kiri-atas, sedangkan dua angka berikutnya adalah sudut kanan-bawah. Pada baris perintah ' +
      'pemotongan array (slicing), pastikan koordinat sumbu <b>y</b> dituliskan terlebih dahulu.</p>' +
      '</div></div>' +

      '<div class="col col--wide">' +
      '<div class="card card--tint" style="height:100%">' +
      '<p class="card__k">Exit Ticket Sesi 1 &mdash; 4 Pertanyaan Refleksi</p>' +
      '<ol class="steps" style="gap:16px;margin-top:4px">' +
      '<li>Tuliskan <b>satu baris kode</b> Python untuk mengambil area ROI ' +
      '<code>[x1,y1,x2,y2]</code> dari variabel citra bernama <code>image</code>.</li>' +
      '<li>Jelaskan arti dari informasi <code>shape = (942, 2000, 3)</code> beserta masing-masing komponen angkanya.</li>' +
      '<li>Sebutkan <b>satu keuntungan klinis</b> serta <b>satu risiko teknis</b> dari penerapan algoritma CLAHE.</li>' +
      '<li>Mengapa citra radiograf pasien riil dilarang keras diunggah ke platform Google Colab?</li>' +
      '</ol>' +
      '</div></div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- S1-16 */

  (function () {
    var terms = [
      ['Array', 'Struktur matriks data multidimensi; cara komputer merepresentasikan citra digital.'],
      ['Piksel', 'Elemen terkecil pembentuk citra digital; pada format 8-bit bernilai 0&ndash;255.'],
      ['Shape', 'Dimensi ukuran matriks citra: (tinggi, lebar, jumlah kanal warna).'],
      ['Dtype', 'Tipe data tiap elemen penyusun array, pada praktikum ini menggunakan <code>uint8</code>.'],
      ['Indeks', 'Nomor posisi penunjuk elemen dalam struktur data, selalu dihitung mulai dari angka 0.'],
      ['Assignment', 'Penetapan atau pengisian nilai ke dalam suatu variabel menggunakan simbol <code>=</code>.'],
      ['Bounding box', 'Empat nilai koordinat spasial <code>[x1,y1,x2,y2]</code> pembatas area target.'],
      ['ROI', '<i>Region of interest</i>; wilayah spesifik pada citra yang menjadi fokus telaah klinis.'],
      ['Slicing', 'Teknik pemotongan rentang data pada array, dituliskan dengan sintaks <code>[y1:y2, x1:x2]</code>.'],
      ['Histogram', 'Grafik distribusi frekuensi tingkat keabuan piksel; tidak memuat informasi spasial.'],
      ['CLAHE', '<i>Contrast Limited Adaptive Histogram Equalization</i>; teknik optimasi kontras lokal adaptif dengan pembatasan amplifikasi derau.'],
      ['Checksum SHA-256', 'Algoritma hash sidik jari digital untuk memverifikasi integritas dan keaslian berkas unduhan.']
    ];

    D.push({
      id: 's1-16',
      chapter: 1,
      kicker: 'Rujukan cepat istilah',
      title: 'Glosarium Istilah Kunci Sesi 1',
      notes: 'Slide rujukan ringkas. Biarkan slide ini terpampang saat peserta mengerjakan sesi latihan; ' +
        'tidak perlu dibacakan satu per satu.',
      html:
        '<div class="s-body"><div class="grid4 grid--auto" style="gap:14px">' +
        terms.map(function (t) {
          return '<div class="card" style="padding:14px 16px;gap:6px">' +
            '<p class="card__t card__t--sm">' + t[0] + '</p>' +
            '<p class="card__d" style="font-size:14.5px">' + t[1] + '</p></div>';
        }).join('') +
        '</div></div>'
    });
  })();

})();

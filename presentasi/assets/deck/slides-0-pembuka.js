/* Bab 0 - Pembuka: kontrak sesi, peta materi, aturan data, cara baca notebook. */

(function () {
  'use strict';
  var D = (window.DECK = window.DECK || []);

  /* ---------------------------------------------------------------- P-01 */

  D.push({
    id: 'p-01',
    chapter: 0,
    layout: 'title',
    label: 'Sampul',
    notes: 'Sapa peserta dan sampaikan bahwa dua pertemuan ini merupakan satu rangkaian terpadu. ' +
      'Tekankan sejak awal: <em>tidak ada aplikasi yang perlu diinstal</em> ' +
      'dan peserta tidak dituntut memiliki pengalaman coding dengan Python.',
    html:
      '<div class="s-band-right"></div>' +
      '<img class="s-supergraphic" src="assets/ds/img/supergraphic-lines.png" ' +
      'alt="" style="right:-120px;bottom:-160px;width:520px">' +
      '<p class="s-eyebrow">Praktikum &middot; PPDGS Radiologi Kedokteran Gigi</p>' +
      '<h1 class="s-title">Aplikasi Coding untuk Radiologi Kedokteran Gigi</h1>' +
      '<hr class="s-rule">' +
      '<p class="s-sub">' +
      'Radiografi Kedokteran Gigi Digital dan Deteksi Otomatis (KGRG257202)<br>' +
      'Dua pertemuan &middot; 15 dan 22 September 2026 &middot; 150 menit per pertemuan<br>' +
      'Lab Radiologi, Dental Learning Center &middot; Fakultas Kedokteran Gigi UGM' +
      '<br><br><b style="color:var(--ugm-yellow)">Krisostomus Nova Rahmanto, S.Kom., M.Sc.</b>' +
      '</p>'
  });

  /* ---------------------------------------------------------------- P-02 */

  D.push({
    id: 'p-02',
    chapter: 0,
    kicker: 'Kontrak belajar',
    title: 'Tujuan Praktikum: Bukan Menjadikan Dokter sebagai Programmer',
    notes: 'Slide ini bertujuan mencairkan ketegangan. Sampaikan secara lugas: ' +
      'siapa pun yang terbiasa membaca radiograf dapat mengikuti praktikum ini dengan lancar. ' +
      'Fokus latihan kita adalah <em>keterampilan mengaudit teknologi</em>, bukan menulis baris kode.',
    html:
      '<div class="s-body">' +
      '<div class="grid3" style="height:100%">' +

      '<div class="card card--tint">' +
      '<p class="card__k">Yang akan kita pelajari dan lakukan</p>' +
      '<ul class="bullets bullets--sm" style="gap:13px">' +
      '<li>Menjalankan kode yang telah disiapkan sel demi sel di Google Colab.</li>' +
      '<li>Bereksperimen mengubah nilai parameter tertentu dan mengamati dampaknya.</li>' +
      '<li>Menganalisis hasil deteksi model secara kritis dan objektif.</li>' +
      '<li>Mengenali situasi saat rekomendasi model <i>tidak</i> layak dipercaya.</li>' +
      '</ul></div>' +

      '<div class="card">' +
      '<p class="card__k">Yang tidak dituntut dari Anda</p>' +
      '<ul class="bullets bullets--sm" style="gap:13px">' +
      '<li>Menulis program dari nol.</li>' +
      '<li>Melatih (training) model kecerdasan buatan dari awal.</li>' +
      '<li>Menghafalkan sintaksis bahasa Python.</li>' +
      '<li>Mengunggah data rekam medis pasien riil.</li>' +
      '<li>Menerapkan hasil praktikum untuk keputusan klinis.</li>' +
      '</ul></div>' +

      '<div class="card card--navy">' +
      '<p class="card__k">Bekal yang diperlukan</p>' +
      '<ul class="bullets bullets--sm" style="gap:13px">' +
      '<li>Peramban web modern (Chrome/Edge/Firefox) dan akun Google aktif.</li>' +
      '<li>Koneksi internet untuk membuka Colab dan mengunduh bahan praktikum.</li>' +
      '<li>Keahlian membaca radiograf panoramik &mdash; inilah kompetensi utama Anda.</li>' +
      '</ul>' +
      '<p class="card__d mt" style="font-size:15px">' +
      'Tanpa instalasi software di laptop. Tanpa GPU khusus. Tanpa syarat pengalaman pemrograman.</p>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- P-03 */

  (function () {
    var rows = [
      ['0&ndash;15', 'Orientasi, pengenalan Colab, dan keamanan data pasien',
        'Evaluasi mandiri kasus klinis sebelum melihat deteksi AI'],
      ['15&ndash;45', 'Variabel, <i>list</i>, pengindeksan, fungsi, dan <code>print()</code>',
        'Perbedaan <i>classification</i>, <i>object detection</i>, dan <i>segmentation</i>'],
      ['45&ndash;75', 'Radiograf panoramik sebagai <i>array</i>: <code>shape</code>, <code>dtype</code>, piksel, dan histogram',
        'Telaah <i>dataset card</i>, <i>model card</i>, dan <i>label space</i>'],
      ['75&ndash;90', 'Istirahat dan evaluasi berkala (checkpoint)', 'Istirahat dan evaluasi berkala (checkpoint)', true],
      ['90&ndash;115', '<i>Bounding box</i>, sistem koordinat, penentuan ROI, dan <i>cropping</i>',
        'Inferensi model pada 4 kasus dan eksplorasi <i>confidence threshold</i>'],
      ['115&ndash;135', 'Manipulasi kontras: <i>histogram equalization</i> dan CLAHE',
        'Evaluasi ground truth vs prediksi (TP, FP, FN) dan tantangan <i>domain shift</i>'],
      ['135&ndash;150', 'Latihan mandiri studi kasus kedua dan <i>exit ticket</i>',
        'Eksplorasi <i>occlusion sensitivity</i>, batas etika klinis, dan <i>exit ticket</i>']
    ];

    var body = rows.map(function (r) {
      var muted = r[3] ? ' style="opacity:.55"' : '';
      return '<tr' + muted + '>' +
        '<td class="num" style="width:78px;font-weight:700;color:var(--ugm-blue)">' + r[0] + '</td>' +
        '<td>' + r[1] + '</td>' +
        '<td>' + r[2] + '</td></tr>';
    }).join('');

    D.push({
      id: 'p-03',
      chapter: 0,
      kicker: 'Peta pembelajaran',
      title: 'Dua Pertemuan, Satu Rangkaian Pembelajaran yang Utuh',
      notes: 'Tunjukkan bahwa kedua sesi ini saling menopang dan tidak berdiri sendiri. ' +
        'Sesi pertama membahas <em>bagaimana komputer menyimpan dan merepresentasikan citra digital</em>, sedangkan sesi kedua ' +
        'menelaah <em>bagaimana model kecerdasan buatan menafsirkan data tersebut</em>. Keduanya berjalan beriringan langkah demi langkah.',
      html:
        '<div class="s-body">' +
        '<table class="tbl tbl--sm" style="font-size:16px">' +
        '<thead><tr>' +
        '<th>Menit</th>' +
        '<th>Sesi 1 &mdash; 15 September 2026<br><span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-muted)">Fondasi Python dan Pengolahan Citra Digital</span></th>' +
        '<th>Sesi 2 &mdash; 22 September 2026<br><span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--text-muted)">Evaluasi Model AI dan Explainable AI (XAI)</span></th>' +
        '</tr></thead><tbody>' + body + '</tbody></table>' +
        '<p class="disclaimer" style="margin-top:14px">' +
        'Setiap pertemuan berdurasi 150 menit, hari Selasa pukul 13.00&ndash;15.30 WIB, bertempat di Lab Radiologi ' +
        'Dental Learning Center lantai 1 sayap barat.</p>' +
        '</div>'
    });
  })();

  /* ---------------------------------------------------------------- P-04 */

  D.push({
    id: 'p-04',
    chapter: 0,
    kicker: 'Prinsip utama keamanan data',
    title: 'Dilarang Mengunggah Data Rekam Medis Pasien ke Server Cloud',
    notes: 'Beri penekanan khusus pada bagian ini hingga dipahami seluruh peserta. Google Colab merupakan server ' +
      'cloud publik milik pihak ketiga yang berada di luar kendali rumah sakit. Sekali berkas diunggah, kita kehilangan kendali atas kerahasiaan data tersebut. ' +
      'Tegaskan bahwa keempat kasus yang digunakan dalam praktikum ini berlisensi CC0 dan telah dipublikasikan secara terbuka ' +
      'di jurnal <em>Scientific Data</em>.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide">' +
      '<svg class="dg dg--fit" viewBox="0 0 700 360" preserveAspectRatio="xMidYMid meet" ' +
      'role="img" aria-label="Alur data yang dilarang keras dan yang diizinkan menuju Google Colab">' +

      /* Jalur dilarang */
      '<rect x="0" y="14" width="700" height="150" fill="#FAEAEA"/>' +
      '<rect x="0" y="14" width="4" height="150" fill="#A32020"/>' +
      '<text x="22" y="42" font-size="13" font-weight="700" fill="#A32020" ' +
      'letter-spacing="1.6">DILARANG KERAS</text>' +
      '<rect x="22" y="56" width="188" height="80" fill="#FFFFFF" stroke="#EAC5C5"/>' +
      '<text x="38" y="82" font-size="15" font-weight="700" fill="#2B2D2F">Data rekam medis riil</text>' +
      '<text x="38" y="103" font-size="12.5" fill="#55585B">Berkas DICOM asli, tangkapan</text>' +
      '<text x="38" y="120" font-size="12.5" fill="#55585B">layar PACS, identitas (nama, RM)</text>' +

      '<line x1="222" y1="96" x2="300" y2="96" stroke="#A32020" stroke-width="2"/>' +
      '<circle cx="330" cy="96" r="26" fill="#A32020"/>' +
      '<path d="M320 86 L340 106 M340 86 L320 106" stroke="#FFFFFF" stroke-width="3.4" ' +
      'stroke-linecap="round"/>' +
      '<line x1="360" y1="96" x2="438" y2="96" stroke="#A32020" stroke-width="2" ' +
      'stroke-dasharray="5 5"/>' +

      '<rect x="452" y="56" width="226" height="80" fill="#FFFFFF" stroke="#EAC5C5"/>' +
      '<text x="470" y="82" font-size="15" font-weight="700" fill="#2B2D2F">Google Colab</text>' +
      '<text x="470" y="103" font-size="12.5" fill="#55585B">Server cloud pihak ketiga,</text>' +
      '<text x="470" y="120" font-size="12.5" fill="#55585B">di luar kendali RS / RSGM</text>' +

      /* Jalur diizinkan */
      '<rect x="0" y="196" width="700" height="150" fill="#E8F2EC"/>' +
      '<rect x="0" y="196" width="4" height="150" fill="#2E7D52"/>' +
      '<text x="22" y="224" font-size="13" font-weight="700" fill="#2E7D52" ' +
      'letter-spacing="1.6">DIIZINKAN</text>' +
      '<rect x="22" y="238" width="188" height="80" fill="#FFFFFF" stroke="#C6DED2"/>' +
      '<text x="38" y="264" font-size="15" font-weight="700" fill="#2B2D2F">Dataset publik CC0</text>' +
      '<text x="38" y="285" font-size="12.5" fill="#55585B">Empat kasus panoramik anak yang</text>' +
      '<text x="38" y="302" font-size="12.5" fill="#55585B">telah terbit dan dianonimkan penuh</text>' +

      '<line x1="222" y1="278" x2="300" y2="278" stroke="#2E7D52" stroke-width="2"/>' +
      '<circle cx="330" cy="278" r="26" fill="#2E7D52"/>' +
      '<path d="M318 278 L327 288 L343 268" stroke="#FFFFFF" stroke-width="3.4" ' +
      'fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="360" y1="278" x2="438" y2="278" stroke="#2E7D52" stroke-width="2"/>' +
      '<path d="M438 278 l-9 -5 v10 z" fill="#2E7D52"/>' +

      '<rect x="452" y="238" width="226" height="80" fill="#FFFFFF" stroke="#C6DED2"/>' +
      '<text x="470" y="264" font-size="15" font-weight="700" fill="#2B2D2F">Google Colab</text>' +
      '<text x="470" y="285" font-size="12.5" fill="#55585B">Hanya berkas <tspan font-family="ui-monospace,Consolas,monospace">case_id</tspan> publik</text>' +
      '<text x="470" y="302" font-size="12.5" fill="#55585B">yang telah disediakan</text>' +

      '</svg></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="note note--navy">' +
      '<p class="note__t">Mengapa aturannya sangat ketat?</p>' +
      '<p>Citra radiograf adalah bagian sah dari dokumen rekam medis pasien yang dilindungi undang-undang ' +
      'kerahasiaan medis. Begitu berkas keluar dari jaringan rumah sakit, kendali atas penyimpanan, penggandaan, ' +
      'dan distribusinya hilang secara permanen tanpa bisa ditarik kembali.</p>' +
      '</div>' +
      '<div class="card card--warm">' +
      '<p class="card__k">Cakupan data rahasia pasien</p>' +
      '<p class="card__d" style="font-size:15.5px">Meliputi nama lengkap, tanggal lahir, nomor rekam ' +
      'medis (RM), tanggal pemeriksaan, nama operator radiografer, hingga seluruh metadata DICOM &mdash; ' +
      'meskipun tampilan visual gambarnya sekilas tampak tanpa identitas.</p>' +
      '</div>' +
      '</div>' +

      '</div></div>'
  });

  /* ---------------------------------------------------------------- P-05 */

  D.push({
    id: 'p-05',
    chapter: 0,
    kicker: 'Panduan membaca notebook',
    title: 'Memahami Simbol Sel Notebook dan Menyikapi Pesan Error',
    notes: 'Simbol-simbol ini tampil persis pada antarmuka notebook peserta. ' +
      'Ingatkan aturan praktisnya: <em>peserta hanya perlu menyunting baris sel yang bertanda pensil</em>. ' +
      'Sel lainnya cukup dijalankan apa adanya tanpa diubah.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col stack">' +
      '<div class="card" style="gap:14px">' +
      '<p class="card__k">Makna simbol pada judul sel</p>' +

      /* Glyph di bawah ini adalah kutipan antarmuka notebook, bukan dekorasi.
         Panduan brand UGM melarang emoji; pengecualian ini disengaja karena
         peserta akan melihat karakter yang sama persis di layar mereka, dan
         mengganti simbolnya justru akan membingungkan. */
      '<div class="legend">' +
      '<div class="legend__row"><span class="chip chip--mono legend__chip">&#9654;</span>' +
      '<span class="sm"><b>Jalankan</b> &mdash; Cukup klik tombol Play (Run), biarkan kodenya tetap apa adanya.</span></div>' +
      '<div class="legend__row"><span class="chip chip--mono chip--accent legend__chip">&#9998;</span>' +
      '<span class="sm"><b>Sunting</b> &mdash; Fokus Anda di sini; silakan edit angka atau teks yang diminta.</span></div>' +
      '<div class="legend__row"><span class="chip chip--mono legend__chip">&#129658;</span>' +
      '<span class="sm"><b>Diskusi</b> &mdash; Berhenti sejenak dan bahas pertanyaan bersama rekan di sebelah Anda.</span></div>' +
      '<div class="legend__row"><span class="chip chip--mono chip--ok legend__chip">&#10003;</span>' +
      '<span class="sm"><b>Checkpoint</b> &mdash; Titik verifikasi untuk memastikan hasil langkah Anda sudah sesuai.</span></div>' +
      '</div>' +
      '</div>' +

      '<div class="note">' +
      '<p class="note__t">Parameter yang akan kita eksplorasi</p>' +
      '<p><code>CASE_ID</code> &middot; <code>ROI</code> &middot; <code>CLAHE_CLIP</code> ' +
      '&middot; <code>CONF_THRESHOLD</code> &middot; <code>OCCLUSION_GRID</code></p>' +
      '</div>' +
      '</div>' +

      '<div class="col col--wide stack">' +
      '<div class="card card--tint" style="flex:1">' +
      '<p class="card__k">Pesan error adalah petunjuk diagnostik, bukan tanda kegagalan</p>' +
      '<table class="tbl tbl--sm" style="margin-top:2px">' +
      '<thead><tr><th style="width:210px">Jenis Pesan</th><th>Arti Sebenarnya</th><th style="width:200px">Langkah Solusi</th></tr></thead>' +
      '<tbody>' +
      '<tr><td class="num">NameError</td><td>Variabel atau fungsi belum didefinisikan</td>' +
      '<td>Ada sel di bagian atas yang terlewat dan belum dijalankan</td></tr>' +
      '<tr><td class="num">IndexError</td><td>Indeks berada di luar jangkauan daftar</td>' +
      '<td>Ingat: pengindeksan Python selalu dimulai dari angka 0</td></tr>' +
      '<tr><td class="num">FileNotFoundError</td><td>Berkas tidak ditemukan di direktori tersebut</td>' +
      '<td>Periksa kembali penulisan <code>CASE_ID</code> atau nama berkas</td></tr>' +
      '<tr><td class="num" style="white-space:normal">RuntimeError:<br>checksum</td>' +
      '<td>Berkas unduhan tidak lengkap atau korup</td>' +
      '<td>Unduh ulang berkas; sistem sengaja menolak berkas yang rusak demi integritas data</td></tr>' +
      '</tbody></table>' +
      '</div>' +
      '<p class="disclaimer" style="margin:0">Membaca pesan <i>traceback</i> error mirip ' +
      'dengan menganalisis radiograf: cari temuan yang spesifik pada baris terbawah, ' +
      'dan jangan panik melihat rentetan teks panjang yang tampak rumit.</p>' +
      '</div>' +

      '</div></div>'
  });

})();

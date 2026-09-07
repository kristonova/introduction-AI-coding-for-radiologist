/* Penutup - rangkuman, exit ticket, sumber, dan slide penutup. */

(function () {
  'use strict';
  var D = (window.DECK = window.DECK || []);

  /* ----------------------------------------------------------------- Z-01 */

  D.push({
    id: 'z-01',
    chapter: 4,
    layout: 'quote',
    label: 'Refleksi penutup',
    notes: 'Jeda sejenak untuk refleksi. Ini intisari filosofis kurikulum dua sesi: ' +
      'membekali radiolog dengan literasi komputasi dan skeptisisme saintifik ' +
      'dalam berinteraksi dengan AI.',
    html:
      '<div class="s-band-bottom"></div>' +
      '<img class="s-supergraphic" src="assets/ds/img/supergraphic-lines.png" ' +
      'alt="" style="right:-160px;top:-140px;width:520px">' +
      '<blockquote class="s-quote">' +
      'Sesi 1 membedah bagaimana komputer merepresentasikan dan memproses data citra ' +
      'radiologi secara matematis. Sesi 2 menelaah bagaimana model AI menginterpretasikan ' +
      'fitur visual tersebut &mdash; sekaligus melatih seorang spesialis radiologi ' +
      'untuk mengaudit, memvalidasi, dan menguji batas keandalan luaran inferensi mesin.' +
      '</blockquote>' +
      '<p class="s-attrib">Refleksi Penutup &middot; Praktikum Radiografi ' +
      'Kedokteran Gigi Digital dan Deteksi Otomatis</p>'
  });

  /* ----------------------------------------------------------------- Z-02 */

  D.push({
    id: 'z-02',
    chapter: 4,
    kicker: 'Menit 135–150',
    title: 'Exit Ticket Sesi 2 dan Batasan Penggunaan Akademis',
    notes: 'Kumpulkan exit ticket sebagai instrumen evaluasi formatif dan penilaian ' +
      'partisipatif. Tegaskan kembali rambu etika di kartu peringatan merah sebelum mengakhiri sesi.',
    html:
      '<div class="s-body"><div class="row">' +

      '<div class="col col--wide">' +
      '<div class="card card--tint" style="height:100%">' +
      '<p class="card__k">Empat Pertanyaan Audit</p>' +
      '<ol class="steps" style="gap:17px;margin-top:4px">' +
      '<li>Sebutkan perubahan konkret pada kuantitas dan sebaran kotak prediksi ketika ' +
      'parameter <code>CONF_THRESHOLD</code> dinaikkan dari 0,25 menjadi 0,45.</li>' +
      '<li>Tuliskan satu label anotasi yang berstatus <b>tidak dapat dievaluasi</b>, dan ' +
      'uraikan argumentasi mengapa label tersebut wajib dikecualikan dari kalkulasi metrik FP maupun FN.</li>' +
      '<li>Jelaskan makna teknis dari area bersuhu tinggi pada visualisasi <i>occlusion sensitivity</i>, ' +
      'serta sebutkan kesimpulan klinis apa yang <b>keliru dan dilarang</b> ditarik dari peta tersebut.</li>' +
      '<li>Uraikan satu risiko klinis fatal bila model deteksi yang dilatih pada populasi dewasa ' +
      'diaplikasikan langsung pada radiograf panoramik anak, beserta mekanisme pengawasan manusia yang wajib menyertainya.</li>' +
      '</ol></div></div>' +

      '<div class="col col--narrow stack">' +
      '<div class="card" style="border-color:#EAC5C5;background:var(--status-danger-surface)">' +
      '<p class="card__k" style="color:var(--status-danger)">Batasan Penggunaan</p>' +
      '<p class="card__d" style="font-size:16.5px;color:var(--text-body)">Seluruh ' +
      'materi praktikum ini diselenggarakan semata-mata untuk <b>tujuan pendidikan, ' +
      'riset, dan audit teknologi</b>. Notebook komputasi, luaran deteksi, skor model, ' +
      'kotak prediksi, maupun peta atribusi <b>tidak boleh</b> dijadikan dasar pertimbangan ' +
      'diagnosis atau keputusan pelayanan medis pasien.</p>' +
      '</div>' +
      '<div class="note" style="flex:1">' +
      '<p class="note__t">Prosedur Pascapraktikum</p>' +
      '<ul class="bullets bullets--sm" style="margin-top:8px">' +
      '<li>Simpan salinan berkas notebook (.ipynb) ke Google Drive masing-masing.</li>' +
      '<li>Pastikan tidak ada citra klinis riil atau data identitas pasien yang tersimpan.</li>' +
      '<li>Dokumentasikan catatan kritis dan pertanyaan mendalam untuk forum ilmiah berikutnya.</li>' +
      '</ul></div>' +
      '</div>' +

      '</div></div>'
  });

  /* ----------------------------------------------------------------- Z-03 */

  D.push({
    id: 'z-03',
    chapter: 4,
    kicker: 'Atribusi dan Transparansi Sumber',
    title: 'Sumber Data, Spesifikasi Model, dan Rujukan',
    titleSm: true,
    notes: 'Slide transparansi dan keterlacakan ilmiah. Setiap artefak memiliki asal-usul, ' +
      'lisensi, dan integritas data yang dapat diverifikasi &mdash; cerminan integritas ' +
      'riset yang ditanamkan kepada peserta.',
    html:
      '<div class="s-body"><div class="grid3 grid--auto" style="height:100%">' +

      '<div class="card" style="gap:9px">' +
      '<p class="card__k">Dataset Radiograf</p>' +
      '<p class="card__t card__t--sm">Children’s Dental Panoramic Radiographs Dataset</p>' +
      '<p class="card__d" style="font-size:14.5px">Subset panoramik anak, partisi <i>Test</i>. ' +
      'Empat kasus studi: <span class="mono">test_cate1_000</span>, ' +
      '<span class="mono">001</span>, <span class="mono">004</span>, ' +
      '<span class="mono">012</span>.</p>' +
      '<dl class="kv" style="font-size:13.5px">' +
      '<dt>Lisensi</dt><dd>CC0 1.0</dd>' +
      '<dt>Dataset</dt><dd class="mono" style="font-size:12.5px">10.6084/m9.figshare.c.6317013.v1</dd>' +
      '<dt>Artikel</dt><dd class="mono" style="font-size:12.5px">10.1038/s41597-023-02237-5</dd>' +
      '</dl>' +
      '<p class="disclaimer mt">Publikasi pendamping mendokumentasikan proses ' +
      'de-identifikasi (anonimisasi), informed consent perwalian, dan persetujuan komite etik penelitian.</p>' +
      '</div>' +

      '<div class="card" style="gap:9px">' +
      '<p class="card__k">Model yang Diaudit</p>' +
      '<p class="card__t card__t--sm">dental-panoramic-detector</p>' +
      '<p class="card__d" style="font-size:14.5px">Diposisikan secara objektif sebagai ' +
      '<b>artefak eksternal untuk audit komputasi</b>, bukan perangkat medis tersertifikasi. ' +
      'Bobot model tidak didistribusikan secara komersial dalam materi ini.</p>' +
      '<dl class="kv" style="font-size:13.5px">' +
      '<dt>Repositori</dt><dd class="mono" style="font-size:12.5px">liodon-ai/dental-panoramic-detector</dd>' +
      '<dt>Revisi</dt><dd class="mono" style="font-size:12.5px">8bef2036&hellip;366256</dd>' +
      '<dt>SHA-256</dt><dd class="mono" style="font-size:12.5px">4cee38b5&hellip;e83a71</dd>' +
      '<dt>Lisensi</dt><dd>CC BY-NC 4.0 / AGPL-3.0 (inkonsistensi lisensi hulu)</dd>' +
      '</dl>' +
      '</div>' +

      '<div class="card" style="gap:9px">' +
      '<p class="card__k">Pustaka Acuan</p>' +
      '<ul class="bullets bullets--sm" style="gap:12px">' +
      '<li>White &amp; Pharoah, <i>Oral Radiology: Principles and Interpretation</i>, ' +
      'edisi ke-7, 2014.</li>' +
      '<li>Whaites &amp; Drage, <i>Essentials of Dental Radiography and Radiology</i>, ' +
      'edisi ke-6, 2021.</li>' +
      '<li>Publikasi ilmiah internasional terkini di bidang AI radiologi kedokteran gigi.</li>' +
      '</ul>' +
      '<p class="card__k" style="margin-top:6px">Lingkungan Komputasi</p>' +
      '<p class="card__d" style="font-size:14.5px">Python, NumPy, OpenCV, Matplotlib, ' +
      'serta ONNX Runtime 1.27.0 berbasis eksekusi CPU.</p>' +
      '<p class="disclaimer mt">Slide ini tidak melakukan komputasi model secara real-time. ' +
      'Seluruh visualisasi bersumber dari artefak inferensi tersimpan yang disertakan dalam paket materi.</p>' +
      '</div>' +

      '</div></div>'
  });

  /* ----------------------------------------------------------------- Z-04 */

  D.push({
    id: 'z-04',
    chapter: 4,
    layout: 'closing',
    label: 'Penutup',
    notes: 'Buka sesi diskusi interaktif. Tekankan bahwa akses repositori materi ' +
      'dan Google Colab tetap terbuka untuk eksplorasi mandiri peserta pascapelatihan.',
    html:
      '<div class="s-band-bottom"></div>' +
      '<img class="s-supergraphic" src="assets/ds/img/supergraphic-lines.png" ' +
      'alt="" style="right:-140px;bottom:-180px;width:560px">' +
      '<div style="position:absolute;left:53px;top:250px;z-index:2">' +
      '<p style="margin:0;font-size:15px;font-weight:700;letter-spacing:var(--tracking-wide);' +
      'text-transform:uppercase;color:var(--ugm-yellow)">Terima kasih</p>' +
      '<h2 style="margin:16px 0 0;font-size:44px;line-height:1.16;color:var(--white);' +
      'max-width:760px">Diskusi dan Tanya Jawab</h2>' +
      '<hr class="s-rule" style="position:static;margin:24px 0 0;background:var(--ugm-yellow)">' +
      '<p style="margin:22px 0 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,.82)">' +
      'Krisostomus Nova Rahmanto, S.Kom., M.Sc.<br>' +
      'Praktikum Radiografi Kedokteran Gigi Digital dan Deteksi Otomatis<br>' +
      'PPDGS Radiologi Kedokteran Gigi &middot; Fakultas Kedokteran Gigi UGM</p>' +
      '</div>'
  });

})();

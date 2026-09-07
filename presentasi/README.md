# Deck Pengantar Praktikum — Aplikasi Coding untuk Radiologi Kedokteran Gigi

Slide pengantar untuk dua pertemuan praktikum **Radiografi Kedokteran Gigi Digital dan Deteksi Otomatis** (`KGRG257202`), PPDGS Radiologi Kedokteran Gigi, Fakultas Kedokteran Gigi UGM.

Deck ini **mengantar** isi notebook, bukan menggantikannya. Notebook adalah medium kerja; deck ini yang membangun model mental sebelum dan di sela-sela sesi.

| | |
|---|---|
| Pertemuan | Selasa **15** dan **22 September 2026**, 13.00–15.30 WIB |
| Tempat | Lab Radiologi, Dental Learning Center lantai 1 sayap barat |
| Isi | 46 slide, 10 demo interaktif, 21 diagram |
| Pengajar | Krisostomus Nova Rahmanto, S.Kom., M.Sc. |

## Cara memakai

**Klik dua kali `index.html`.** Itu saja — tidak perlu server, tidak perlu internet, tidak perlu memasang apa pun. Deck sudah diuji berjalan dari `file://` di Chrome, termasuk seluruh huruf dan gambarnya.

Kalau browser Anda menolak membuka berkas lokal, jalankan `start.cmd` (butuh Python di PATH) lalu buka `http://localhost:8080`.

### Pintasan presenter

| Tombol | Fungsi |
|---|---|
| `→` `Space` `PageDown` | Slide berikutnya |
| `←` `PageUp` | Slide sebelumnya |
| `Home` / `End` | Slide pertama / terakhir |
| `M` | **Menu bab** — lompat ke Pembuka, Bab 1, Jembatan, Bab 2, atau Penutup |
| `O` | Semua slide sebagai thumbnail |
| `N` | **Catatan presenter** — setiap slide punya catatannya |
| `T` | **Timer 150 menit** dengan penanda blok agenda |
| `F` | Layar penuh |
| `?` | Bantuan |
| `Esc` | Tutup jendela yang terbuka |

Klik di sepertiga kanan layar untuk maju, sepertiga kiri untuk mundur — cukup dengan mouse atau *clicker*, tanpa mencari tombol.

Setiap slide punya alamat sendiri: `index.html#s2-12` membuka slide IoU langsung. Berguna untuk menautkan slide tertentu di LMS.

### Karena deck dipakai di dua hari berbeda

Pertemuan pertama: mulai dari slide 1. Pertemuan kedua: tekan `M`, pilih **Jembatan** — dua slide penghubung yang merangkum Sesi 1, lalu masuk ke Bab 2.

## Struktur

```text
presentasi/
├── index.html                     # kerangka: panggung, navigasi, overview, catatan
├── start.cmd                      # server lokal opsional
├── assets/
│   ├── ds/                        # UGM Design System (token, huruf Gama, logo)
│   ├── deck/
│   │   ├── deck.css               # tata letak slide
│   │   ├── chrome.css             # navigasi, overview, timer, cetak
│   │   ├── deck.js                # mesin deck
│   │   ├── data.js                # DIHASILKAN — anotasi dan prediksi tersimpan
│   │   ├── widgets.js             # demo interaktif Sesi 1
│   │   ├── widgets-sesi2.js       # demo interaktif Sesi 2
│   │   └── slides-*.js            # ISI SLIDE — sunting di sini
│   └── figures/                   # DIHASILKAN — jangan diedit tangan
└── tools/
    ├── build-figures.py           # membuat ulang figures/ dan data.js
    └── check-deck.py              # pemeriksaan aset, privasi, dan kelengkapan
```

Tidak ada `package.json`, tidak ada `node_modules`, tidak ada langkah build untuk aplikasinya. Yang punya langkah build hanya asetnya (Python), dan hasilnya sudah ikut ter-*commit* supaya deck bisa langsung dipakai setelah *clone*.

Alasannya: deck harus jalan dari flashdisk di Lab Radiologi tanpa jaminan koneksi. Karena itu juga tidak ada modul ES di sini — `import` diblokir CORS pada `file://`, sedangkan `<script src>` klasik tidak.

## Menyunting isi

Isi slide ada di `assets/deck/slides-*.js`, satu berkas per bab. Satu slide adalah satu objek:

```js
D.push({
  id: 's1-07',                       // alamat slide, jangan diubah setelah dibagikan
  chapter: 1,                        // 0 Pembuka · 1 Bab 1 · 2 Jembatan · 3 Bab 2 · 4 Penutup
  kicker: 'Slide kunci Sesi 1',
  title: 'Di Mata Komputer, Radiograf Hanyalah Susunan Angka',
  widget: 'pixel-loupe',             // opsional
  notes: 'Gerakkan lup pelan-pelan dari email ke ruang udara.',
  html: '<div class="s-body">…</div>'
});
```

Logo, garis kuning, footer `ugm.ac.id`, nomor slide, dan progress bar disuntikkan otomatis oleh `deck.js` — tidak perlu ditulis ulang di setiap slide.

Setelah menyunting, jalankan `python tools/check-deck.py`.

### Aturan brand yang berlaku

Deck memakai [UGM Design System](https://brand.ugm.ac.id). Yang mengikat:

- Biru `#01416B` dominan; kuning `#FDD402` **aksen saja** — band, garis 82×3px, bullet, satu sorotan per slide. Tidak pernah jadi latar teks panjang, tidak pernah teks putih di atas kuning.
- Maksimal dua warna latar: putih/paper dan navy. Tidak ada gradien.
- Band bersudut tajam, tidak pernah membulat, tidak pernah memudar.
- **Lambang (seal) UGM tidak dipakai** — itu khusus ijazah, SK, dan upacara. Deck memakai logo *signature*.
- Judul Title Case, isi sentence case, maksimal lima bullet.
- **Tanpa emoji.** Satu pengecualian yang dicatat di kode: penanda sel notebook `▶ ✏ 🩺 ✅` di slide P-05 ditampilkan sebagai kutipan antarmuka, karena peserta melihat karakter yang sama persis di layar mereka.

`tokens/fonts.css` sengaja tidak lagi memuat PT Sans dari Google Fonts: deck harus utuh tanpa internet, dan Gama Sans yang di-*self-host* sudah menanggung seluruh teks.

## Data dan batasnya

Seluruh angka, kotak, dan skor di deck berasal dari `assets/pediatric_opg/` di repo materi — empat radiograf publik berlisensi CC0 beserta anotasi dan keluaran model tersimpan.

> **Deck ini tidak pernah menjalankan model.** Yang ditampilkan adalah keluaran tersimpan untuk diskusi, bukan inferensi baru.

> **Privasi.** Direktori `dataset/` di repo induk berisi berkas dengan nama pasien asli. Deck tidak boleh merujuknya, dan `check-deck.py` menegakkan larangan itu.

Sumber: *Children's Dental Panoramic Radiographs Dataset* (CC0 1.0, DOI `10.6084/m9.figshare.c.6317013.v1`), artikel pendamping DOI `10.1038/s41597-023-02237-5`, dan model `liodon-ai/dental-panoramic-detector` yang diaudit sebagai artefak eksternal.

## Membuat ulang aset

```bash
python tools/build-figures.py            # idempoten; --force untuk tulis ulang semua
python tools/check-deck.py
```

`build-figures.py` membaca **hanya** `assets/pediatric_opg/` dan menghasilkan `assets/figures/` (35 PNG, ~9,6 MB), `assets/figures/manifest.json` (nama, ukuran, SHA-256), serta `assets/deck/data.js`. Skrip memakai `.venv` repo induk (numpy, OpenCV, Pillow). Jalankan dua kali: manifest tidak berubah.

## Ekspor PDF

`Ctrl`+`P` → **Save as PDF**, ukuran **1280 × 720 px**, margin **0**, dan **Background graphics** dinyalakan. Hasilnya 46 halaman lanskap, satu slide per halaman, tanpa navigasi. Widget tercetak pada tampilan awalnya.

Simpan satu salinan PDF di flashdisk sebagai cadangan kalau ada masalah di ruang kelas.

## Preflight sebelum mengajar

1. Buka `index.html` dari laptop yang akan dipakai, di browser yang akan dipakai.
2. Tekan `End` lalu `Home` untuk memastikan 46 slide termuat.
3. Buka Console (F12) — harus bersih.
4. Coba widget kunci: **S1-07** (lup piksel), **S1-10** (ROI), **S2-10** (ambang), **S2-12** (IoU).
5. Matikan Wi-Fi, muat ulang. Deck harus tetap utuh.
6. Sambungkan ke proyektor, tekan `F`, periksa keterbacaan dari baris belakang.
7. Tekan `T` untuk memastikan timer berjalan.
8. Ekspor PDF cadangan.

## Verifikasi tata letak

`check-deck.py` memeriksa aset, privasi, dan kelengkapan, tetapi tidak bisa memeriksa apakah isi slide muat di panggung — itu butuh browser. Jalankan potongan berikut di Console setelah menyunting slide:

```js
document.querySelectorAll('.slide-wrap').forEach(function (w) {
  var prev = w.className; w.className = 'slide-wrap is-active';
  var b = w.querySelector('.s-body');
  if (b && b.scrollHeight > b.clientHeight + 2)
    console.warn(w.id, 'isi melebihi panggung', b.scrollHeight - b.clientHeight, 'px');
  w.className = prev;
});
```

Slide yang memakai widget harus dibuka satu per satu, karena widget baru dipasang saat slidenya aktif.

## Lisensi dan atribusi

Artwork logo dan huruf Gama milik Universitas Gadjah Mada; ikuti ketentuan di [brand.ugm.ac.id](https://brand.ugm.ac.id). Radiograf berlisensi CC0 1.0. Model yang diaudit menyatakan CC BY-NC 4.0 pada model card dan AGPL-3.0 pada metadata ONNX — ketidakkonsistenan itu ditampilkan apa adanya di slide S2-07 sebagai bahan ajar; bobot model tidak didistribusikan.

> **Batas penggunaan.** Seluruh materi hanya untuk pendidikan dan audit model. Deteksi, skor, kotak prediksi, dan *heatmap* tidak boleh dipakai untuk keputusan pelayanan pasien.

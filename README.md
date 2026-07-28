# Lab Skills: Aplikasi Coding AI untuk Radiologi Kedokteran Gigi

Materi ini disiapkan untuk dua sesi *lab skills* di Departemen Radiologi Dentomaksilofasial, Program Pendidikan Dokter Gigi Spesialis Radiologi Kedokteran Gigi, Fakultas Kedokteran Gigi Universitas Gadjah Mada.

Peserta diasumsikan belum pernah menggunakan Python. Fokus kegiatan bukan membangun model, melainkan menjalankan kode yang sudah dipandu, mengubah parameter sederhana, membaca keluaran model secara kritis, dan mengenali kondisi ketika keluaran tersebut tidak layak dipercaya.

> **Batas penggunaan:** seluruh materi hanya untuk pendidikan dan audit model. Notebook, deteksi, skor model, kotak prediksi, dan *heatmap* tidak boleh digunakan untuk keputusan pelayanan pasien.

## Capaian pembelajaran

Setelah menyelesaikan dua sesi, peserta diharapkan dapat:

1. menjalankan sel Google Colab secara berurutan dan memulihkan kesalahan umum;
2. mengenali variabel, *list*, indeks mulai dari nol, fungsi, dan *array* citra;
3. menghubungkan koordinat *bounding box* dengan anatomi pada radiograf panoramik;
4. membandingkan citra asli, *histogram equalization*, dan CLAHE tanpa menganggap peningkatan kontras menciptakan informasi baru;
5. membedakan *classification*, *object detection*, dan *segmentation*;
6. mengubah ambang skor detektor dan menilai konsekuensinya terhadap FP/FN;
7. menjelaskan keterbatasan *label space*, *domain shift*, dan *occlusion sensitivity*; serta
8. menerapkan prinsip privasi, pengawasan manusia, dan penggunaan AI nonklinis.

## Struktur repositori

```text
introduction-coding-for-radiologist/
├── assets/
│   └── pediatric_opg/        # Empat kasus publik, manifest, dan fallback diskusi
├── notebook/
│   ├── Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb
│   └── Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb
├── docs/
│   ├── silabus.md            # Arsip versi awal
│   ├── silabus-2.md          # Silabus final
│   └── notebooks_summary.md
├── scripts/                  # Regenerasi fallback dan pemeriksaan materi
└── README.md
```

## Alur dua sesi

Masing-masing sesi berlangsung 150 menit.

| Menit | Sesi 1 — Python dan Citra | Sesi 2 — AI dan XAI |
|---:|---|---|
| 0–15 | Orientasi, Colab, dan keamanan data | Rekap dan pembacaan kasus sebelum melihat AI |
| 15–45 | Variabel, *list*, indeks, fungsi, dan `print()` | *Classification* vs *detection* vs *segmentation* |
| 45–75 | OPG sebagai *array*: `shape`, `dtype`, piksel, histogram | *Dataset card*, *model card*, train/test, dan *label space* |
| 75–90 | Istirahat dan checkpoint | Istirahat dan checkpoint |
| 90–115 | *Bounding box*, koordinat, ROI, dan *cropping* | Inferensi empat kasus dan perubahan *threshold* |
| 115–135 | *Histogram equalization* dan CLAHE | Ground truth vs prediksi, TP/FP/FN, dan *domain shift* |
| 135–150 | Tantangan kasus kedua dan *exit ticket* | *Occlusion sensitivity*, etika, dan *exit ticket* |

Rincian aktivitas terdapat pada [silabus final](docs/silabus-2.md), sedangkan peta isi dan fungsi setiap notebook terdapat pada [ringkasan notebook](docs/notebooks_summary.md).

## Data dan model

### Radiograf publik

Empat citra uji berasal dari subset pediatrik pada [Children’s Dental Panoramic Radiographs Dataset](https://springernature.figshare.com/articles/dataset/Children_s_Dental_Panoramic_Radiographs_Dataset/21621705) (DOI koleksi: `10.6084/m9.figshare.c.6317013.v1`). Konteks pengumpulan, anonimisasi, persetujuan, serta keterbatasannya dijelaskan dalam [artikel Scientific Data](https://www.nature.com/articles/s41597-023-02237-5) (DOI: `10.1038/s41597-023-02237-5`).

Materi hanya memaketkan empat kasus publik bernama `test_cate1_000`, `test_cate1_001`, `test_cate1_004`, dan `test_cate1_012`. Manifest ringkas tidak menyimpan `imageData` base64 atau metadata pasien. Berkas dataset pada Figshare dinyatakan dengan lisensi CC0 1.0; artikel pendamping menggunakan CC BY 4.0.

### Detektor eksternal

Sesi 2 mengaudit [dental-panoramic-detector](https://huggingface.co/liodon-ai/dental-panoramic-detector) sebagai artefak eksternal, bukan alat pelayanan. Notebook mengambil `best.onnx` pada revisi tetap:

```text
8bef2036b099e80e51f93f24de4b0c0edd366256
```

Unduhan harus memiliki SHA-256 berikut sebelum dapat dipakai:

```text
4cee38b54203634d895ed30a8910f5d7c4cefe22b18f9116b5561d9dd6e83a71
```

Model dijalankan pada CPU dengan `onnxruntime==1.27.0`. Model card menyatakan CC BY-NC 4.0, sedangkan metadata ONNX juga memuat pemberitahuan Ultralytics AGPL-3.0. Keduanya ditampilkan agar pengguna dapat menilai persyaratan yang relevan; materi membatasi penggunaan pada kegiatan akademik nonkomersial dan tidak mendistribusikan bobot model.

## Menggunakan notebook di Google Colab

Kebutuhan minimum:

- browser modern dan akun Google;
- koneksi internet untuk mengambil aset publik, memasang `onnxruntime`, dan mengunduh model pada Sesi 2;
- runtime CPU; GPU tidak diperlukan.

Langkah peserta:

1. Buka notebook dari folder [`notebook/`](notebook/).
2. Pilih **Open in Colab**, atau unggah file `.ipynb` ke Google Drive lalu pilih **Open with → Google Colaboratory**.
3. Pilih **File → Save a copy in Drive**.
4. Pilih **Runtime → Restart session**, kemudian **Runtime → Run all**.
5. Ikuti label sel: `▶ Jalankan`, `✏ Ubah`, `🩺 Diskusikan`, dan `✅ Checkpoint`.
6. Ubah hanya parameter yang ditandai, seperti `CASE_ID`, `ROI`, `CLAHE_CLIP`, `CONF_THRESHOLD`, atau `OCCLUSION_GRID`.

Jika unduhan gagal, baca pesan pemulihan pada notebook lalu coba ulang setelah memeriksa koneksi. Kegagalan checksum menghentikan pemuatan model; berkas lama tidak digunakan. Output tersimpan hanya merupakan **fallback untuk diskusi**, bukan keluaran inferensi yang baru dijalankan.

> **Privasi:** jangan mengunggah radiograf pasien, ekspor DICOM klinis, tangkapan layar sistem rumah sakit, nama, tanggal lahir, nomor rekam medis, atau pengenal lain ke Colab maupun repositori ini. Gunakan hanya `case_id` publik yang telah disediakan.

## Preflight pengajar

Lakukan preflight paling lambat satu hari sebelum kelas:

1. pastikan revisi notebook dan folder `assets/pediatric_opg` sudah dipublikasikan ke branch `main` yang dirujuk loader, atau bagikan folder aset bersama notebook;
2. buka kedua notebook pada runtime Colab CPU yang baru;
3. jalankan **Restart session → Run all** dua kali;
4. pastikan keempat citra, manifest, URL model, revisi, dan checksum dapat diakses;
5. pastikan perbandingan `conf=0.25` dan `conf=0.45` serta *occlusion sensitivity* selesai tanpa GPU;
6. simulasi kegagalan koneksi dan tunjukkan letak fallback diskusi;
7. siapkan salinan lokal notebook dan aset publik untuk presentasi;
8. ingatkan peserta agar tidak mengunggah data pasien; dan
9. tinjau ulang istilah keluaran: gunakan “deteksi”, “prediksi”, dan “skor model”.

Pemeriksaan lokal yang disertakan:

```bash
python scripts/validate_materials.py
python scripts/test_failure_paths.py
python scripts/smoke_run_notebooks.py --runs 2
```

`generate_canonical_fallbacks.py` dapat meregenerasi output tersimpan dari salinan `best.onnx` yang telah diverifikasi. Bobot model tetap tidak dimasukkan ke repositori.

## Batas interpretasi

- Skor model bukan estimasi risiko individual.
- Kotak prediksi tidak menjelaskan sebab suatu temuan.
- *Heatmap occlusion* menunjukkan sensitivitas terhadap penutupan area pada konfigurasi tertentu, bukan bukti keberadaan lesi.
- Kecocokan dengan anotasi dataset tidak sama dengan validasi klinis.
- Dataset pediatrik, skema label, perangkat, populasi, dan protokol akuisisi dapat berbeda dari data yang pernah digunakan untuk melatih model.
- Hasil selalu memerlukan penilaian profesional dan pengawasan manusia.

## Lisensi dan atribusi

Repositori ini belum menetapkan lisensi proyek. Setiap aset pihak ketiga tetap mengikuti lisensi dan ketentuan sumbernya masing-masing. Lihat manifest dan berkas atribusi di [`assets/pediatric_opg/`](assets/pediatric_opg/) sebelum menggunakan ulang aset.

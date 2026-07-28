# Silabus Final Lab Skills

## Aplikasi Coding AI untuk Radiologi Kedokteran Gigi

**Unit:** Departemen Radiologi Dentomaksilofasial, Program Pendidikan Dokter Gigi Spesialis Radiologi Kedokteran Gigi, Fakultas Kedokteran Gigi Universitas Gadjah Mada

**Format:** 2 sesi × 150 menit

**Peserta:** Mahasiswa PPDGS dengan pengalaman Python nol

**Platform:** Google Colab, runtime CPU

**Metode:** Demonstrasi singkat, praktik terpandu, latihan berpasangan, audit kasus, dan diskusi reflektif

> Materi hanya untuk pendidikan nonklinis. Peserta dilarang mengunggah data pasien ke Colab dan hanya menggunakan kasus publik yang dipaketkan bersama notebook.

## Deskripsi

Lab ini mengenalkan coding melalui masalah yang dekat dengan radiologi dentomaksilofasial. Pada Sesi 1 peserta mempelajari sintaks Python minimum yang diperlukan untuk membaca citra, memahami koordinat, membuat ROI, dan membandingkan teknik peningkatan kontras. Pada Sesi 2 peserta menjalankan detektor panoramik publik, mengaudit keluaran terhadap anotasi, serta menggunakan *occlusion sensitivity* untuk membahas keterbatasan interpretasi model.

Peserta tidak melatih model dan tidak membuat checkpoint baru. Model eksternal diperlakukan sebagai artefak yang harus diperiksa, bukan sebagai alat pelayanan.

## Capaian pembelajaran

Pada akhir kegiatan, peserta mampu:

1. menjalankan dan mengulang notebook di Google Colab serta memulihkan kesalahan umum;
2. menggunakan *assignment*, *list*, indeks, fungsi, `shape`, dan *slicing* dalam konteks citra;
3. menjelaskan bahwa OPG digital direpresentasikan sebagai array piksel;
4. menghubungkan koordinat `[x1, y1, x2, y2]` dengan ROI dan anatomi citra;
5. membandingkan citra asli, *histogram equalization*, dan CLAHE secara kritis;
6. membedakan *classification*, *object detection*, dan *segmentation*;
7. mengubah ambang skor detektor serta mengenali konsekuensi FP/FN;
8. membedakan label yang dapat dan tidak dapat dipetakan saat evaluasi;
9. menjelaskan keterbatasan *occlusion sensitivity*, *domain shift*, dan ketidakseimbangan kelas; serta
10. menerapkan prinsip privasi, *human oversight*, dan pencegahan *automation bias*.

## Bahan dan antarmuka peserta

Notebook:

- [Sesi 1 — Dasar Python dan Pengolahan Citra Radiologi](../notebook/Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb)
- [Sesi 2 — Implementasi AI dan Explainable AI](../notebook/Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb)

Kasus publik:

- `test_cate1_001`: kasus utama Sesi 1; sebagian label berada di luar cakupan model;
- `test_cate1_012`: latihan Sesi 1; karies dan label periapikal pada Sesi 2;
- `test_cate1_004`: contoh deteksi parsial; dan
- `test_cate1_000`: contoh ketidakcocokan *label space*.

Sel peserta dibatasi sekitar 5–10 baris dan memakai penanda:

- `▶ Jalankan`
- `✏ Ubah`
- `🩺 Diskusikan`
- `✅ Checkpoint`

Parameter yang boleh diubah adalah `CASE_ID`, `ROI`, `CLAHE_CLIP`, `CONF_THRESHOLD`, dan `OCCLUSION_GRID`. Kode yang lebih kompleks tersedia melalui fungsi pembantu `load_case()`, `show_roi()`, `apply_clahe()`, `load_detector()`, `predict_boxes()`, `match_predictions()`, dan `occlusion_sensitivity()`.

## Sesi 1 — Dasar Python dan Pengolahan Citra

### Agenda 150 menit

| Waktu | Aktivitas | Bukti belajar |
|---:|---|---|
| 0–15 | Orientasi, antarmuka Colab, aturan data, dan demonstrasi pemulihan runtime | Peserta dapat menjalankan sel dan menyebutkan data yang tidak boleh diunggah |
| 15–45 | Variabel, `print()`, *list*, indeks mulai dari nol, pemanggilan fungsi | Peserta mengubah satu nilai dan membaca perubahan output |
| 45–75 | OPG sebagai array: `shape`, `dtype`, rentang piksel, matriks kecil, histogram | Peserta menjelaskan hubungan citra dan angka piksel |
| 75–90 | Istirahat dan checkpoint | Self-check singkat sebelum melanjutkan |
| 90–115 | *Bounding box*, koordinat, ROI, dan *cropping* `[y1:y2, x1:x2]` | Peserta membuat ROI valid pada `test_cate1_001` |
| 115–135 | Citra asli vs *histogram equalization* vs CLAHE | Peserta mengubah `CLAHE_CLIP` dan mencatat manfaat serta artefak |
| 135–150 | Tantangan berpasangan pada `test_cate1_012`, solusi, dan *exit ticket* | Peserta menyelesaikan latihan isi-rumpang dan empat pertanyaan penutup |

### Pokok bahasan

#### Python minimum

- *Assignment*: menyimpan nilai dengan nama.
- *List* dan indeks mulai dari nol.
- Pemanggilan fungsi dan parameter.
- `print()` untuk memeriksa keadaan program.
- `shape` untuk membaca tinggi, lebar, dan kanal.
- *Slicing* ROI dengan urutan baris dahulu, kemudian kolom.

#### Citra dan koordinat

Citra, *bounding box* anotasi, ROI, dan matriks piksel ditampilkan berdampingan. Hal ini menekankan perbedaan antara format kotak `[x1, y1, x2, y2]` dan slicing NumPy `[y1:y2, x1:x2]`.

Contoh pembelajaran berupa PNG 8-bit. DICOM klinis dapat memiliki *bit depth*, metadata, rescale, dan *windowing* yang berbeda; perilaku contoh PNG tidak boleh digeneralisasikan langsung ke sistem klinis.

#### Peningkatan kontras

Perbandingan memakai skala tampilan konsisten. *Histogram equalization* dan CLAHE hanya mengubah representasi intensitas yang tersedia. Keduanya dapat memperkuat noise/artefak dan tidak menciptakan informasi diagnostik baru.

### Penilaian formatif

- checkpoint setelah pengenalan array;
- validasi ROI tidak kosong;
- latihan isi-rumpang dengan solusi tersembunyi dalam `<details>`;
- diskusi pasangan tentang perubahan kontras; dan
- *exit ticket* empat butir: satu konsep Python, satu konsep koordinat, satu keterbatasan peningkatan kontras, dan satu tindakan privasi.

## Sesi 2 — Implementasi AI dan Explainable AI

### Agenda 150 menit

| Waktu | Aktivitas | Bukti belajar |
|---:|---|---|
| 0–15 | Rekap Sesi 1 dan pembacaan kasus sebelum melihat keluaran AI | Peserta mencatat pengamatan dan ketidakpastian awal |
| 15–45 | *Classification* vs *object detection* vs *segmentation* | Peserta memilih jenis tugas yang sesuai untuk contoh pertanyaan |
| 45–75 | *Dataset card*, *model card*, train/test, kelas, dan *label space* | Peserta menemukan setidaknya dua sumber potensi ketidakcocokan |
| 75–90 | Istirahat dan checkpoint | Prediksi awal tentang pengaruh threshold |
| 90–115 | Inferensi empat kasus, `conf=0.25` vs `conf=0.45`, NMS IoU `0.35` | Peserta membandingkan jumlah dan lokasi kotak |
| 115–135 | Ground truth vs prediksi, IoU, TP/FP/FN, *domain shift* | Peserta mengaudit kesalahan tanpa memasukkan label yang tidak sepadan ke metrik |
| 135–150 | *Occlusion sensitivity*, etika, pengawasan manusia, dan *exit ticket* | Peserta mengkritisi heatmap serta menuliskan satu risiko penggunaan |

### Model dan pemrosesan

Notebook menggunakan [liodon-ai/dental-panoramic-detector](https://huggingface.co/liodon-ai/dental-panoramic-detector) pada revisi:

```text
8bef2036b099e80e51f93f24de4b0c0edd366256
```

`best.onnx` diunduh saat runtime dan hanya dimuat jika SHA-256 cocok:

```text
4cee38b54203634d895ed30a8910f5d7c4cefe22b18f9116b5561d9dd6e83a71
```

Inferensi menggunakan `onnxruntime==1.27.0` pada CPU. Citra diproses dengan *letterbox* 640×640 agar rasio aspek dipertahankan, kemudian kotak dikembalikan ke koordinat citra asli. Peserta membandingkan `conf=0.25` dengan rekomendasi model card `conf=0.45`; NMS menggunakan IoU `0.35`.

Model card menyatakan CC BY-NC 4.0. Metadata ONNX juga memuat pemberitahuan Ultralytics AGPL-3.0. Materi menampilkan kedua pemberitahuan, membatasi penggunaan pada kegiatan akademik nonkomersial, dan tidak mendistribusikan bobot.

### Audit label dan metrik

Evaluasi otomatis hanya dilakukan ketika label dapat dipetakan:

| Anotasi dataset | Kelas model | Status evaluasi |
|---|---|---|
| Karies | `caries` | Dapat dipetakan |
| Periodontitis periapikal | `periapical_lesion` | Dapat dipetakan dengan catatan definisi |
| Pit/fisur dalam | Tidak tersedia | Tidak dinilai |
| Lainnya | Tidak tersedia | Tidak dinilai |
| Tidak tersedia | `impacted_tooth` | Tidak dinilai dengan skema anotasi ini |

Label yang tidak sepadan ditampilkan, tetapi tidak dipaksa menjadi benar atau salah. Peserta membahas dampak definisi label, ketidakseimbangan kelas, anotasi, perangkat, usia populasi, dan protokol akuisisi terhadap interpretasi metrik.

### Occlusion sensitivity

Input dibagi menjadi grid, secara default 6×6. Setiap bagian ditutup bergantian, kemudian perubahan skor kelas target diukur. Peserta mengubah `OCCLUSION_GRID` dan membandingkan heatmap dengan kotak anotasi.

Interpretasi wajib:

- perubahan skor bergantung pada ukuran grid, nilai penutup, target kelas, dan baseline;
- area berwarna tidak membuktikan adanya lesi;
- heatmap bukan penjelasan kausal dan bukan validasi model;
- kotak prediksi juga tidak menjelaskan alasan sebab-akibat; dan
- skor model bukan estimasi risiko individual.

### Diskusi keselamatan dan etika

- konsekuensi false positive dan false negative;
- *domain shift* antara data pediatrik dan data/model dari sumber lain;
- *automation bias* dan kecenderungan mencari pembenaran setelah melihat AI;
- keterbatasan label dan anotasi;
- privasi pemrosesan berbasis cloud;
- kebutuhan pengawasan manusia, dokumentasi, dan validasi lokal sebelum aplikasi nyata.

### Penilaian formatif

- tabel prediksi peserta sebelum melihat keluaran model;
- perbandingan threshold;
- audit TP/FP/FN hanya untuk label yang sepadan;
- komentar kritis tentang satu heatmap; dan
- *exit ticket* empat butir: satu kegagalan model, satu contoh *label mismatch*, satu batas XAI, dan satu tindakan *human oversight*.

## Sumber data dan provenance

Empat kasus berasal dari subset pediatrik [Children’s Dental Panoramic Radiographs Dataset](https://springernature.figshare.com/articles/dataset/Children_s_Dental_Panoramic_Radiographs_Dataset/21621705), DOI koleksi `10.6084/m9.figshare.c.6317013.v1`. Figshare mencantumkan berkas dataset sebagai CC0 1.0.

Metode pengumpulan, populasi pediatrik, anonimisasi, persetujuan, dan keterbatasan dijelaskan dalam [Scientific Data: Children’s Dental Panoramic Radiographs Dataset](https://www.nature.com/articles/s41597-023-02237-5), DOI `10.1038/s41597-023-02237-5`, yang diterbitkan dengan CC BY 4.0.

Salinan lokal diberi prefiks `test_`. Manifest hanya menyimpan `case_id`, nama citra, split, label Indonesia/Inggris, koordinat `bbox_xyxy`, sumber, lisensi, DOI, dan SHA-256. Manifest tidak memuat citra base64 atau metadata pasien.

## Pengelolaan risiko kelas

### Privasi

Peserta tidak boleh mengunggah:

- radiograf pasien;
- ekspor DICOM klinis;
- nama, nomor rekam medis, tanggal lahir, atau identitas lain;
- tangkapan layar PACS/RIS/HIS; atau
- berkas rumah sakit yang belum dinyatakan publik.

### Gangguan koneksi

Notebook memunculkan pesan pemulihan jika aset atau model tidak dapat diunduh. Ketidakcocokan checksum menghentikan pemuatan model dan berkas lama tidak boleh dipakai. Output kanonis tersedia sebagai fallback visual untuk diskusi, dengan label jelas bahwa output tersebut tersimpan dan bukan inferensi baru.

### Batas penggunaan

Kegiatan tidak menghasilkan rekomendasi pelayanan. Kecocokan prediksi dengan anotasi dataset bukan pengganti validasi eksternal, studi klinis, evaluasi perangkat lunak medis, atau penilaian dokter gigi.

## Preflight pengajar

Satu hari sebelum kelas:

1. pastikan revisi notebook dan folder `assets/pediatric_opg` sudah dipublikasikan ke branch `main` yang dirujuk loader, atau bagikan folder aset bersama notebook;
2. uji kedua notebook pada runtime Colab CPU baru dengan **Restart session → Run all**;
3. ulangi *Run all* untuk memeriksa determinisme dan urutan state;
4. periksa akses ke empat citra, manifest, model pada revisi tetap, dan SHA-256;
5. pastikan seluruh overlay RGB, transformasi koordinat, ROI, dan heatmap tampil sejajar;
6. pastikan label di luar cakupan tidak masuk ke metrik;
7. simulasi URL gagal, timeout, model tidak tersedia, dan checksum salah;
8. siapkan notebook, aset publik, serta fallback visual dalam salinan lokal;
9. gunakan hanya istilah “deteksi”, “prediksi”, dan “skor model” pada slide/lembar kerja; dan
10. ulangi larangan mengunggah data pasien pada awal setiap sesi.

## Kebutuhan peserta

- Laptop dengan browser modern.
- Akun Google dan akses ke Google Colab.
- Koneksi internet stabil.
- Tidak memerlukan GPU.
- Tidak memerlukan pengalaman Python sebelumnya.

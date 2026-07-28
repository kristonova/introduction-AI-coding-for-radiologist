# Ringkasan Notebook Lab AI Radiologi Dentomaksilofasial

Materi terdiri dari dua notebook berdurasi masing-masing 150 menit untuk peserta PPDGS Radiologi Kedokteran Gigi yang belum pernah menggunakan Python:

- [Sesi 1 — Dasar Python dan Pengolahan Citra Radiologi](../notebook/Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb)
- [Sesi 2 — Implementasi AI dan Explainable AI](../notebook/Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb)

Kedua notebook mengikuti [silabus final](silabus-2.md). [`silabus.md`](silabus.md) dipertahankan sebagai arsip versi awal dan bukan acuan pelaksanaan.

> Semua aktivitas bersifat pendidikan nonklinis. Peserta hanya menggunakan empat kasus publik yang disediakan dan dilarang mengunggah data pasien ke Colab.

## Desain pembelajaran bersama

Notebook menggunakan empat penanda kegiatan:

- `▶ Jalankan`: sel siap dijalankan tanpa perubahan;
- `✏ Ubah`: sel pendek dengan satu atau dua parameter;
- `🩺 Diskusikan`: interpretasi bersama dari perspektif radiologi;
- `✅ Checkpoint`: pemeriksaan pemahaman dan keadaan runtime.

Kode teknis dibungkus dalam fungsi pembantu. Sel yang disentuh peserta dibatasi sekitar 5–10 baris agar waktu kelas digunakan untuk memahami relasi input–proses–output, bukan memperbaiki *syntax error*. Setiap notebook juga memuat tujuan belajar, agenda menit, petunjuk Colab, pemulihan kesalahan, glosarium, solusi latihan dalam elemen `<details>`, dan *exit ticket*.

## Sesi 1 — Python dan citra

Kasus utama adalah `test_cate1_001`; `test_cate1_012` digunakan untuk latihan berpasangan.

### Alur isi

1. **Orientasi dan keamanan data (0–15 menit)**
   - Membuka Colab, membuat salinan di Drive, menjalankan sel, dan *restart runtime*.
   - Memastikan bahwa hanya kasus publik yang digunakan.
2. **Python yang langsung diperlukan (15–45 menit)**
   - *Assignment*, `print()`, *list*, indeks mulai dari nol, dan pemanggilan fungsi.
3. **OPG sebagai array (45–75 menit)**
   - `shape`, `dtype`, rentang piksel, cuplikan matriks, dan histogram.
   - Contoh adalah PNG 8-bit; DICOM klinis dapat mempunyai *bit depth*, metadata, dan mekanisme *windowing* yang berbeda.
4. **Koordinat, kotak, dan ROI (90–115 menit)**
   - Hubungan `bbox_xyxy` dengan citra.
   - Slicing menggunakan urutan `[y1:y2, x1:x2]`.
   - Citra, kotak anotasi, ROI, dan matriks piksel diperlihatkan berdampingan.
5. **Peningkatan kontras (115–135 menit)**
   - Perbandingan citra asli, *histogram equalization*, dan CLAHE dengan skala tampilan konsisten.
   - Peningkatan kontras dapat menguatkan noise dan tidak menambahkan informasi yang tidak direkam sensor.
6. **Tantangan dan penutup (135–150 menit)**
   - Mengganti kasus/ROI, latihan *fill-in-the-blank*, *self-check*, dan *exit ticket* empat butir.

### Parameter dan fungsi pembantu

Peserta hanya mengubah `CASE_ID`, `ROI`, dan `CLAHE_CLIP`. Fungsi pembantu yang digunakan adalah:

- `load_case()`
- `show_roi()`
- `apply_clahe()`

## Sesi 2 — AI dan XAI

Sesi ini menggunakan detektor panoramik publik [liodon-ai/dental-panoramic-detector](https://huggingface.co/liodon-ai/dental-panoramic-detector) sebagai objek audit eksternal. Tidak ada pelatihan model dan tidak ada checkpoint baru.

### Alur isi

1. **Pembacaan kasus tanpa AI (0–15 menit)**
   - Peserta mencatat temuan dan ketidakpastian sebelum melihat keluaran model.
2. **Jenis tugas AI (15–45 menit)**
   - Perbedaan *classification*, *object detection*, dan *segmentation*.
3. **Dataset card, model card, dan label space (45–75 menit)**
   - Perbedaan data train/test dan risiko *domain shift*.
   - Model mengenal `caries`, `periapical_lesion`, dan `impacted_tooth`, sedangkan anotasi kasus publik mempunyai label tambahan.
4. **Inferensi empat kasus (90–115 menit)**
   - Input diproses dengan *letterbox* 640×640 agar rasio aspek dipertahankan.
   - Peserta membandingkan `conf=0.25` dengan rekomendasi model card `conf=0.45`; NMS memakai IoU `0.35`.
5. **Audit prediksi (115–135 menit)**
   - Ground truth vs prediksi, IoU, TP/FP/FN, ketidakseimbangan kelas, dan pergeseran domain.
   - Evaluasi otomatis hanya mencakup `caries` dan `periapical_lesion`.
   - `impacted_tooth`, *deep pit/fissure*, dan `other` ditampilkan sebagai label yang tidak dapat dinilai dengan skema label lawannya; label tersebut tidak dipaksa masuk ke metrik.
6. **Occlusion sensitivity dan etika (135–150 menit)**
   - Grid menutup bagian input secara bergantian dan mengukur perubahan skor kelas.
   - Peserta mengubah ukuran grid, lalu membandingkan *heatmap* dengan anotasi.
   - Diskusi mencakup FP/FN, *automation bias*, privasi cloud, dan pengawasan manusia.

### Urutan kasus

| Kasus | Fokus diskusi |
|---|---|
| `test_cate1_004` | Deteksi parsial dan pengaruh ambang skor |
| `test_cate1_012` | Karies serta label periapikal |
| `test_cate1_001` | Sebagian anotasi berada di luar cakupan model |
| `test_cate1_000` | Ketidakcocokan *label space* |

### Parameter dan fungsi pembantu

Peserta hanya mengubah `CASE_ID`, `CONF_THRESHOLD`, dan `OCCLUSION_GRID`. Fungsi pembantu yang disediakan adalah:

- `load_case()`
- `load_detector()`
- `predict_boxes()`
- `match_predictions()`
- `occlusion_sensitivity()`

Model ONNX diunduh pada revisi `8bef2036b099e80e51f93f24de4b0c0edd366256`, diverifikasi dengan SHA-256 `4cee38b54203634d895ed30a8910f5d7c4cefe22b18f9116b5561d9dd6e83a71`, lalu dijalankan pada CPU menggunakan `onnxruntime==1.27.0`. Kegagalan unduhan atau checksum menghentikan pemuatan model dan memunculkan petunjuk pemulihan.

## Aset, fallback, dan provenance

Empat radiograf berasal dari [Children’s Dental Panoramic Radiographs Dataset](https://springernature.figshare.com/articles/dataset/Children_s_Dental_Panoramic_Radiographs_Dataset/21621705), dengan konteks metode dan anonimisasi dalam [artikel Scientific Data](https://www.nature.com/articles/s41597-023-02237-5). Salinan lokal menggunakan prefiks `test_` dan manifest ringkas tanpa `imageData` base64 atau metadata pasien.

Output kanonis disimpan untuk menjaga kelangsungan diskusi jika koneksi kelas bermasalah. Saat dipakai, notebook memberi label yang jelas bahwa output tersebut adalah **fallback tersimpan**, bukan inferensi baru. Pengajar tetap perlu menguji jalur inferensi daring sebelum kelas.

## Interpretasi yang wajib dipertahankan

- Angka keluaran adalah skor model, bukan estimasi risiko pasien.
- Kotak prediksi bukan penjelasan kausal.
- *Heatmap occlusion* bukan bukti lesi dan bukan validasi model.
- Kecocokan dengan anotasi dataset tidak menjamin kegunaan pada populasi atau perangkat lain.
- Keluaran model tidak menggantikan pembacaan radiograf, informasi klinis, atau tanggung jawab dokter gigi.

## Petunjuk singkat Colab

1. Unggah notebook ke Drive atau buka dari repositori.
2. Pilih **File → Save a copy in Drive**.
3. Gunakan runtime CPU.
4. Pilih **Runtime → Restart session**, kemudian **Runtime → Run all**.
5. Jika unduhan gagal, periksa koneksi dan jalankan ulang sel persiapan. Jangan melewati pemeriksaan checksum.
6. Jangan mengunggah radiograf klinis atau pengenal pasien.

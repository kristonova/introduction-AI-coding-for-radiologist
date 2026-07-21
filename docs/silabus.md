Anda diminta Mengisi kuliah tamu di FKG UGM. Membawa perspektif *computer science* dan AI ke ranah klinis kedokteran gigi membutuhkan pendekatan yang sangat visual dan praktis, terutama karena mahasiswanya diasumsikan berangkat dari titik nol dalam pemrograman.

Kunci utama untuk peserta non-programmer adalah: **Hindari instalasi lokal yang rumit (gunakan Google Colab), minimalkan teori matematika mendalam, dan maksimalkan visualisasi (seperti *heatmaps* pada X-Ray).** Berikut adalah usulan silabus untuk 2 sesi praktikum (masing-masing 150 menit) yang dirancang agar interaktif, relevan dengan radiologi gigi, dan tidak mengintimidasi.

---

### **Sesi 1: Dasar Python & Pengolahan Citra Digital Radiologi (150 Menit)**

**Fokus:** Membiasakan mahasiswa dengan *environment* coding dan cara komputer "melihat" citra radiologi (X-Ray Periapikal/Panoramik).

**0 - 30 Menit: Pengantar AI di Kedokteran Gigi & Setup Colab**

* **Kasus Penggunaan Nyata:** Tunjukkan contoh AI yang sudah ada (misalnya: deteksi karies, sefalometri otomatis, klasifikasi kista/tumor).
* **Setup:** Membuka Google Colab. Jelaskan bahwa Colab adalah "buku catatan" digital untuk coding tanpa perlu *install* apapun.
* **Pengenalan UI Colab:** Cara membuat *cell* teks dan *cell* kode, serta cara menjalankannya (Shift+Enter).

**30 - 75 Menit: *Crash Course* Python (Sangat Dasar)**

* **Variabel & Tipe Data:** Jelaskan analogi variabel sebagai "kotak penyimpan data" (misal: nama pasien, umur).
* **List & Array Dasar:** Kumpulan data.
* **Import Library:** Jelaskan analoginya seperti "memanggil alat medis khusus dari gudang". (Fokus pada `numpy`, `matplotlib`, dan `cv2` / OpenCV).
* *Praktik:* Menulis script 5-10 baris pertama mereka.

**75 - 90 Menit: Jeda / Istirahat**

**90 - 150 Menit: Hands-on Manipulasi Citra Radiologi (X-Ray)**

* **Upload Data:** Cara mengunggah contoh gambar rontgen gigi ke Colab.
* **Komputer Melihat Angka, Bukan Gambar:** Demonstrasi bahwa gambar rontgen sebenarnya adalah matriks piksel (angka 0 untuk hitam, 255 untuk putih). Ini konsep krusial untuk dokter!
* **Manipulasi Klinis Sederhana dengan Code:**
* Membaca dan menampilkan gambar X-Ray menggunakan `matplotlib`.
* *Cropping* area spesifik (misal: memotong area mahkota gigi).
* Meningkatkan kontras gambar (*Histogram Equalization*) untuk memperjelas lesi karies atau garis fraktur.


* *Output Sesi 1:* Mahasiswa berhasil mengolah dan memodifikasi visual gambar rontgen menggunakan kode Python mereka sendiri.

---

### **Sesi 2: Implementasi AI (Deep Learning) untuk Analisis Radiologi Gigi (150 Menit)**

**Fokus:** Menggunakan model AI (*Pre-trained*) untuk mengklasifikasi kondisi patologis dan memahami cara AI mengambil keputusan.

**0 - 30 Menit: Konsep Dasar AI dalam Radiologi**

* **Tiga Konsep Utama (Tanpa Matematika):** 1.  *Classification* (Gigi Sehat vs Karies).
2.  *Object Detection* (Menandai lokasi karies dengan kotak / *bounding box*).
3.  *Segmentation* (Mewarnai area spesifik, misal anatomi saluran akar).
* **Analogi Jaringan Saraf Tiruan:** Analogikan dengan cara otak dokter gigi muda belajar mengenali pola penyakit dari ribuan gambar rontgen.

**30 - 75 Menit: Hands-on Klasifikasi Gambar (Karies vs Normal)**

* **Persiapan Data:** Sediakan *toy dataset* (dataset kecil yang sudah Anda siapkan di Google Drive/GitHub, berisi folder X-Ray "Normal" dan "Karies").
* **Memuat Model AI:** Daripada membangun model dari nol (yang memakan waktu dan rumit), gunakan arsitektur yang sudah ada (misal menggunakan TensorFlow/Keras yang disederhanakan).
* *Praktik:* Mahasiswa menjalankan *cell* kode yang memuat gambar rontgen baru, memberikan gambar tersebut ke model AI, dan mengeluarkan teks prediksi (misal: "Prediksi: Karies, Probabilitas: 92%").

**75 - 90 Menit: Jeda / Istirahat**

**90 - 130 Menit: *Explainable AI* (Grad-CAM / Heatmaps) – Sesi Paling Penting**

* **Masalah *Black-Box*:** Dokter tidak boleh percaya begitu saja pada mesin.
* **Visualisasi Heatmap:** Sediakan kode *copy-paste* yang bisa mengubah hasil AI menjadi *heatmap* (area berwarna merah/panas pada rontgen).
* *Praktik:* Mahasiswa melihat bahwa AI memprediksi karies karena model tersebut "memperhatikan" area radiolusen pada enamel/dentin. Ini akan sangat membuka wawasan (*mind-blowing*) bagi mahasiswa kedokteran gigi.

**130 - 150 Menit: Diskusi Klinis, Etika, & Penutup**

* **Limitasi AI:** Kapan AI bisa salah? (Overfitting, kualitas X-Ray yang buruk, artefak logam).
* **Etika:** AI sebagai asisten (*Augmented Intelligence*), bukan pengganti dokter gigi.
* **Q&A.**

### **Tips Tambahan Persiapan:**

* **Siapkan *Notebook Boilerplate*:** Buat Google Colab *notebook* yang sudah berisi kode-kode yang rumit, lalu tinggalkan beberapa bagian kosong (seperti parameter angka atau nama *file*) agar mahasiswa bisa mengisinya sendiri (*fill-in-the-blanks*). Ini menghindari stres akibat *typo syntax*.
* **Gunakan Dataset Terbuka:** Anda bisa mencari sampel citra gigi dari Kaggle (seperti *dental caries dataset* atau *panoramic x-ray dataset*) dan memangkas jumlahnya agar proses *loading* saat praktikum berjalan cepat.

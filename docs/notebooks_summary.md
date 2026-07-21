# Ringkasan Notebook Praktikum AI untuk Radiologi UGM

Dua Python notebook telah berhasil dibuat berdasarkan kurikulum pada [silabus-2.md](file:///D:/PROJECT/introduction-coding-for-radiologist/silabus-2.md) untuk perkuliahan tamu di Fakultas Kedokteran Gigi (FKG) UGM, Departemen Radiologi.

Berikut adalah tautan langsung ke notebook yang telah digenerasikan di dalam workspace:
*   [Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb](file:///D:/PROJECT/introduction-coding-for-radiologist/Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb)
*   [Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb](file:///D:/PROJECT/introduction-coding-for-radiologist/Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb)

---

## Struktur dan Rencana Pembelajaran

### Sesi 1: Dasar Python & Pengolahan Citra Digital Radiologi
*   **Target Peserta:** Mahasiswa kedokteran/kedokteran gigi dengan nol latar belakang pemrograman.
*   **Metodologi Pembelajaran:** Menghindari teori matematika rumit dan memaksimalkan visualisasi praktis.
*   **Rincian Bagian:**
    1.  **Pengenalan Google Colab:** Cara menggunakan *cell* kode, memproses perintah dengan `Shift + Enter`.
    2.  **Crash Course Python Dasar:** Variabel (analogi kotak obat/data pasien), List/Array (menyimpan nomor gigi bermasalah), dan import library medis (`numpy`, `matplotlib.pyplot`, `cv2`).
    3.  **Hands-on Manipulasi Citra Rontgen:**
        *   Mengunduh gambar rontgen gigi secara otomatis menggunakan Python `urllib` dari repositori publik.
        *   Memahami representasi gambar sebagai matriks intensitas piksel (angka 0-255).
        *   Melakukan pemotongan area spesifik (*Region of Interest* / ROI) pada gigi yang dicurigai karies.
        *   Meningkatkan visualisasi lesi karies/fraktur menggunakan peningkatan kontras global (*Histogram Equalization*) dan kontras lokal (*CLAHE*).
        *   *Latihan Mandiri:* Mahasiswa memodifikasi parameter kontras CLAHE untuk melihat pengaruhnya secara langsung.

### Sesi 2: Implementasi AI (Deep Learning) & Explainable AI
*   **Target Peserta:** Mahasiswa memahami cara kerja klasifikasi AI secara klinis serta konsep keterbukaan model (*Explainable AI*).
*   **Rincian Bagian:**
    1.  **Persiapan Lingkungan:** Mengaktifkan pustaka Deep Learning (`PyTorch` & `torchvision`).
    2.  **Memuat Model AI (ResNet-18):** Menggunakan teknik *Transfer Learning* dengan model arsitektur ResNet-18 standar industri yang telah dimodifikasi lapisan klasifikasinya untuk mendeteksi `Normal` vs `Karies Gigi`.
    3.  **Inferensi AI:** Menjalankan model untuk memprediksi probabilitas klinis (persentase) karies gigi dari gambar uji.
    4.  **Explainable AI (Grad-CAM):**
        *   Menggunakan pemetaan aktivasi berbasis gradien (*Grad-CAM*) untuk memvisualisasikan area perhatian utama AI.
        *   Menghasilkan *heatmap* warna (area merah = fokus AI) yang ditumpangkan (*overlay*) di atas gambar rontgen gigi asli.
        *   Mendiskusikan pentingnya dokter gigi memverifikasi apakah AI fokus pada lesi karies sebenarnya atau terdistraksi oleh artefak klinis.
        *   *Latihan Mandiri:* Mahasiswa memvisualisasikan heatmap untuk kelas normal/sehat.

---

## Petunjuk Penggunaan bagi Pengajar

> [!NOTE]
> Kedua notebook telah dirancang agar bersifat mandiri (*self-contained*). Seluruh data gambar rontgen uji akan diunduh secara otomatis dari internet saat sel kode dijalankan di Google Colab. Mahasiswa tidak perlu mengunggah gambar secara manual.

### Cara Membuka di Google Colab:
1.  Unggah kedua file `.ipynb` tersebut ke Google Drive Anda.
2.  Buka Google Drive melalui browser, klik kanan pada file notebook, dan pilih **Open with > Google Colaboratory**.
3.  Bagikan tautan Google Colab tersebut kepada mahasiswa dengan mode *View only* (mahasiswa dapat menyalin ke drive masing-masing dengan menekan **File > Save a copy in Drive** sebelum melakukan pengeditan dan latihan).

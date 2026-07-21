<br># 🦷 Introduction to AI Coding for Radiologists

<p align="center">
  <em>Materi Praktikum Kuliah Tamu — Fakultas Kedokteran Gigi, Universitas Gadjah Mada</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Google%20Colab-F9AB00?logo=googlecolab&logoColor=white" alt="Google Colab"/>
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Framework-PyTorch-EE4C2C?logo=pytorch&logoColor=white" alt="PyTorch"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
</p>

---

## 📋 Tentang Proyek

Repository ini berisi materi praktikum **pengantar pemrograman Python dan Artificial Intelligence (AI)** yang dirancang khusus untuk **mahasiswa kedokteran gigi dan radiologi** yang berangkat dari **titik nol pemrograman**.

Materi dikemas dalam format **Jupyter Notebook** yang siap dijalankan di **Google Colab** — tanpa perlu instalasi apapun di komputer lokal.

### 🎯 Tujuan Pembelajaran

- Memahami dasar pemrograman Python dalam konteks klinis radiologi gigi
- Mampu melakukan pengolahan citra digital rontgen gigi menggunakan kode
- Memahami cara kerja model AI (*Deep Learning*) untuk klasifikasi patologi gigi
- Mengenal konsep *Explainable AI* (Grad-CAM) untuk transparansi keputusan model

---

## 📂 Struktur Repository

```
introduction-coding-for-radiologist/
│
├── notebook/
│   ├── Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb
│   └── Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb
│
├── docs/
│   ├── silabus.md              # Silabus versi awal
│   ├── silabus-2.md            # Silabus revisi final
│   └── notebooks_summary.md    # Ringkasan isi kedua notebook
│
└── README.md
```

---

## 🧪 Sesi Praktikum

### Sesi 1 — Dasar Python & Pengolahan Citra Digital Radiologi
**Durasi:** 150 menit &nbsp;|&nbsp; **Level:** Pemula Absolut

| Topik | Deskripsi |
|---|---|
| **Pengenalan Google Colab** | Setup environment, menjalankan cell kode |
| **Crash Course Python** | Variabel, List, import library (`numpy`, `matplotlib`, `cv2`) |
| **Manipulasi Citra Rontgen** | Membaca gambar X-Ray, memahami piksel sebagai matriks angka |
| **Region of Interest (ROI)** | Cropping area gigi yang dicurigai karies |
| **Peningkatan Kontras** | Histogram Equalization & CLAHE untuk memperjelas lesi |

> **Output:** Mahasiswa mampu mengolah dan memodifikasi visual gambar rontgen gigi menggunakan kode Python mereka sendiri.

---

### Sesi 2 — Implementasi AI (Deep Learning) & Explainable AI
**Durasi:** 150 menit &nbsp;|&nbsp; **Level:** Menengah

| Topik | Deskripsi |
|---|---|
| **Konsep AI Tanpa Matematika** | Classification, Object Detection, Segmentation |
| **Transfer Learning (ResNet-18)** | Memuat model pre-trained untuk deteksi Normal vs Karies |
| **Inferensi AI** | Menjalankan prediksi probabilitas klinis dari gambar rontgen |
| **Explainable AI (Grad-CAM)** | Visualisasi heatmap area fokus perhatian model AI |
| **Diskusi Klinis & Etika** | Limitasi AI, artefak, peran AI sebagai asisten dokter |

> **Output:** Mahasiswa memahami cara AI mengambil keputusan dan mampu memvisualisasikan area fokus model menggunakan Grad-CAM heatmap.

---

## 🚀 Cara Menggunakan

### Opsi 1: Google Colab (Direkomendasikan)

1. **Unduh** kedua file `.ipynb` dari folder `notebook/`
2. **Unggah** ke Google Drive Anda
3. **Klik kanan** pada file notebook → **Open with** → **Google Colaboratory**
4. Jalankan setiap cell kode secara berurutan dengan menekan `Shift + Enter`

> [!NOTE]
> Seluruh data gambar rontgen uji akan **diunduh secara otomatis** dari internet saat cell kode dijalankan. Tidak perlu mengunggah gambar secara manual.

### Opsi 2: Jalankan Lokal

```bash
# Clone repository
git clone https://github.com/kristonova/introduction-AI-coding-for-radiologist.git
cd introduction-AI-coding-for-radiologist

# Buat virtual environment (opsional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install numpy matplotlib opencv-python torch torchvision jupyter

# Jalankan Jupyter
jupyter notebook
```

---

## 🧰 Tech Stack

| Komponen | Teknologi |
|---|---|
| **Platform** | Google Colab / Jupyter Notebook |
| **Bahasa** | Python 3.8+ |
| **Pengolahan Citra** | OpenCV (`cv2`), NumPy, Matplotlib |
| **Deep Learning** | PyTorch, torchvision |
| **Arsitektur Model** | ResNet-18 (Transfer Learning) |
| **Explainability** | Grad-CAM |

---

## 📖 Petunjuk untuk Pengajar

1. **Bagikan notebook** ke mahasiswa melalui Google Colab dengan mode *View only*
2. Instruksikan mahasiswa untuk menekan **File → Save a copy in Drive** sebelum mengedit
3. Notebook bersifat **self-contained** — semua resource diunduh otomatis saat runtime
4. Sediakan waktu jeda (~15 menit) di antara setiap sesi untuk istirahat dan tanya jawab

> [!TIP]
> Siapkan beberapa pertanyaan diskusi klinis di akhir Sesi 2, terutama seputar limitasi AI dan pentingnya validasi oleh dokter gigi.

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch fitur (`git checkout -b fitur/nama-fitur`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur/nama-fitur`)
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- **Fakultas Kedokteran Gigi, Universitas Gadjah Mada** — untuk kesempatan kuliah tamu
- Dataset citra rontgen gigi dari sumber publik
- Komunitas open-source PyTorch dan OpenCV

---

<p align="center">
  <sub>Dibuat dengan ❤️ untuk pendidikan AI di bidang radiologi kedokteran gigi</sub>
</p>

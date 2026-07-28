# Atribusi aset OPG pediatrik

Empat citra di folder ini adalah salinan dari split `Test` pada **Pediatric dental disease detection dataset**, bagian dari *Children’s Dental Panoramic Radiographs Dataset*. Nama salinan diberi prefiks `test_` agar tidak bertabrakan dengan nama dari split lain.

- Rekaman data: [Springer Nature Figshare 21621705](https://springernature.figshare.com/articles/dataset/Children_s_Dental_Panoramic_Radiographs_Dataset/21621705)
- DOI koleksi data: [10.6084/m9.figshare.c.6317013.v1](https://doi.org/10.6084/m9.figshare.c.6317013.v1)
- Artikel data: Zhang Y, Ye F, Chen L, et al. *Scientific Data* 10, 380 (2023), [10.1038/s41597-023-02237-5](https://doi.org/10.1038/s41597-023-02237-5)
- Lisensi rekaman data: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)

Artikel melaporkan bahwa citra telah dianonimkan, penggunaan data memperoleh persetujuan orang tua/wali, dan dataset ditelaah komite etik. Hal tersebut tidak menghapus kewajiban peserta untuk menjaga privasi: **jangan mengunggah radiograf pasien atau data klinis institusi ke Colab**. Materi ini hanya menggunakan case ID publik.

`cases.json` adalah manifest turunan yang:

- hanya memuat case ID publik, nama berkas, split, label terjemahan, kotak anotasi, serta checksum;
- tidak memuat `imageData` base64 atau metadata pasien;
- membulatkan koordinat kotak pecahan ke arah luar agar tetap mencakup anotasi sumber;
- menandai kelas yang tidak mempunyai padanan pada model eksternal sebagai tidak dapat dinilai.

Seluruh materi dan output turunan di folder ini ditujukan untuk pendidikan dan audit model, bukan penggunaan klinis.

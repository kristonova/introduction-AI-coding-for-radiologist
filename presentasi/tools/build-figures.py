#!/usr/bin/env python3
"""Membangun figur turunan untuk deck presentasi.

Sumber data HANYA `assets/pediatric_opg/` di repo materi: empat radiograf
panoramik publik (CC0) beserta manifest anotasinya. Direktori `dataset/`
mengandung berkas dengan nama pasien asli dan TIDAK BOLEH disentuh skrip ini
maupun dirujuk deck; `check-deck.py` menegakkan larangan itu.

Skrip idempoten: jalankan berkali-kali, `manifest.json` tidak berubah selama
sumbernya sama. Keluaran ditulis ke `presentasi/assets/figures/`.

    python presentasi/tools/build-figures.py
    python presentasi/tools/build-figures.py --force    # tulis ulang semua

Butuh numpy, opencv-python, dan Pillow - semuanya sudah ada di `.venv` repo.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "pediatric_opg"
OUT = Path(__file__).resolve().parents[1] / "assets" / "figures"

# Lebar target untuk gambar yang tampil penuh di panggung 1280x720. Dua kali
# lipat lebar tampil supaya tetap tajam saat deck diproyeksikan pada layar
# beresolusi tinggi, tanpa membawa PNG 2000px yang berat.
SLIDE_W = 1400

# ROI yang dipakai notebook Sesi 1 sebagai contoh pertama.
ROI_DEMO = [620, 270, 920, 710]

# ROI terpisah untuk tangga kontras: lanskap, supaya enam frame perbandingan
# muat berdampingan di panggung 16:9 tanpa mengecil jadi tak terbaca.
ROI_KONTRAS = [560, 300, 1240, 700]

# Warna UGM untuk anotasi yang digambar skrip ini (BGR untuk OpenCV).
UGM_BLUE_BGR = (107, 65, 1)
UGM_YELLOW_BGR = (2, 212, 253)


# --------------------------------------------------------------------------
# Utilitas
# --------------------------------------------------------------------------


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest() -> dict:
    with (SRC / "cases.json").open(encoding="utf-8") as fh:
        return json.load(fh)


def read_gray(case_id: str) -> np.ndarray:
    img = cv2.imread(str(SRC / f"{case_id}.png"), cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise SystemExit(f"Gagal membaca {case_id}.png dari {SRC}")
    return img


def write(name: str, img: np.ndarray, force: bool = False) -> Path:
    """Tulis PNG. Melewati penulisan bila isinya identik, supaya idempoten."""
    path = OUT / name
    ok, buf = cv2.imencode(".png", img, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    if not ok:
        raise SystemExit(f"Gagal meng-encode {name}")
    data = buf.tobytes()
    if not force and path.exists() and path.read_bytes() == data:
        return path
    path.write_bytes(data)
    return path


def resize_w(img: np.ndarray, width: int) -> np.ndarray:
    h = int(round(img.shape[0] * width / img.shape[1]))
    interp = cv2.INTER_AREA if width < img.shape[1] else cv2.INTER_CUBIC
    return cv2.resize(img, (width, h), interpolation=interp)


def histogram_strip(gray: np.ndarray, w: int = 560, h: int = 150) -> np.ndarray:
    """Histogram intensitas sebagai gambar, bergaya UGM (batang navy)."""
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    hist = hist / hist.max() if hist.max() > 0 else hist
    canvas = np.full((h, w, 3), 248, np.uint8)
    for x in range(256):
        bar = int(round(hist[x] * (h - 12)))
        x0 = int(round(x * w / 256))
        x1 = max(x0 + 1, int(round((x + 1) * w / 256)))
        cv2.rectangle(canvas, (x0, h - bar), (x1 - 1, h), UGM_BLUE_BGR, -1)
    cv2.rectangle(canvas, (0, 0), (w - 1, h - 1), (231, 229, 227), 1)
    return canvas


# --------------------------------------------------------------------------
# F1 - histogram identik, anatomi hancur
# --------------------------------------------------------------------------


def fig_histogram_twin(force: bool) -> None:
    """Dua citra dengan histogram identik persis.

    Mengacak posisi piksel adalah permutasi: multiset nilai keabuan tidak
    berubah sedikit pun, jadi histogramnya sama sampai bin terakhir - tetapi
    seluruh geometri anatomi lenyap. Ini bukti visual paling langsung bahwa
    histogram buta terhadap struktur, poin kritis di notebook Sesi 1.
    """
    gray = read_gray("test_cate1_004")
    small = resize_w(gray, 900)

    rng = np.random.default_rng(20260915)  # tanggal sesi 1, supaya reprodusibel
    flat = small.flatten().copy()
    rng.shuffle(flat)
    scrambled = flat.reshape(small.shape)

    write("f1-histogram-asli.png", cv2.cvtColor(small, cv2.COLOR_GRAY2BGR), force)
    write("f1-histogram-acak.png", cv2.cvtColor(scrambled, cv2.COLOR_GRAY2BGR), force)
    write("f1-histogram-asli-hist.png", histogram_strip(small), force)
    write("f1-histogram-acak-hist.png", histogram_strip(scrambled), force)

    h_a = cv2.calcHist([small], [0], None, [256], [0, 256])
    h_b = cv2.calcHist([scrambled], [0], None, [256], [0, 256])
    assert np.array_equal(h_a, h_b), "Histogram seharusnya identik setelah permutasi"


# --------------------------------------------------------------------------
# F2/F3/F4 - tangga CLAHE dan penguatan derau
# --------------------------------------------------------------------------


def clahe(gray: np.ndarray, clip: float) -> np.ndarray:
    return cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8)).apply(gray)


def fig_clahe_ladder(force: bool) -> None:
    """Asli / histogram equalization / CLAHE pada empat clip limit."""
    gray = read_gray("test_cate1_001")
    x1, y1, x2, y2 = ROI_KONTRAS
    roi = gray[y1:y2, x1:x2]
    roi = resize_w(roi, 680)

    frames = {
        "asli": roi,
        "he": cv2.equalizeHist(roi),
        "clahe10": clahe(roi, 1.0),
        "clahe20": clahe(roi, 2.0),
        "clahe40": clahe(roi, 4.0),
        "clahe80": clahe(roi, 8.0),
    }
    for key, img in frames.items():
        write(f"f3-kontras-{key}.png", cv2.cvtColor(img, cv2.COLOR_GRAY2BGR), force)
        write(f"f4-kontras-{key}-hist.png", histogram_strip(img, w=680, h=110), force)

    # F2: zoom area yang secara radiografis relatif homogen. CLAHE clip tinggi
    # menaikkan kontras lokal di sini, dan yang ikut terangkat adalah derau -
    # bukan informasi diagnostik baru.
    patch = gray[300:420, 900:1140]
    patch = cv2.resize(patch, (480, 240), interpolation=cv2.INTER_NEAREST)
    patch_clahe = cv2.resize(
        clahe(gray, 8.0)[300:420, 900:1140], (480, 240), interpolation=cv2.INTER_NEAREST
    )
    write("f2-derau-asli.png", cv2.cvtColor(patch, cv2.COLOR_GRAY2BGR), force)
    write("f2-derau-clahe80.png", cv2.cvtColor(patch_clahe, cv2.COLOR_GRAY2BGR), force)


# --------------------------------------------------------------------------
# F5 - citra kecil untuk lup piksel
# --------------------------------------------------------------------------


def fig_pixel_source(force: bool) -> None:
    """Grayscale kecil yang dibaca widget `pixel-loupe` lewat canvas.

    Sengaja kecil (640px): widget membaca nilai piksel apa adanya, dan angka
    yang muncul di layar harus benar-benar nilai yang ada di berkas ini.
    """
    gray = read_gray("test_cate1_004")
    small = resize_w(gray, 640)
    write("f5-loupe-src.png", cv2.cvtColor(small, cv2.COLOR_GRAY2BGR), force)


# --------------------------------------------------------------------------
# F6 - letterbox 640x640
# --------------------------------------------------------------------------


def fig_letterbox(force: bool) -> None:
    """Bagaimana OPG 2000x942 masuk ke input model 640x640.

    Meniru persis pra-pemrosesan notebook Sesi 2: skala seragam lalu padding
    abu 114 di atas dan bawah. Slide memakainya untuk menjelaskan mengapa
    koordinat keluaran model harus dipetakan balik ke citra asli.
    """
    img = cv2.imread(str(SRC / "test_cate1_004.png"), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    r = min(640 / w, 640 / h)
    nw, nh = int(round(w * r)), int(round(h * r))
    resized = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)

    canvas = np.full((640, 640, 3), 114, np.uint8)
    top = (640 - nh) // 2
    left = (640 - nw) // 2
    canvas[top:top + nh, left:left + nw] = resized

    # Tandai batas citra nyata supaya area padding terbaca jelas di slide.
    cv2.rectangle(canvas, (left, top), (left + nw - 1, top + nh - 1), UGM_YELLOW_BGR, 2)
    write("f6-letterbox-640.png", canvas, force)


# --------------------------------------------------------------------------
# F7 - versi slide-ready dari aset yang sudah ada
# --------------------------------------------------------------------------


def fig_slide_ready(force: bool) -> None:
    """Turunkan resolusi OPG, overlay ambang, dan heatmap oklusi.

    Berkas kanonik di repo materi berukuran 0,5-2,6 MB per berkas. Deck harus
    muat di flashdisk dan dimuat instan dari file://, jadi semuanya diturunkan
    ke lebar tampil dan disimpan ulang.
    """
    cases = ["test_cate1_000", "test_cate1_001", "test_cate1_004", "test_cate1_012"]

    for case in cases:
        img = cv2.imread(str(SRC / f"{case}.png"), cv2.IMREAD_COLOR)
        write(f"f7-opg-{case}.png", resize_w(img, SLIDE_W), force)

        for conf in ("025", "045"):
            name = f"canonical_overlay_{case}_conf{conf}.png"
            path = SRC / name
            if not path.exists():
                print(f"  ! lewati (tidak ada): {name}")
                continue
            overlay = cv2.imread(str(path), cv2.IMREAD_COLOR)
            write(f"f7-overlay-{case}-conf{conf}.png", resize_w(overlay, SLIDE_W), force)

    extras = {
        "canonical_occlusion_test_cate1_004_grid6.png": "f7-oklusi-grid6.png",
        "canonical_sesi2_occlusion.png": "f7-oklusi-ringkas.png",
        "canonical_sesi1_overview.png": "f7-sesi1-ringkas.png",
    }
    for src_name, out_name in extras.items():
        path = SRC / src_name
        if not path.exists():
            print(f"  ! lewati (tidak ada): {src_name}")
            continue
        img = cv2.imread(str(path), cv2.IMREAD_COLOR)
        write(out_name, resize_w(img, SLIDE_W), force)


# --------------------------------------------------------------------------
# F8 - data untuk widget
# --------------------------------------------------------------------------


def fig_widget_data(force: bool) -> None:
    """Ekspor anotasi dan prediksi yang dibutuhkan widget sebagai satu JS.

    Ditulis sebagai `window.DECK_DATA` dalam berkas .js, bukan .json, karena
    `fetch()` diblokir pada file:// sementara <script src> tidak. Pola yang
    sama dipakai project referensi untuk peta SVG-nya.
    """
    manifest = load_manifest()
    with (SRC / "precomputed_predictions.json").open(encoding="utf-8") as fh:
        preds = json.load(fh)

    cases = {}
    for case in manifest["cases"]:
        cases[case["case_id"]] = {
            "width": case["width"],
            "height": case["height"],
            "sha256": case["sha256"],
            "annotations": [
                {
                    "label": a["label_indonesia"],
                    "labelId": a["label_id"],
                    "bbox": a["bbox_xyxy"],
                    "evalClass": a["evaluation_model_class"],
                }
                for a in case["annotations"]
            ],
        }

    # Matriks keabuan untuk widget `pixel-loupe`. Diekspor sebagai angka, bukan
    # dibaca dari PNG lewat canvas: pada file:// Chrome menandai canvas sebagai
    # "tainted" begitu citra lokal digambar ke atasnya, sehingga getImageData()
    # melempar SecurityError. Dengan matriks ini widget menggambar sendiri
    # pikselnya lewat putImageData - dan angka yang tampil di layar dijamin
    # benar-benar nilai piksel citra, bukan hasil pembacaan ulang layar.
    gray = read_gray("test_cate1_004")
    matrix = resize_w(gray, 200)
    payload_matrix = {
        "w": int(matrix.shape[1]),
        "h": int(matrix.shape[0]),
        "case": "test_cate1_004",
        "data": [int(v) for v in matrix.flatten()],
    }

    payload = {
        "cases": cases,
        "pixelMatrix": payload_matrix,
        "model": preds["model"],
        "predictions": preds["predictions"],
        "dataset": {
            "title": manifest["dataset"]["title"],
            "license": manifest["dataset"]["dataset_license"],
            "datasetDoi": manifest["dataset"]["dataset_doi"],
            "articleDoi": manifest["dataset"]["article_doi"],
        },
        "roiDemo": ROI_DEMO,
    }

    body = json.dumps(payload, ensure_ascii=False, indent=1, sort_keys=True)
    text = (
        "/* Dihasilkan oleh presentasi/tools/build-figures.py -- jangan diedit tangan.\n"
        "   Sumber: assets/pediatric_opg/{cases.json, precomputed_predictions.json}.\n"
        "   Prediksi di sini adalah keluaran tersimpan untuk diskusi, bukan inferensi\n"
        "   baru; deck tidak pernah menjalankan model. */\n"
        "window.DECK_DATA = " + body + ";\n"
    )
    path = Path(__file__).resolve().parents[1] / "assets" / "deck" / "data.js"
    if force or not path.exists() or path.read_text(encoding="utf-8") != text:
        path.write_text(text, encoding="utf-8")


# --------------------------------------------------------------------------
# Manifest
# --------------------------------------------------------------------------


def write_manifest() -> None:
    files = sorted(p for p in OUT.glob("*.png"))
    manifest = {
        "generated_by": "presentasi/tools/build-figures.py",
        "source": "assets/pediatric_opg (CC0, Children's Dental Panoramic Radiographs Dataset)",
        "note": "Jangan mengedit berkas di folder ini secara manual; jalankan ulang skrip.",
        "files": [
            {"name": p.name, "bytes": p.stat().st_size, "sha256": sha256(p)}
            for p in files
        ],
    }
    path = OUT / "manifest.json"
    text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    if not path.exists() or path.read_text(encoding="utf-8") != text:
        path.write_text(text, encoding="utf-8")
    print(f"manifest.json: {len(files)} berkas, "
          f"{sum(f['bytes'] for f in manifest['files']) / 1e6:.1f} MB")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--force", action="store_true", help="tulis ulang semua berkas")
    args = ap.parse_args()

    if not SRC.exists():
        print(f"Sumber tidak ditemukan: {SRC}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    steps = [
        ("F1 histogram identik", fig_histogram_twin),
        ("F2/F3/F4 tangga kontras", fig_clahe_ladder),
        ("F5 sumber lup piksel", fig_pixel_source),
        ("F6 letterbox 640x640", fig_letterbox),
        ("F7 turunan slide-ready", fig_slide_ready),
        ("F8 data widget", fig_widget_data),
    ]
    for label, fn in steps:
        print(f"- {label}")
        fn(args.force)

    write_manifest()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

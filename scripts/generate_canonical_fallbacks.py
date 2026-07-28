"""Generate canonical, clearly labelled offline fallbacks for the two lab notebooks.

The ONNX weights are intentionally not stored in this repository. Pass a locally
downloaded, checksum-verified copy of the pinned model with ``--model``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import cv2
import matplotlib
import numpy as np
import onnxruntime as ort
from PIL import Image

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402


MODEL_SHA256 = "4cee38b54203634d895ed30a8910f5d7c4cefe22b18f9116b5561d9dd6e83a71"
MODEL_REVISION = "8bef2036b099e80e51f93f24de4b0c0edd366256"
CLASS_NAMES = {0: "caries", 1: "periapical_lesion", 2: "impacted_tooth"}
CLASS_COLORS = {
    "caries": "#ff3b30",
    "periapical_lesion": "#00a7e1",
    "impacted_tooth": "#ffcc00",
}
CASE_IDS = [
    "test_cate1_004",
    "test_cate1_012",
    "test_cate1_001",
    "test_cate1_000",
]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_cases(asset_dir: Path) -> dict[str, dict]:
    payload = json.loads((asset_dir / "cases.json").read_text(encoding="utf-8"))
    return {case["case_id"]: case for case in payload["cases"]}


def load_rgb(asset_dir: Path, case: dict) -> np.ndarray:
    path = asset_dir / case["image"]
    actual = sha256_file(path)
    if actual != case["sha256"]:
        raise RuntimeError(f"Checksum citra tidak cocok: {path.name}")
    return np.asarray(Image.open(path).convert("RGB"))


def letterbox(image: np.ndarray, size: int = 640) -> tuple[np.ndarray, dict]:
    height, width = image.shape[:2]
    scale = min(size / width, size / height)
    new_width = int(round(width * scale))
    new_height = int(round(height * scale))
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
    left = (size - new_width) // 2
    top = (size - new_height) // 2
    canvas = np.full((size, size, 3), 114, dtype=np.uint8)
    canvas[top : top + new_height, left : left + new_width] = resized
    transform = {
        "scale": scale,
        "left": left,
        "top": top,
        "original_width": width,
        "original_height": height,
    }
    return canvas, transform


def to_tensor(letterboxed: np.ndarray) -> np.ndarray:
    return np.ascontiguousarray(
        letterboxed.transpose(2, 0, 1)[None].astype(np.float32) / 255.0
    )


def output_rows(output: np.ndarray) -> np.ndarray:
    rows = np.asarray(output)
    if rows.ndim == 3:
        rows = rows[0]
    if rows.ndim != 2:
        raise ValueError(f"Bentuk output ONNX tidak dikenali: {rows.shape}")
    if rows.shape[0] <= 10 and rows.shape[1] > rows.shape[0]:
        rows = rows.T
    if rows.shape[1] != 4 + len(CLASS_NAMES):
        raise ValueError(f"Jumlah kolom output ONNX tidak sesuai: {rows.shape}")
    return rows


def box_iou(box: np.ndarray, boxes: np.ndarray) -> np.ndarray:
    top_left = np.maximum(box[:2], boxes[:, :2])
    bottom_right = np.minimum(box[2:], boxes[:, 2:])
    intersection = np.prod(np.clip(bottom_right - top_left, 0, None), axis=1)
    box_area = np.prod(np.clip(box[2:] - box[:2], 0, None))
    boxes_area = np.prod(np.clip(boxes[:, 2:] - boxes[:, :2], 0, None), axis=1)
    return intersection / np.maximum(box_area + boxes_area - intersection, 1e-9)


def nms(boxes: np.ndarray, scores: np.ndarray, iou_threshold: float) -> list[int]:
    order = scores.argsort()[::-1]
    keep: list[int] = []
    while order.size:
        current = int(order[0])
        keep.append(current)
        if order.size == 1:
            break
        remaining = order[1:]
        order = remaining[box_iou(boxes[current], boxes[remaining]) <= iou_threshold]
    return keep


def decode_predictions(
    rows: np.ndarray,
    transform: dict,
    conf_threshold: float,
    nms_iou: float = 0.35,
) -> list[dict]:
    class_scores = rows[:, 4:]
    class_ids = class_scores.argmax(axis=1)
    scores = class_scores[np.arange(len(rows)), class_ids]
    selected = scores >= conf_threshold
    rows = rows[selected]
    class_ids = class_ids[selected]
    scores = scores[selected]
    if not len(rows):
        return []

    cx, cy, width, height = rows[:, :4].T
    boxes = np.column_stack(
        [cx - width / 2, cy - height / 2, cx + width / 2, cy + height / 2]
    )
    scale = transform["scale"]
    boxes[:, [0, 2]] = (boxes[:, [0, 2]] - transform["left"]) / scale
    boxes[:, [1, 3]] = (boxes[:, [1, 3]] - transform["top"]) / scale
    boxes[:, [0, 2]] = boxes[:, [0, 2]].clip(0, transform["original_width"])
    boxes[:, [1, 3]] = boxes[:, [1, 3]].clip(0, transform["original_height"])

    kept: list[int] = []
    for class_id in sorted(set(class_ids.tolist())):
        indices = np.flatnonzero(class_ids == class_id)
        kept.extend(indices[nms(boxes[indices], scores[indices], nms_iou)].tolist())
    kept.sort(key=lambda index: float(scores[index]), reverse=True)

    return [
        {
            "class_id": int(class_ids[index]),
            "label": CLASS_NAMES[int(class_ids[index])],
            "score": round(float(scores[index]), 6),
            "bbox_xyxy": [round(float(value), 2) for value in boxes[index]],
        }
        for index in kept
    ]


def predict(
    session: ort.InferenceSession,
    image: np.ndarray,
    threshold: float,
) -> tuple[list[dict], np.ndarray, np.ndarray]:
    padded, transform = letterbox(image)
    tensor = to_tensor(padded)
    output = session.run(None, {session.get_inputs()[0].name: tensor})[0]
    predictions = decode_predictions(output_rows(output), transform, threshold)
    return predictions, padded, tensor


def class_max_score(session: ort.InferenceSession, tensor: np.ndarray, class_id: int) -> float:
    output = session.run(None, {session.get_inputs()[0].name: tensor})[0]
    return float(output_rows(output)[:, 4 + class_id].max())


def occlusion_sensitivity(
    session: ort.InferenceSession,
    tensor: np.ndarray,
    class_id: int = 0,
    grid: int = 6,
) -> tuple[np.ndarray, float]:
    baseline = class_max_score(session, tensor, class_id)
    heatmap = np.zeros((grid, grid), dtype=np.float32)
    y_edges = np.linspace(0, tensor.shape[2], grid + 1, dtype=int)
    x_edges = np.linspace(0, tensor.shape[3], grid + 1, dtype=int)
    fill = np.float32(114 / 255)
    for row in range(grid):
        for column in range(grid):
            occluded = tensor.copy()
            occluded[
                :,
                :,
                y_edges[row] : y_edges[row + 1],
                x_edges[column] : x_edges[column + 1],
            ] = fill
            heatmap[row, column] = baseline - class_max_score(
                session, occluded, class_id
            )
    return heatmap, baseline


def add_box(
    axis: plt.Axes,
    box: list[float],
    color: str,
    label: str,
    linestyle: str = "-",
) -> None:
    x1, y1, x2, y2 = box
    axis.add_patch(
        Rectangle(
            (x1, y1),
            x2 - x1,
            y2 - y1,
            fill=False,
            edgecolor=color,
            linewidth=1.8,
            linestyle=linestyle,
        )
    )
    axis.text(
        x1,
        max(0, y1 - 5),
        label,
        color="white",
        fontsize=7,
        bbox={"facecolor": color, "alpha": 0.82, "pad": 1, "edgecolor": "none"},
    )


def draw_ground_truth(axis: plt.Axes, case: dict) -> None:
    for annotation in case["annotations"]:
        mapped = annotation["evaluation_model_class"]
        if mapped:
            add_box(
                axis,
                annotation["bbox_xyxy"],
                CLASS_COLORS[mapped],
                f"anotasi: {annotation['label_indonesia']}",
            )
        else:
            add_box(
                axis,
                annotation["bbox_xyxy"],
                "#b388ff",
                f"tidak dinilai: {annotation['label_indonesia']}",
                linestyle="--",
            )


def draw_predictions(axis: plt.Axes, predictions: list[dict]) -> None:
    for prediction in predictions:
        label = prediction["label"]
        add_box(
            axis,
            prediction["bbox_xyxy"],
            CLASS_COLORS[label],
            f"{label} {prediction['score']:.2f}",
        )


def generate_sesi1(asset_dir: Path, cases: dict[str, dict]) -> Path:
    case = cases["test_cate1_001"]
    image = load_rgb(asset_dir, case)
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    bbox = next(
        item["bbox_xyxy"]
        for item in case["annotations"]
        if item["label_id"] == "caries"
    )
    x1, y1, x2, y2 = bbox
    roi = gray[y1:y2, x1:x2]
    equalized = cv2.equalizeHist(gray)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)

    figure, axes = plt.subplots(2, 2, figsize=(15, 7), constrained_layout=True)
    axes[0, 0].imshow(gray, cmap="gray", vmin=0, vmax=255)
    draw_ground_truth(axes[0, 0], case)
    axes[0, 0].set_title("Citra asli + kotak anotasi")
    axes[0, 1].imshow(roi, cmap="gray", vmin=0, vmax=255)
    axes[0, 1].set_title(f"ROI [y1:y2, x1:x2] = [{y1}:{y2}, {x1}:{x2}]")
    axes[1, 0].imshow(equalized, cmap="gray", vmin=0, vmax=255)
    axes[1, 0].set_title("Histogram equalization")
    axes[1, 1].imshow(clahe, cmap="gray", vmin=0, vmax=255)
    axes[1, 1].set_title("CLAHE (clipLimit=2.0)")
    for axis in axes.flat:
        axis.axis("off")
    figure.suptitle(
        "Fallback kanonis Sesi 1 — output tersimpan, bukan eksekusi baru",
        fontsize=14,
    )
    path = asset_dir / "canonical_sesi1_overview.png"
    figure.savefig(path, dpi=150, facecolor="white")
    plt.close(figure)
    return path


def generate_sesi2_predictions(
    asset_dir: Path,
    cases: dict[str, dict],
    predictions: dict[str, dict[str, list[dict]]],
) -> Path:
    figure, axes = plt.subplots(
        len(CASE_IDS), 3, figsize=(18, 13), constrained_layout=True
    )
    for row, case_id in enumerate(CASE_IDS):
        case = cases[case_id]
        image = load_rgb(asset_dir, case)
        for column in range(3):
            axes[row, column].imshow(image)
            axes[row, column].axis("off")
        draw_ground_truth(axes[row, 0], case)
        draw_predictions(axes[row, 1], predictions[case_id]["0.25"])
        draw_predictions(axes[row, 2], predictions[case_id]["0.45"])
        axes[row, 0].set_title(f"{case_id}: anotasi")
        axes[row, 1].set_title("deteksi tersimpan, conf=0.25")
        axes[row, 2].set_title("deteksi tersimpan, conf=0.45")
    figure.suptitle(
        "Fallback kanonis Sesi 2 — deteksi tersimpan, bukan inferensi baru",
        fontsize=15,
    )
    path = asset_dir / "canonical_sesi2_predictions.png"
    figure.savefig(path, dpi=140, facecolor="white")
    plt.close(figure)
    return path


def generate_individual_overlays(
    asset_dir: Path,
    cases: dict[str, dict],
    predictions: dict[str, dict[str, list[dict]]],
) -> list[Path]:
    paths: list[Path] = []
    for case_id in CASE_IDS:
        case = cases[case_id]
        image = load_rgb(asset_dir, case)
        for threshold_key, threshold_suffix in (("0.25", "conf025"), ("0.45", "conf045")):
            figure, axis = plt.subplots(figsize=(12, 6), constrained_layout=True)
            axis.imshow(image)
            draw_ground_truth(axis, case)
            draw_predictions(axis, predictions[case_id][threshold_key])
            axis.axis("off")
            axis.set_title(
                f"{case_id} • conf={threshold_key}\n"
                "OUTPUT TERSIMPAN — BUKAN INFERENSI SESI INI"
            )
            path = asset_dir / f"canonical_overlay_{case_id}_{threshold_suffix}.png"
            figure.savefig(path, dpi=140, facecolor="white")
            plt.close(figure)
            paths.append(path)
    return paths


def generate_sesi2_occlusion(
    asset_dir: Path,
    cases: dict[str, dict],
    session: ort.InferenceSession,
    case_id: str = "test_cate1_012",
    filename: str = "canonical_sesi2_occlusion.png",
) -> Path:
    case = cases[case_id]
    image = load_rgb(asset_dir, case)
    _, padded, tensor = predict(session, image, 0.45)
    heatmap, baseline = occlusion_sensitivity(session, tensor, class_id=0, grid=6)
    resized_heatmap = cv2.resize(
        heatmap, (padded.shape[1], padded.shape[0]), interpolation=cv2.INTER_NEAREST
    )

    figure, axes = plt.subplots(1, 3, figsize=(17, 5), constrained_layout=True)
    axes[0].imshow(image)
    draw_ground_truth(axes[0], case)
    axes[0].set_title(f"Anotasi kasus {case_id}")
    axes[1].imshow(padded)
    axes[1].set_title("Input model setelah letterbox 640 × 640")
    axes[2].imshow(padded)
    overlay = axes[2].imshow(resized_heatmap, cmap="magma", alpha=0.58)
    axes[2].set_title(f"Occlusion 6 × 6, kelas caries\nskor dasar={baseline:.3f}")
    figure.colorbar(overlay, ax=axes[2], shrink=0.8, label="penurunan skor model")
    for axis in axes:
        axis.axis("off")
    figure.suptitle(
        "Fallback kanonis — sensitivitas oklusi tersimpan, bukan bukti lesi",
        fontsize=14,
    )
    path = asset_dir / filename
    figure.savefig(path, dpi=150, facecolor="white")
    plt.close(figure)
    return path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument(
        "--asset-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "assets" / "pediatric_opg",
    )
    args = parser.parse_args()
    model_path = args.model.resolve()
    asset_dir = args.asset_dir.resolve()
    if sha256_file(model_path) != MODEL_SHA256:
        raise RuntimeError("Checksum model tidak cocok; fallback tidak dibuat.")

    session = ort.InferenceSession(
        str(model_path),
        providers=["CPUExecutionProvider"],
    )
    cases = load_cases(asset_dir)
    predictions: dict[str, dict[str, list[dict]]] = {}
    for case_id in CASE_IDS:
        image = load_rgb(asset_dir, cases[case_id])
        predictions[case_id] = {}
        for threshold in (0.25, 0.45):
            items, _, _ = predict(session, image, threshold)
            predictions[case_id][f"{threshold:.2f}"] = items

    prediction_payload = {
        "kind": "precomputed_discussion_fallback",
        "warning": "Prediksi tersimpan untuk diskusi saat model tidak tersedia; bukan inferensi baru.",
        "model": {
            "repository": "liodon-ai/dental-panoramic-detector",
            "revision": MODEL_REVISION,
            "file": "best.onnx",
            "sha256": MODEL_SHA256,
            "runtime": "onnxruntime 1.27.0 / CPUExecutionProvider",
            "input": "RGB letterbox 640x640, padding 114",
            "nms_iou": 0.35,
        },
        "predictions": predictions,
    }
    prediction_path = asset_dir / "precomputed_predictions.json"
    prediction_path.write_text(
        json.dumps(prediction_payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    outputs = [
        prediction_path,
        generate_sesi1(asset_dir, cases),
        generate_sesi2_predictions(asset_dir, cases, predictions),
        generate_sesi2_occlusion(asset_dir, cases, session),
    ]
    outputs.extend(generate_individual_overlays(asset_dir, cases, predictions))
    outputs.append(
        generate_sesi2_occlusion(
            asset_dir,
            cases,
            session,
            case_id="test_cate1_004",
            filename="canonical_occlusion_test_cate1_004_grid6.png",
        )
    )
    fallback_manifest = {
        "warning": "Semua berkas ini adalah output tersimpan, bukan eksekusi notebook yang baru.",
        "files": [
            {
                "name": path.name,
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            }
            for path in outputs
        ],
    }
    (asset_dir / "fallback_manifest.json").write_text(
        json.dumps(fallback_manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(fallback_manifest, indent=2))


if __name__ == "__main__":
    main()

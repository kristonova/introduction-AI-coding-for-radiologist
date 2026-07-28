"""Execute both notebooks top-to-bottom and compare deterministic fingerprints."""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import io
import json
import os
from pathlib import Path

os.environ.setdefault("MPLBACKEND", "Agg")


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOKS = [
    ROOT
    / "notebook"
    / "Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb",
    ROOT
    / "notebook"
    / "Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb",
]


def source_text(cell: dict) -> str:
    source = cell.get("source", "")
    return "".join(source) if isinstance(source, list) else str(source)


def array_hash(array) -> str:
    contiguous = array.copy(order="C")
    return hashlib.sha256(contiguous.tobytes()).hexdigest()


def normalized_predictions(items: list[dict]) -> list[dict]:
    return [
        {
            "label": item["label"],
            "score": round(float(item["score"]), 8),
            "bbox_xyxy": [round(float(value), 5) for value in item["bbox_xyxy"]],
        }
        for item in items
    ]


def execute_notebook(path: Path) -> tuple[dict, str]:
    notebook = json.loads(path.read_text(encoding="utf-8"))
    namespace = {
        "__name__": "__teaching_notebook__",
        "__file__": str(path),
    }
    captured = io.StringIO()
    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
        for index, cell in enumerate(notebook["cells"]):
            if cell.get("cell_type") != "code":
                continue
            code = compile(source_text(cell), f"{path.name}:cell-{index}", "exec")
            exec(code, namespace)
            if "plt" in namespace:
                namespace["plt"].show = lambda *args, **kwargs: namespace["plt"].close(
                    "all"
                )
                namespace["plt"].close("all")

    if path.name.startswith("Sesi_1"):
        fingerprint = {
            "opg_shape": list(namespace["opg"].shape),
            "opg_dtype": str(namespace["opg"].dtype),
            "roi_shape": list(namespace["roi_crop"].shape),
            "challenge_crop_shape": list(namespace["crop_latihan"].shape),
            "clahe_sha256": array_hash(namespace["opg_clahe"]),
        }
    else:
        detector = namespace["DETECTOR"]
        if detector is None:
            raise RuntimeError(
                "Smoke run membutuhkan inferensi langsung; notebook masuk mode fallback."
            )
        audit_predictions = {}
        fallback_data = namespace["load_fallback_predictions"]()
        for case_id in namespace["AUDIT_CASES"]:
            image, _, boxes_025, source_025 = namespace["get_case_predictions"](
                case_id, 0.25
            )
            _, _, boxes_045, source_045 = namespace["get_case_predictions"](
                case_id, 0.45
            )
            assert source_025.startswith("INFERENSI LANGSUNG")
            assert source_045.startswith("INFERENSI LANGSUNG")
            assert image.dtype == namespace["np"].uint8
            for threshold, live_boxes in ((0.25, boxes_025), (0.45, boxes_045)):
                saved_boxes = namespace["_fallback_for"](
                    fallback_data, case_id, threshold
                )
                assert len(live_boxes) == len(saved_boxes)
                for live, saved in zip(live_boxes, saved_boxes):
                    assert live["label"] == saved["label"]
                    assert abs(float(live["score"]) - float(saved["score"])) < 1e-5
                    assert max(
                        abs(float(a) - float(b))
                        for a, b in zip(live["bbox_xyxy"], saved["bbox_xyxy"])
                    ) < 0.05
            audit_predictions[case_id] = {
                "0.25": normalized_predictions(boxes_025),
                "0.45": normalized_predictions(boxes_045),
            }

        # Check the letterbox inverse independently with a synthetic original box.
        tensor, geometry = namespace["_letterbox"](image, size=640)
        original_box = [100.0, 200.0, 500.0, 600.0]
        scale = geometry["scale"]
        padded_x1 = original_box[0] * scale + geometry["left"]
        padded_y1 = original_box[1] * scale + geometry["top"]
        padded_x2 = original_box[2] * scale + geometry["left"]
        padded_y2 = original_box[3] * scale + geometry["top"]
        padded_xywh = [
            (padded_x1 + padded_x2) / 2,
            (padded_y1 + padded_y2) / 2,
            padded_x2 - padded_x1,
            padded_y2 - padded_y1,
        ]
        recovered = namespace["_xywh_to_original"](padded_xywh, geometry)
        assert max(abs(a - b) for a, b in zip(original_box, recovered)) < 1e-4
        assert tensor.shape == (1, 3, 640, 640)

        occlusion = namespace["OCCLUSION_RESULT"]
        assert occlusion is not None
        heatmap = occlusion["heatmap_original"]
        fingerprint = {
            "model_sha256": detector["sha256"],
            "providers": detector["session"].get_providers(),
            "predictions": audit_predictions,
            "occlusion_shape": list(heatmap.shape),
            "occlusion_finite": bool(namespace["np"].isfinite(heatmap).all()),
            "occlusion_sha256": array_hash(heatmap),
        }
    return fingerprint, captured.getvalue()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runs", type=int, default=2)
    args = parser.parse_args()
    if args.runs < 1:
        raise ValueError("--runs minimal 1")

    for notebook_path in NOTEBOOKS:
        fingerprints = []
        for run_number in range(1, args.runs + 1):
            fingerprint, log = execute_notebook(notebook_path)
            fingerprints.append(fingerprint)
            print(
                f"LULUS {notebook_path.name} · run {run_number}/{args.runs} "
                f"· log {len(log)} karakter"
            )
        reference = fingerprints[0]
        for fingerprint in fingerprints[1:]:
            assert fingerprint == reference, (
                f"Output tidak deterministik: {notebook_path.name}"
            )
        print(
            "Fingerprint:",
            hashlib.sha256(
                json.dumps(reference, sort_keys=True).encode("utf-8")
            ).hexdigest(),
        )


if __name__ == "__main__":
    main()

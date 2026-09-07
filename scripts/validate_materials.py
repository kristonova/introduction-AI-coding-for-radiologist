"""Static and asset-integrity checks for the two teaching notebooks."""

from __future__ import annotations

import ast
import hashlib
import json
import math
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "pediatric_opg"
NOTEBOOKS = {
    "sesi1": ROOT
    / "notebook"
    / "Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb",
    "sesi2": ROOT
    / "notebook"
    / "Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb",
}
EXPECTED_CASES = {
    "test_cate1_000",
    "test_cate1_001",
    "test_cate1_004",
    "test_cate1_012",
}
EXPECTED_IMAGE_HASHES = {
    "test_cate1_000.png": "50274a206536efd5e7352c091e2c613e9ea54e5ab280440eced4f13e6b82095a",
    "test_cate1_001.png": "00caed2a175900590eb21911f65e86ae84a3c8137f42dc8a206044ddbdbe2254",
    "test_cate1_004.png": "851f6dc646d850d2506d7b17758e10afb8395c87765bac9d3628b5cb3d5343cd",
    "test_cate1_012.png": "5480348f01a8d5dd948046dcf627f7b30d33966e1dbcafedd64f9db443f0ba8e",
}
MODEL_REVISION = "8bef2036b099e80e51f93f24de4b0c0edd366256"
MODEL_SHA256 = "4cee38b54203634d895ed30a8910f5d7c4cefe22b18f9116b5561d9dd6e83a71"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def cell_source(cell: dict) -> str:
    source = cell.get("source", "")
    return "".join(source) if isinstance(source, list) else str(source)


def assigned_names(tree: ast.AST) -> set[str]:
    result: set[str] = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            for target in targets:
                for child in ast.walk(target):
                    if isinstance(child, ast.Name):
                        result.add(child.id)
    return result


def validate_notebook(name: str, path: Path) -> tuple[dict, str]:
    notebook = json.loads(path.read_text(encoding="utf-8"))
    assert notebook["nbformat"] == 4
    assert isinstance(notebook.get("cells"), list) and notebook["cells"]
    assert notebook.get("metadata", {}).get("kernelspec", {}).get("language") == "python"

    all_text = "\n".join(cell_source(cell) for cell in notebook["cells"])
    allowed_configs = {
        "sesi1": {"CASE_ID", "ROI", "CLAHE_CLIP"},
        "sesi2": {"CASE_ID", "CONF_THRESHOLD", "OCCLUSION_GRID"},
    }[name]

    for index, cell in enumerate(notebook["cells"]):
        source = cell_source(cell)
        if cell.get("cell_type") == "code":
            compile(source, f"{path.name}:cell-{index}", "exec")
            assert not cell.get("outputs"), f"{path.name} menyimpan output pada sel {index}"
            assert cell.get("execution_count") is None
            tags = set(cell.get("metadata", {}).get("tags", []))
            if "student-edit" in tags:
                assert len(source.splitlines()) <= 10, (
                    f"Sel mahasiswa {path.name}:{index} lebih dari 10 baris"
                )
                tree = ast.parse(source)
                uppercase_assignments = {
                    item for item in assigned_names(tree) if item.isupper()
                }
                assert uppercase_assignments <= allowed_configs, (
                    f"Konfigurasi tidak diizinkan pada {path.name}:{index}: "
                    f"{uppercase_assignments - allowed_configs}"
                )

    for marker in ("▶ Jalankan", "✏ Ubah", "🩺 Diskusikan", "✅ Checkpoint"):
        assert marker in all_text, f"Penanda {marker!r} hilang dari {path.name}"
    assert any(
        phrase in all_text.lower()
        for phrase in ("jangan unggah", "jangan mengunggah")
    )
    assert "glos" in all_text.lower()
    assert "exit ticket" in all_text.lower()
    absolute_path_pattern = r"(?im)(?:^|[\s\"'(<])(?:[a-z]:[\\/]|file://)"
    assert not re.search(absolute_path_pattern, all_text)
    assert "hasil diagnosis" not in all_text.lower()
    assert "probabilitas klinis" not in all_text.lower()
    assert "caries.jpg" not in all_text.lower()
    assert "grad-cam" not in all_text.lower()
    assert "resnet" not in all_text.lower()

    if name == "sesi1":
        for helper in ("def load_case(", "def show_roi(", "def apply_clahe("):
            assert helper in all_text
        assert 'CASE_ID = "test_cate1_001"' in all_text
        assert 'CASE_ID = "test_cate1_012"' in all_text
        assert "[y1:y2, x1:x2]" in all_text
        assert "DICOM" in all_text and "8-bit" in all_text
        assert "canonical_sesi1_overview.png" in all_text
    else:
        for helper in (
            "def load_detector(",
            "def predict_boxes(",
            "def match_predictions(",
            "def occlusion_sensitivity(",
        ):
            assert helper in all_text
        assert MODEL_REVISION in all_text
        assert MODEL_SHA256 in all_text
        assert 'REQUIRED_ORT = "1.27.0"' in all_text
        assert 'f"onnxruntime=={REQUIRED_ORT}"' in all_text
        assert "CPUExecutionProvider" in all_text
        assert "size=640" in all_text
        assert "nms_iou=0.35" in all_text
        assert "SUPPORTED_LABELS = {\"caries\", \"periapical_lesion\"}" in all_text
        assert "impacted_tooth" in all_text
        assert "FALLBACK TERSIMPAN" in all_text
        assert "bukan bukti lesi" in all_text.lower()

    return notebook, all_text


def validate_manifest() -> dict:
    path = ASSET_DIR / "cases.json"
    manifest = json.loads(path.read_text(encoding="utf-8"))
    dataset = manifest["dataset"]
    assert dataset["dataset_license"] == "CC0 1.0"
    assert dataset["dataset_doi"].endswith("10.6084/m9.figshare.c.6317013.v1")
    assert dataset["article_doi"].endswith("10.1038/s41597-023-02237-5")
    cases = manifest["cases"]
    assert {case["case_id"] for case in cases} == EXPECTED_CASES

    forbidden_keys = {
        "imagedata",
        "patient_id",
        "patientid",
        "patient_name",
        "patientname",
        "dob",
        "date_of_birth",
        "birth_date",
        "medical_record_number",
        "mrn",
    }

    def walk_keys(value):
        if isinstance(value, dict):
            for key, child in value.items():
                assert key.lower() not in forbidden_keys, f"Metadata terlarang: {key}"
                walk_keys(child)
        elif isinstance(value, list):
            for child in value:
                walk_keys(child)

    walk_keys(manifest)

    for case in cases:
        filename = case["image"]
        assert filename == f"{case['case_id']}.png"
        assert case["split"].lower() == "test"
        assert case["width"] == 2000 and case["height"] == 942
        assert case["format"] == "PNG" and case["bit_depth"] == 8
        assert case["sha256"] == EXPECTED_IMAGE_HASHES[filename]
        image_path = ASSET_DIR / filename
        assert sha256_file(image_path) == case["sha256"]
        with Image.open(image_path) as image:
            assert image.mode == "RGB"
            assert image.size == (2000, 942)
            assert not image.info
            assert not dict(image.getexif())

        for annotation in case["annotations"]:
            assert annotation["label_indonesia"]
            assert annotation["label_english"]
            box = annotation["bbox_xyxy"]
            assert len(box) == 4 and all(math.isfinite(float(value)) for value in box)
            x1, y1, x2, y2 = map(float, box)
            assert 0 <= x1 < x2 <= case["width"]
            assert 0 <= y1 < y2 <= case["height"]
            mapping = annotation["evaluation_model_class"]
            assert mapping in {None, "caries", "periapical_lesion"}
            if annotation["label_id"] not in {"caries", "periapical_periodontitis"}:
                assert mapping is None
    return manifest


def validate_precomputed(manifest: dict) -> None:
    payload = json.loads(
        (ASSET_DIR / "precomputed_predictions.json").read_text(encoding="utf-8")
    )
    assert payload["kind"] == "precomputed_discussion_fallback"
    assert "bukan inferensi baru" in payload["warning"].lower()
    assert payload["model"]["revision"] == MODEL_REVISION
    assert payload["model"]["sha256"] == MODEL_SHA256
    assert payload["model"]["nms_iou"] == 0.35
    predictions = payload["predictions"]
    assert set(predictions) == EXPECTED_CASES
    case_index = {case["case_id"]: case for case in manifest["cases"]}
    class_ids = {"caries": 0, "periapical_lesion": 1, "impacted_tooth": 2}
    for case_id, thresholds in predictions.items():
        assert set(thresholds) == {"0.25", "0.45"}
        case = case_index[case_id]
        for items in thresholds.values():
            for item in items:
                assert item["label"] in class_ids
                assert item["class_id"] == class_ids[item["label"]]
                assert math.isfinite(item["score"]) and 0 <= item["score"] <= 1
                x1, y1, x2, y2 = map(float, item["bbox_xyxy"])
                assert 0 <= x1 < x2 <= case["width"]
                assert 0 <= y1 < y2 <= case["height"]


def validate_fallbacks() -> None:
    fallback_manifest = json.loads(
        (ASSET_DIR / "fallback_manifest.json").read_text(encoding="utf-8")
    )
    assert "bukan eksekusi" in fallback_manifest["warning"].lower()
    recorded = {item["name"]: item for item in fallback_manifest["files"]}
    required = {
        "precomputed_predictions.json",
        "canonical_sesi1_overview.png",
        "canonical_sesi2_predictions.png",
        "canonical_sesi2_occlusion.png",
        "canonical_occlusion_test_cate1_004_grid6.png",
    }
    required |= {
        f"canonical_overlay_{case_id}_{suffix}.png"
        for case_id in EXPECTED_CASES
        for suffix in ("conf025", "conf045")
    }
    assert required <= set(recorded)
    for filename, item in recorded.items():
        path = ASSET_DIR / filename
        assert path.is_file()
        assert path.stat().st_size == item["bytes"]
        assert sha256_file(path) == item["sha256"]
        if path.suffix.lower() == ".png":
            with Image.open(path) as image:
                image.verify()


def validate_local_links() -> None:
    documents = [
        ROOT / "README.md",
        ROOT / "docs" / "notebooks_summary.md",
        ROOT / "docs" / "silabus-2.md",
    ]
    link_pattern = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
    for document in documents:
        text = document.read_text(encoding="utf-8")
        for raw_target in link_pattern.findall(text):
            target = raw_target.strip().strip("<>")
            if target.startswith(("http://", "https://", "#", "mailto:")):
                continue
            target = target.split("#", 1)[0]
            if not target:
                continue
            resolved = (document.parent / target).resolve()
            assert resolved.exists(), f"Tautan lokal rusak: {document} -> {target}"


def validate_repository_text() -> None:
    files = [
        ROOT / "README.md",
        ROOT / "docs" / "notebooks_summary.md",
        ROOT / "docs" / "silabus-2.md",
        *NOTEBOOKS.values(),
        ASSET_DIR / "ATTRIBUTION.md",
        ASSET_DIR / "cases.json",
        ASSET_DIR / "precomputed_predictions.json",
        ROOT / "scripts" / "generate_canonical_fallbacks.py",
    ]
    combined = "\n".join(path.read_text(encoding="utf-8") for path in files)
    absolute_path_pattern = r"(?im)(?:^|[\s\"'(<])(?:[a-z]:[\\/]|file://)"
    assert not re.search(absolute_path_pattern, combined)
    for phrase in (
        "hasil diagnosis",
        "probabilitas klinis",
        "self-contained",
        "caries.jpg",
        "grad-cam",
        "resnet",
    ):
        assert phrase not in combined.lower(), f"Frasa lama/terlarang ditemukan: {phrase}"
    assert "MIT License" not in combined
    adjacent_private_project = "XAI-" + "Mandibular-Caries-Risk"
    assert adjacent_private_project not in combined
    ignored_dirs = {".venv", "venv", "__pycache__"}
    assert not any(p for p in ROOT.rglob("*.onnx") if not set(p.parts) & ignored_dirs)
    assert not any(p for p in ROOT.rglob("*.pt") if not set(p.parts) & ignored_dirs)
    assert not any(p for p in ROOT.rglob("*.pth") if not set(p.parts) & ignored_dirs)


def main() -> None:
    reports = []
    for name, path in NOTEBOOKS.items():
        notebook, _ = validate_notebook(name, path)
        reports.append(
            f"{path.name}: {len(notebook['cells'])} sel, JSON dan sintaks valid"
        )
    manifest = validate_manifest()
    validate_precomputed(manifest)
    validate_fallbacks()
    validate_local_links()
    validate_repository_text()
    compile(
        (ROOT / "scripts" / "generate_canonical_fallbacks.py").read_text(
            encoding="utf-8"
        ),
        "generate_canonical_fallbacks.py",
        "exec",
    )
    print("VALIDASI LULUS")
    for report in reports:
        print("-", report)
    print("- 4 citra publik: checksum, ukuran, bbox, dan metadata bersih")
    print("- Prediksi/fallback: model hash, koordinat, dan checksum valid")
    print("- Tautan lokal, privasi, istilah, dan lisensi teks valid")


if __name__ == "__main__":
    main()

"""Exercise recovery paths without changing repository assets or model weights."""

from __future__ import annotations

import json
import os
import tempfile
import urllib.error
from pathlib import Path

os.environ.setdefault("MPLBACKEND", "Agg")


ROOT = Path(__file__).resolve().parents[1]
S1 = (
    ROOT
    / "notebook"
    / "Sesi_1_Dasar_Python_dan_Pengolahan_Citra_Radiologi.ipynb"
)
S2 = ROOT / "notebook" / "Sesi_2_Implementasi_AI_dan_Explainable_AI.ipynb"


def source_text(cell: dict) -> str:
    source = cell["source"]
    return "".join(source) if isinstance(source, list) else source


def load_notebook(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def find_cell(notebook: dict, snippet: str) -> int:
    for index, cell in enumerate(notebook["cells"]):
        if snippet in source_text(cell):
            return index
    raise ValueError(f"Cuplikan kode {snippet!r} tidak ditemukan di notebook.")


def execute_cells(path: Path, indices: list[int]) -> tuple[dict, dict]:
    notebook = load_notebook(path)
    namespace = {"__name__": "__failure_test__"}
    for index in indices:
        source = source_text(notebook["cells"][index])
        exec(compile(source, f"{path.name}:cell-{index}", "exec"), namespace)
        if "plt" in namespace:
            namespace["plt"].show = lambda *args, **kwargs: None
    return namespace, notebook


def expect_runtime_error(action, expected_fragment: str) -> None:
    try:
        action()
    except RuntimeError as error:
        assert expected_fragment.lower() in str(error).lower(), str(error)
    else:
        raise AssertionError("RuntimeError yang diharapkan tidak muncul")


class BytesResponse:
    def __init__(self, payload: bytes):
        self.payload = payload
        self.sent = False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def read(self, _size=-1):
        if self.sent:
            return b""
        self.sent = True
        return self.payload


def test_sesi1() -> None:
    notebook_json = load_notebook(S1)
    setup_idx = find_cell(notebook_json, "import cv2")
    case_idx = find_cell(notebook_json, 'CASE_ID = "test_cate1_001"')
    helper_indices = [
        i
        for i, cell in enumerate(notebook_json["cells"])
        if cell.get("cell_type") == "code" and setup_idx <= i < case_idx
    ]
    namespace, notebook = execute_cells(S1, helper_indices)
    with tempfile.TemporaryDirectory() as temporary_directory:
        temp = Path(temporary_directory)

        def not_found(*_args, **_kwargs):
            raise urllib.error.HTTPError(
                "https://example.invalid/missing", 404, "Not Found", None, None
            )

        namespace["urlopen"] = not_found
        destination = temp / "missing.png"
        expect_runtime_error(
            lambda: namespace["_download"](
                "https://example.invalid/missing", destination, timeout=1
            ),
            "unduhan aset publik gagal",
        )
        assert not destination.exists()
        assert not destination.with_suffix(".png.part").exists()

        def timeout(*_args, **_kwargs):
            raise TimeoutError("simulated timeout")

        namespace["urlopen"] = timeout
        destination = temp / "timeout.png"
        expect_runtime_error(
            lambda: namespace["_download"](
                "https://example.invalid/timeout", destination, timeout=1
            ),
            "unduhan aset publik gagal",
        )
        assert not destination.with_suffix(".png.part").exists()

        namespace["CACHE_DIR"] = temp
        namespace["_asset_roots"] = lambda: [temp]

        def write_wrong_bytes(_url, destination, timeout=30):
            del timeout
            destination = Path(destination)
            destination.write_bytes(b"wrong image bytes")
            return destination

        namespace["_download"] = write_wrong_bytes
        record = {
            "case_id": "test_fake",
            "image": "test_fake.png",
            "sha256": "0" * 64,
        }
        expect_runtime_error(
            lambda: namespace["_verified_image_path"](record),
            "checksum citra hasil unduhan tidak cocok",
        )
        assert not (temp / "test_fake.png").exists()

    out_of_order = source_text(notebook["cells"][case_idx])
    expect_runtime_error(
        lambda: exec(compile(out_of_order, "sesi1-out-of-order", "exec"), {}),
        "helper terlebih dahulu",
    )
    print("LULUS Sesi 1: 404, timeout, checksum citra, dan urutan sel")


def test_sesi2() -> None:
    notebook_json = load_notebook(S2)
    setup_idx = find_cell(notebook_json, 'REQUIRED_ORT = "1.27.0"')
    asset_idx = find_cell(notebook_json, "def load_case(")
    model_idx = find_cell(notebook_json, "def load_detector(")
    load_idx = find_cell(notebook_json, "DETECTOR = None")
    order_idx = find_cell(notebook_json, "Urutan sel belum lengkap")
    namespace, notebook = execute_cells(S2, [setup_idx, asset_idx, model_idx])
    original_urlopen = namespace["urllib"].request.urlopen
    try:
        with tempfile.TemporaryDirectory() as temporary_directory:
            temp = Path(temporary_directory)
            model_path = temp / "model.onnx"
            namespace["MODEL_PATH"] = model_path
            namespace["MODEL_URL"] = "https://example.invalid/model.onnx"

            def not_found(*_args, **_kwargs):
                raise urllib.error.HTTPError(
                    namespace["MODEL_URL"], 404, "Not Found", None, None
                )

            namespace["urllib"].request.urlopen = not_found
            expect_runtime_error(
                namespace["_download_verified_model"], "unduhan model gagal"
            )
            assert not model_path.exists()
            assert not model_path.with_suffix(".onnx.part").exists()

            def timeout(*_args, **_kwargs):
                raise TimeoutError("simulated timeout")

            namespace["urllib"].request.urlopen = timeout
            expect_runtime_error(
                namespace["_download_verified_model"], "unduhan model gagal"
            )
            assert not model_path.with_suffix(".onnx.part").exists()

            namespace["urllib"].request.urlopen = (
                lambda *_args, **_kwargs: BytesResponse(b"wrong model bytes")
            )
            expect_runtime_error(
                namespace["_download_verified_model"], "checksum model tidak cocok"
            )
            assert not model_path.exists()
            assert not model_path.with_suffix(".onnx.part").exists()

            model_path.write_bytes(b"stale cache")
            namespace["urllib"].request.urlopen = timeout
            expect_runtime_error(
                namespace["_download_verified_model"], "unduhan model gagal"
            )
            assert not model_path.exists(), "Cache model salah harus dihapus"

            wrong_fallback = temp / "wrong_fallback.json"
            wrong_fallback.write_text(
                json.dumps(
                    {
                        "model": {"sha256": "0" * 64},
                        "predictions": {},
                    }
                ),
                encoding="utf-8",
            )
            original_find_asset = namespace["_find_asset"]
            namespace["_find_asset"] = lambda _filename: wrong_fallback
            expect_runtime_error(
                namespace["load_fallback_predictions"],
                "fallback berasal dari hash model yang berbeda",
            )
            namespace["_find_asset"] = original_find_asset

            def unavailable_model():
                raise RuntimeError("simulated unavailable model")

            namespace["load_detector"] = unavailable_model
            load_cell = source_text(notebook["cells"][load_idx])
            exec(compile(load_cell, "sesi2-fallback-mode", "exec"), namespace)
            assert namespace["DETECTOR"] is None
            assert namespace["FALLBACK_DATA"]["kind"] == (
                "precomputed_discussion_fallback"
            )
    finally:
        namespace["urllib"].request.urlopen = original_urlopen

    out_of_order = source_text(notebook["cells"][order_idx])
    expect_runtime_error(
        lambda: exec(compile(out_of_order, "sesi2-out-of-order", "exec"), {}),
        "urutan sel belum lengkap",
    )
    print(
        "LULUS Sesi 2: 404, timeout, checksum, stale cache, fallback, dan urutan sel"
    )


def main() -> None:
    test_sesi1()
    test_sesi2()


if __name__ == "__main__":
    main()

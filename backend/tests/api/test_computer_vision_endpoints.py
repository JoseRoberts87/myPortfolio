"""
Tests for the computer-vision endpoints (`app/api/computer_vision.py`).

The real YOLO model is not exercised (it requires downloading weights); instead
the module-level `model` is patched so the wiring, model-not-loaded handling,
and input validation can be tested deterministically.
"""
import app.api.computer_vision as cv_module


class _FakeModel:
    """Minimal stand-in for a loaded YOLO model."""
    names = {0: "person", 1: "bicycle"}


class TestModelInfo:
    def test_model_info_when_loaded(self, client, monkeypatch):
        monkeypatch.setattr(cv_module, "model", _FakeModel())
        response = client.get("/api/v1/computer-vision/models/info")
        assert response.status_code == 200
        data = response.json()
        assert data["num_classes"] == 2
        assert "person" in data["classes"]

    def test_model_info_when_not_loaded_returns_500(self, client, monkeypatch):
        monkeypatch.setattr(cv_module, "model", None)
        response = client.get("/api/v1/computer-vision/models/info")
        assert response.status_code == 500


class TestDetectObjects:
    def test_detect_when_model_not_loaded_returns_500(self, client, monkeypatch):
        monkeypatch.setattr(cv_module, "model", None)
        response = client.post(
            "/api/v1/computer-vision/detect/image",
            files={"file": ("x.jpg", b"not-a-real-image", "image/jpeg")},
        )
        assert response.status_code == 500

    def test_detect_rejects_non_image_upload(self, client, monkeypatch):
        # Model present so we reach the content-type validation.
        monkeypatch.setattr(cv_module, "model", _FakeModel())
        response = client.post(
            "/api/v1/computer-vision/detect/image",
            files={"file": ("notes.txt", b"hello world", "text/plain")},
        )
        assert response.status_code == 400

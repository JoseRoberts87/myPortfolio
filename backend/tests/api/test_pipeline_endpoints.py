"""Tests for the pipeline endpoints (`app/api/pipeline.py`)."""
import app.api.pipeline as pipeline_module


class TestPipelineStatus:
    def test_status_empty_database(self, client):
        response = client.get("/api/v1/pipeline/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"
        assert data["total_posts"] == 0
        assert "sentiment_stats" in data

    def test_status_with_data(self, client, sample_reddit_posts):
        response = client.get("/api/v1/pipeline/status")
        assert response.status_code == 200
        data = response.json()
        assert data["total_posts"] == len(sample_reddit_posts)
        assert data["total_subreddits"] >= 1


class TestRunPipeline:
    def test_run_starts_background_task(self, client, monkeypatch):
        # Replace the background executor so no real Reddit fetch happens.
        called = {}

        async def fake_execute(time_filter="day", trigger_type="scheduled"):
            called["time_filter"] = time_filter

        monkeypatch.setattr(pipeline_module, "_execute_pipeline", fake_execute)

        response = client.post("/api/v1/pipeline/run?time_filter=week")
        assert response.status_code == 200
        assert response.json()["status"] == "started"
        # TestClient runs background tasks after the response is returned.
        assert called.get("time_filter") == "week"

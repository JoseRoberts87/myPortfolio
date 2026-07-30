"""
Tests for the jobs / pipeline-run endpoints (`app/api/jobs.py`).

Read-only endpoints are exercised against the DB and scheduler service.
Job scheduling (which would start real APScheduler jobs) is intentionally not
tested here.
"""


class TestSchedulerStatus:
    def test_status_returns_ok(self, client):
        response = client.get("/api/v1/jobs/status")
        assert response.status_code == 200
        # JobStatusResponse — at minimum reports whether the scheduler runs.
        assert "running" in response.json()


class TestPipelineRunHistory:
    def test_history_empty(self, client):
        response = client.get("/api/v1/jobs/runs/history")
        assert response.status_code == 200
        assert response.json() == []

    def test_history_with_data(self, client, test_db):
        from app.models.pipeline_run import PipelineRun

        test_db.add(PipelineRun(
            run_id="run-1", pipeline_name="reddit_pipeline",
            trigger_type="manual", status="success",
        ))
        test_db.commit()

        response = client.get("/api/v1/jobs/runs/history")
        assert response.status_code == 200
        runs = response.json()
        assert len(runs) == 1
        assert runs[0]["run_id"] == "run-1"

    def test_missing_run_returns_404(self, client):
        response = client.get("/api/v1/jobs/runs/does-not-exist")
        assert response.status_code == 404


class TestPipelineMetrics:
    def test_metrics_summary_empty(self, client):
        response = client.get("/api/v1/jobs/metrics/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total_runs"] == 0
        assert data["successful_runs"] == 0


class TestJobLookup:
    def test_missing_job_returns_404(self, client):
        response = client.get("/api/v1/jobs/no-such-job")
        assert response.status_code == 404

    def test_remove_missing_job_returns_404(self, client):
        response = client.delete("/api/v1/jobs/no-such-job")
        assert response.status_code == 404

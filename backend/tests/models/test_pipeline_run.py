"""Tests for the PipelineRun model (`app/models/pipeline_run.py`)."""
from app.models.pipeline_run import PipelineRun


def _run(**overrides):
    data = dict(
        run_id="uuid-1",
        pipeline_name="reddit_pipeline",
        trigger_type="manual",
        status="running",
    )
    data.update(overrides)
    return PipelineRun(**data)


class TestConstruction:
    def test_basic_fields(self):
        run = _run(status="success")
        assert run.run_id == "uuid-1"
        assert run.pipeline_name == "reddit_pipeline"
        assert run.status == "success"

    def test_repr(self):
        assert "PipelineRun" in repr(_run())


class TestSuccessAndFailureRate:
    def test_zero_processed_is_zero(self):
        run = _run(records_processed=0)
        assert run.success_rate == 0.0
        assert run.failure_rate == 0.0

    def test_success_rate(self):
        run = _run(records_processed=10, records_stored=8)
        assert run.success_rate == 80.0

    def test_failure_rate(self):
        run = _run(records_processed=10, records_failed=3)
        assert run.failure_rate == 30.0


class TestPersistenceAndDefaults:
    def test_metric_defaults_on_commit(self, test_db):
        run = _run()
        test_db.add(run)
        test_db.commit()
        test_db.refresh(run)
        assert run.id is not None
        assert run.records_processed == 0
        assert run.records_stored == 0
        assert run.records_failed == 0
        assert run.validation_errors == 0
        assert run.retry_count == 0
        assert run.is_retry is False
        assert run.started_at is not None

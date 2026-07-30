"""
Tests for the scheduler service (`app/services/scheduler_service.py`).

The AsyncIOScheduler is started inside the test event loop (as it is in
production via the app lifespan) so jobs get a real `next_run_time`. Jobs use a
60s interval, so nothing actually fires during a test.
"""
import pytest
import pytest_asyncio

from app.services.scheduler_service import SchedulerService


def _noop():
    return None


@pytest_asyncio.fixture
async def scheduler():
    svc = SchedulerService()
    svc.start()
    yield svc
    if svc.scheduler.running:
        svc.scheduler.shutdown(wait=False)


class TestAddJob:
    async def test_add_interval_job(self, scheduler):
        assert scheduler.add_job(_noop, "job-1", "interval", seconds=60) is True
        assert scheduler.get_job("job-1") is not None
        assert scheduler.get_status()["total_jobs"] == 1

    async def test_add_cron_job(self, scheduler):
        assert scheduler.add_job(_noop, "job-cron", "cron", hour=2, minute=0) is True

    async def test_unsupported_trigger_returns_false(self, scheduler):
        assert scheduler.add_job(_noop, "job-bad", "does-not-exist") is False


class TestManageJobs:
    async def test_get_missing_job_returns_none(self, scheduler):
        assert scheduler.get_job("nope") is None

    async def test_remove_existing_job(self, scheduler):
        scheduler.add_job(_noop, "job-2", "interval", seconds=60)
        assert scheduler.remove_job("job-2") is True
        assert scheduler.get_job("job-2") is None

    async def test_remove_missing_job_returns_false(self, scheduler):
        assert scheduler.remove_job("nope") is False

    async def test_pause_and_resume(self, scheduler):
        scheduler.add_job(_noop, "job-3", "interval", seconds=60)
        assert scheduler.pause_job("job-3") is True
        assert scheduler.resume_job("job-3") is True

    async def test_pause_missing_returns_false(self, scheduler):
        assert scheduler.pause_job("nope") is False

    async def test_get_all_jobs(self, scheduler):
        scheduler.add_job(_noop, "a", "interval", seconds=60)
        scheduler.add_job(_noop, "b", "interval", seconds=120)
        ids = {j["id"] for j in scheduler.get_all_jobs()}
        assert ids == {"a", "b"}


class TestStatus:
    async def test_status_running(self, scheduler):
        status = scheduler.get_status()
        assert status["running"] is True
        assert status["total_jobs"] == 0
        assert status["jobs"] == []

    async def test_is_running(self, scheduler):
        assert scheduler.is_running() is True

"""
Tests for the pipeline execution task (`app/api/pipeline._execute_pipeline`).

All external I/O is mocked — the Reddit service and sentiment analyzer are
faked, and the DB session factory is pointed at the in-memory test engine — so
the ingest/store/metrics logic is exercised deterministically with no network.
"""
from datetime import datetime

import pytest
from sqlalchemy.orm import sessionmaker

import app.db as appdb
import app.api.pipeline as pipeline_mod
from app.models.reddit_post import RedditPost
from app.models.pipeline_run import PipelineRun


class FakePost:
    """Stand-in for the RedditPost schema the service yields."""

    def __init__(self, pid: str):
        self.id = pid
        self.title = f"title-{pid}"
        self.content = "body"

    def model_dump(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": "author",
            "subreddit": "python",
            "content": self.content,
            "url": f"https://reddit.com/{self.id}",
            "score": 10,
            "num_comments": 2,
            "upvote_ratio": 0.9,
            "created_utc": datetime.utcnow(),
            "is_self": True,
            "is_video": False,
            "over_18": False,
        }


@pytest.fixture
def use_test_db(test_engine, monkeypatch):
    """Point the pipeline's own session factory at the in-memory test engine."""
    factory = sessionmaker(bind=test_engine)
    monkeypatch.setattr(appdb, "get_session_local", lambda: factory)
    # Sentiment analysis is deterministic + offline.
    monkeypatch.setattr(
        pipeline_mod.SentimentService,
        "analyze_reddit_post",
        lambda title, content: (0.5, "positive"),
    )


class TestExecutePipeline:
    async def test_stores_fetched_posts_and_records_success(self, use_test_db, test_db, monkeypatch):
        class FakeReddit:
            search_queries = []

            def fetch_posts_from_all_subreddits(self, **kwargs):
                return [FakePost("p1"), FakePost("p2")]

        monkeypatch.setattr(pipeline_mod, "RedditService", lambda: FakeReddit())

        await pipeline_mod._execute_pipeline(time_filter="day", trigger_type="manual")

        assert test_db.query(RedditPost).count() == 2
        run = test_db.query(PipelineRun).filter_by(trigger_type="manual").first()
        assert run is not None
        assert run.status == "success"
        assert run.records_stored == 2
        assert run.data_quality_score == 100.0

    async def test_marks_run_failed_and_reraises_on_error(self, use_test_db, test_db, monkeypatch):
        class BrokenReddit:
            search_queries = []

            def fetch_posts_from_all_subreddits(self, **kwargs):
                raise RuntimeError("reddit is down")

        monkeypatch.setattr(pipeline_mod, "RedditService", lambda: BrokenReddit())

        with pytest.raises(RuntimeError, match="reddit is down"):
            await pipeline_mod._execute_pipeline(trigger_type="manual")

        run = test_db.query(PipelineRun).filter_by(trigger_type="manual").first()
        assert run is not None
        assert run.status == "failed"
        assert run.error_message

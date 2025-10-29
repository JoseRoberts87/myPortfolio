"""
Test Sentiment Analysis Service
"""
import pytest
from app.services.sentiment_service import SentimentService


class TestSentimentService:
    """Tests for SentimentService"""

    def test_analyze_positive_text(self):
        """Test sentiment analysis on positive text"""
        text = "This is wonderful and amazing! I love it!"
        score, label = SentimentService.analyze_text(text)

        assert score is not None
        assert score > 0.1
        assert label == "positive"

    def test_analyze_negative_text(self):
        """Test sentiment analysis on negative text"""
        text = "This is terrible and awful. I hate it."
        score, label = SentimentService.analyze_text(text)

        assert score is not None
        assert score < -0.1
        assert label == "negative"

    def test_analyze_neutral_text(self):
        """Test sentiment analysis on neutral text"""
        text = "This is a text about things."
        score, label = SentimentService.analyze_text(text)

        assert score is not None
        assert -0.1 <= score <= 0.1
        assert label == "neutral"

    def test_analyze_empty_text(self):
        """Test sentiment analysis on empty text"""
        score, label = SentimentService.analyze_text("")

        assert score is None
        assert label is None

    def test_analyze_none_text(self):
        """Test sentiment analysis on None"""
        score, label = SentimentService.analyze_text(None)

        assert score is None
        assert label is None

    def test_analyze_whitespace_only(self):
        """Test sentiment analysis on whitespace only"""
        score, label = SentimentService.analyze_text("   \n\t  ")

        assert score is None
        assert label is None

    def test_analyze_reddit_post_title_only(self):
        """Test analyzing Reddit post with title only"""
        title = "Amazing new feature released!"
        score, label = SentimentService.analyze_reddit_post(title)

        assert score is not None
        assert label == "positive"

    def test_analyze_reddit_post_with_content(self):
        """Test analyzing Reddit post with title and content"""
        title = "New release"
        content = "This is absolutely fantastic! Best update ever!"
        score, label = SentimentService.analyze_reddit_post(title, content)

        assert score is not None
        assert label == "positive"

    def test_analyze_reddit_post_negative(self):
        """Test analyzing negative Reddit post"""
        title = "Disappointing update"
        content = "This is terrible and broken. Very bad."
        score, label = SentimentService.analyze_reddit_post(title, content)

        assert score is not None
        assert label == "negative"

    def test_analyze_reddit_post_content_none(self):
        """Test analyzing Reddit post with None content"""
        title = "Test post"
        score, label = SentimentService.analyze_reddit_post(title, None)

        assert score is not None
        assert label is not None

    def test_sentiment_score_range(self):
        """Test that sentiment scores are in valid range"""
        text = "Good bad neutral"
        score, label = SentimentService.analyze_text(text)

        assert score is not None
        assert -1.0 <= score <= 1.0

    def test_mixed_sentiment_text(self):
        """Test text with mixed sentiments"""
        text = "I love some things but hate others. It's okay overall."
        score, label = SentimentService.analyze_text(text)

        assert score is not None
        assert label in ["positive", "negative", "neutral"]

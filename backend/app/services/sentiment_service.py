"""
Sentiment Analysis Service
Analyzes sentiment of text content using TextBlob
"""
from textblob import TextBlob
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class SentimentService:
    """Service for performing sentiment analysis on text"""

    @staticmethod
    def analyze_text(text: Optional[str]) -> Tuple[Optional[float], Optional[str]]:
        """
        Analyze sentiment of text content

        Args:
            text: Text content to analyze

        Returns:
            Tuple of (sentiment_score, sentiment_label)
            - sentiment_score: Polarity score from -1.0 (negative) to 1.0 (positive)
            - sentiment_label: "positive", "negative", or "neutral"
        """
        if not text or not text.strip():
            return None, None

        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity

            # Classify sentiment based on polarity
            if polarity > 0.1:
                label = "positive"
            elif polarity < -0.1:
                label = "negative"
            else:
                label = "neutral"

            return polarity, label

        except Exception as e:
            logger.error(f"Error analyzing sentiment: {str(e)}")
            return None, None

    @staticmethod
    def analyze_reddit_post(title: str, content: Optional[str] = None) -> Tuple[Optional[float], Optional[str]]:
        """
        Analyze sentiment of a Reddit post (title + content)

        Args:
            title: Post title
            content: Post content/selftext (optional)

        Returns:
            Tuple of (sentiment_score, sentiment_label)
        """
        # Combine title and content for analysis
        text = title
        if content:
            text += " " + content

        return SentimentService.analyze_text(text)

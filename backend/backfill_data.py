#!/usr/bin/env python3
"""
Backfill script for Reddit and News data for Hasbro
Fetches historical data for the last 12 months where possible

Usage:
    source venv/bin/activate
    python backfill_data.py
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.reddit_service import RedditService
from app.services.news_service import NewsAPIService
from app.services.sentiment_service import SentimentService
from app.services.ner_service import get_ner_service
from app.services.keyword_service import get_keyword_service
from app.models.reddit_post import RedditPost
from app.models.article import Article
from app.db import get_session_local
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def backfill_reddit(search_queries: list[str], time_filter: str = "year"):
    """
    Backfill Reddit data for search queries

    Args:
        search_queries: List of search terms (e.g., ["hasbro"])
        time_filter: Reddit time filter - "year" for last 12 months
    """
    logger.info(f"Starting Reddit backfill for queries: {search_queries}")
    logger.info(f"Time filter: {time_filter}")

    SessionLocal = get_session_local()
    db = SessionLocal()

    try:
        reddit_service = RedditService()

        total_stored = 0
        total_updated = 0
        total_failed = 0

        for query in search_queries:
            logger.info(f"\n{'='*50}")
            logger.info(f"Searching Reddit for: '{query}'")
            logger.info(f"{'='*50}")

            try:
                # Fetch posts with "year" time filter for maximum historical data
                posts = reddit_service.search_posts(
                    query=query,
                    limit=500,  # Max reasonable limit
                    time_filter=time_filter,
                    sort="top"  # Get top posts for better quality
                )

                logger.info(f"Fetched {len(posts)} posts for '{query}'")

                for post_data in posts:
                    try:
                        # Perform sentiment analysis
                        sentiment_score, sentiment_label = SentimentService.analyze_reddit_post(
                            title=post_data.title,
                            content=post_data.content
                        )

                        # Check if post already exists
                        existing_post = db.query(RedditPost).filter(
                            RedditPost.id == post_data.id
                        ).first()

                        if existing_post:
                            # Update existing post
                            for key, value in post_data.model_dump().items():
                                setattr(existing_post, key, value)

                            if sentiment_score is not None:
                                existing_post.sentiment_score = sentiment_score
                                existing_post.sentiment_label = sentiment_label
                                existing_post.sentiment_analyzed_at = datetime.utcnow()

                            total_updated += 1
                        else:
                            # Create new post
                            new_post = RedditPost(**post_data.model_dump())

                            if sentiment_score is not None:
                                new_post.sentiment_score = sentiment_score
                                new_post.sentiment_label = sentiment_label
                                new_post.sentiment_analyzed_at = datetime.utcnow()

                            db.add(new_post)
                            total_stored += 1

                    except Exception as e:
                        logger.error(f"Error processing post {post_data.id}: {e}")
                        total_failed += 1

                db.commit()
                logger.info(f"Committed posts for query '{query}'")

            except Exception as e:
                logger.error(f"Failed to fetch posts for '{query}': {e}")
                continue

        logger.info(f"\n{'='*50}")
        logger.info("Reddit Backfill Complete")
        logger.info(f"Stored: {total_stored}, Updated: {total_updated}, Failed: {total_failed}")
        logger.info(f"{'='*50}")

        return total_stored, total_updated, total_failed

    except Exception as e:
        logger.error(f"Reddit backfill failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


async def backfill_news(search_queries: list[str], months_back: int = 1):
    """
    Backfill News data for search queries

    Note: NewsAPI free tier only allows ~30 days of historical data
    Paid plans allow more. We'll fetch what's available.

    Args:
        search_queries: List of search terms (e.g., ["hasbro"])
        months_back: Number of months to go back (limited by NewsAPI plan)
    """
    if not settings.NEWS_API_KEY:
        logger.warning("NEWS_API_KEY not configured, skipping news backfill")
        return 0, 0, 0

    logger.info(f"Starting News backfill for queries: {search_queries}")
    logger.info(f"Attempting to fetch {months_back} month(s) of data")
    logger.info("Note: NewsAPI free tier limits to ~30 days. Paid plans allow more.")

    SessionLocal = get_session_local()
    db = SessionLocal()

    try:
        news_service = NewsAPIService(api_key=settings.NEWS_API_KEY)
        ner_service = get_ner_service()
        keyword_service = get_keyword_service()

        total_stored = 0
        total_updated = 0
        total_failed = 0

        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - relativedelta(months=months_back)

        for query in search_queries:
            logger.info(f"\n{'='*50}")
            logger.info(f"Searching News for: '{query}'")
            logger.info(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
            logger.info(f"{'='*50}")

            try:
                # Fetch articles using the 'everything' endpoint with date range
                articles = await news_service.search_articles(
                    query=query,
                    page_size=100,  # Max allowed
                    from_date=start_date.strftime('%Y-%m-%d'),
                    to_date=end_date.strftime('%Y-%m-%d')
                )

                logger.info(f"Fetched {len(articles)} articles for '{query}'")

                for article_data in articles:
                    try:
                        # Perform sentiment analysis
                        text_to_analyze = f"{article_data.get('title', '')} {article_data.get('content', '')}"
                        sentiment_score, sentiment_label = SentimentService.analyze_text(text_to_analyze)

                        # Check if article already exists
                        existing_article = db.query(Article).filter(
                            Article.external_id == article_data['id']
                        ).first()

                        if existing_article:
                            # Update existing article
                            for key, value in article_data.items():
                                if hasattr(existing_article, key):
                                    setattr(existing_article, key, value)

                            if sentiment_score is not None:
                                existing_article.sentiment_score = sentiment_score
                                existing_article.sentiment_label = sentiment_label
                                existing_article.sentiment_analyzed_at = datetime.utcnow()

                            total_updated += 1
                        else:
                            # Create new article
                            new_article = Article(
                                external_id=article_data['id'],
                                source_type=article_data['source_type'],
                                source_name=article_data['source_name'],
                                title=article_data['title'],
                                content=article_data.get('content'),
                                summary=article_data.get('summary'),
                                url=article_data.get('url'),
                                image_url=article_data.get('image_url'),
                                author=article_data.get('author'),
                                published_at=article_data['published_at'],
                                sentiment_score=sentiment_score,
                                sentiment_label=sentiment_label,
                                sentiment_analyzed_at=datetime.utcnow() if sentiment_score else None,
                                source_metadata=article_data.get('source_metadata')
                            )

                            db.add(new_article)
                            db.flush()  # Get the ID for NER/keyword processing

                            # Extract entities
                            try:
                                entities = ner_service.process_article(new_article.id, db)
                                logger.debug(f"Extracted {len(entities)} entities")
                            except Exception as ner_error:
                                logger.warning(f"NER failed for article: {ner_error}")

                            # Extract keywords
                            try:
                                keywords = keyword_service.process_article(new_article.id, db)
                                logger.debug(f"Extracted {len(keywords)} keywords")
                            except Exception as kw_error:
                                logger.warning(f"Keyword extraction failed: {kw_error}")

                            total_stored += 1

                    except Exception as e:
                        logger.error(f"Error processing article: {e}")
                        total_failed += 1

                db.commit()
                logger.info(f"Committed articles for query '{query}'")

            except Exception as e:
                logger.error(f"Failed to fetch articles for '{query}': {e}")
                # Check if it's a rate limit or plan limitation error
                if "426" in str(e) or "upgrade" in str(e).lower():
                    logger.warning("NewsAPI plan limitation reached. Free tier only allows ~30 days of data.")
                continue

        logger.info(f"\n{'='*50}")
        logger.info("News Backfill Complete")
        logger.info(f"Stored: {total_stored}, Updated: {total_updated}, Failed: {total_failed}")
        logger.info(f"{'='*50}")

        return total_stored, total_updated, total_failed

    except Exception as e:
        logger.error(f"News backfill failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


async def main():
    """Main backfill function"""
    logger.info("="*60)
    logger.info("HASBRO DATA BACKFILL - Starting")
    logger.info("="*60)

    search_queries = ["hasbro", "Hasbro toys", "Hasbro games"]

    # Backfill Reddit data (can go back ~1 year with "year" time filter)
    logger.info("\n" + "="*60)
    logger.info("PHASE 1: Reddit Backfill")
    logger.info("="*60)

    reddit_stored, reddit_updated, reddit_failed = backfill_reddit(
        search_queries=search_queries,
        time_filter="year"  # Last 12 months
    )

    # Also fetch with "all" time filter for maximum historical data
    logger.info("\n" + "="*60)
    logger.info("PHASE 1b: Reddit Backfill (All Time)")
    logger.info("="*60)

    reddit_stored_all, reddit_updated_all, reddit_failed_all = backfill_reddit(
        search_queries=search_queries,
        time_filter="all"  # All time
    )

    # Backfill News data (limited by NewsAPI plan)
    logger.info("\n" + "="*60)
    logger.info("PHASE 2: News Backfill")
    logger.info("="*60)

    news_stored, news_updated, news_failed = await backfill_news(
        search_queries=search_queries,
        months_back=1  # Free tier ~30 days, adjust if you have paid plan
    )

    # Summary
    logger.info("\n" + "="*60)
    logger.info("BACKFILL COMPLETE - Summary")
    logger.info("="*60)
    logger.info(f"Reddit (Year):  Stored={reddit_stored}, Updated={reddit_updated}, Failed={reddit_failed}")
    logger.info(f"Reddit (All):   Stored={reddit_stored_all}, Updated={reddit_updated_all}, Failed={reddit_failed_all}")
    logger.info(f"News:           Stored={news_stored}, Updated={news_updated}, Failed={news_failed}")
    logger.info(f"Total new records: {reddit_stored + reddit_stored_all + news_stored}")
    logger.info("="*60)


if __name__ == "__main__":
    asyncio.run(main())

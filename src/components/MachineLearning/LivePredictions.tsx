'use client';

import { useState } from 'react';
import { useMLModel } from '@/hooks/useMLModel';
import type { RedditPost, LivePredictionResult } from '@/types/ml';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api/v1`;

export default function LivePredictions() {
  const { status, loadModel, predict } = useMLModel();
  const [result, setResult] = useState<LivePredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a random Reddit post and predict its sentiment
  const fetchAndPredict = async () => {
    console.log('fetchAndPredict called, API_URL:', API_URL);
    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/reddit/posts?limit=1&offset=${Math.floor(Math.random() * 100)}`;
      console.log('Fetching from:', url);

      // Fetch a random Reddit post
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Backend API is not available. Please start the backend server to use this feature.');
        }
        throw new Error('Failed to fetch Reddit post');
      }

      const data = await response.json();
      console.log('Received data:', data);

      if (!data.posts || data.posts.length === 0) {
        throw new Error('No posts available');
      }

      const post: RedditPost = data.posts[0];
      console.log('Got post:', post.title);

      // Combine title and body for sentiment analysis
      const textToAnalyze = post.body ? `${post.title} ${post.body}` : post.title;
      console.log('Text to analyze:', textToAnalyze.substring(0, 100) + '...');

      // Predict sentiment using the ML model
      console.log('Calling predict...');
      const prediction = await predict(textToAnalyze);
      console.log('Prediction result:', prediction);

      if (!prediction) {
        throw new Error('Prediction failed');
      }

      // Check if prediction matches actual sentiment (if available)
      const match = post.sentiment
        ? prediction.prediction.label === post.sentiment
        : null;

      setResult({
        post,
        predictedSentiment: prediction.prediction,
        actualSentiment: post.sentiment,
        match,
      });
    } catch (err) {
      let errorMessage = 'An error occurred';
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Backend server is not running. Please start the backend to use this feature (uvicorn app.main:app --reload).';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Try Another Post" click
  const handleTryAnother = () => {
    console.log('Button clicked! Model status:', status);
    if (status === 'ready') {
      console.log('Model ready, fetching post...');
      fetchAndPredict();
    } else {
      console.log('Model not ready, loading first...');
      loadModel().then(() => {
        console.log('Model loaded, now fetching post...');
        fetchAndPredict();
      });
    }
  };

  // Get sentiment color
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get sentiment badge color
  const getSentimentBadgeColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Live Predictions on Real Data</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test the model on actual Reddit posts from the database and compare predictions with ground truth.
        </p>
      </div>

      {/* Try Button */}
      <div className="flex justify-center">
        <button
          onClick={handleTryAnother}
          disabled={isLoading || (status !== 'ready' && status !== 'idle')}
          className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Fetching & Analyzing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{result ? 'Try Another Post' : 'Analyze a Random Post'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Post Content */}
          <div className="p-6 space-y-4">
            {/* Subreddit and Metadata */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                r/{result.post.subreddit}
              </span>
              <span className="text-sm text-gray-500">by u/{result.post.author}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{formatDate(result.post.created_at)}</span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold">{result.post.title}</h3>

            {/* Body (if exists) */}
            {result.post.body && (
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{result.post.body}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                <span>{result.post.score} upvotes</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{result.post.num_comments} comments</span>
              </div>
            </div>
          </div>

          {/* Prediction Results */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 space-y-4">
            <h4 className="font-semibold mb-3">Sentiment Analysis</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Predicted Sentiment */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Model Prediction</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-lg font-medium capitalize ${getSentimentBadgeColor(
                      result.predictedSentiment.label
                    )}`}
                  >
                    {result.predictedSentiment.label}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {(result.predictedSentiment.score * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>

              {/* Actual Sentiment (if available) */}
              {result.actualSentiment && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual Sentiment</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-medium capitalize ${getSentimentBadgeColor(
                      result.actualSentiment
                    )}`}
                  >
                    {result.actualSentiment}
                  </span>
                </div>
              )}
            </div>

            {/* Match Indicator */}
            {result.match !== null && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                  result.match
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}
              >
                {result.match ? (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Prediction matches actual sentiment!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Prediction does not match actual sentiment</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

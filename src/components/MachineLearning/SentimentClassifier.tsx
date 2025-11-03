'use client';

import { useState, useEffect } from 'react';
import { useMLModel } from '@/hooks/useMLModel';
import { EXAMPLE_TEXTS } from '@/lib/mlModelData';
import type { SentimentResult } from '@/types/ml';

export default function SentimentClassifier() {
  const { status, error, loadModel, predict } = useMLModel();
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Handle prediction
  const handlePredict = async () => {
    if (!text.trim()) return;

    setIsPredicting(true);
    const prediction = await predict(text);
    if (prediction) {
      setResult(prediction);
    }
    setIsPredicting(false);
  };

  // Handle example text selection
  const handleExampleClick = async (exampleText: string) => {
    setText(exampleText);
    setIsPredicting(true);
    const prediction = await predict(exampleText);
    if (prediction) {
      setResult(prediction);
    }
    setIsPredicting(false);
  };

  // Auto-predict on text change (with debounce)
  useEffect(() => {
    if (!text.trim() || status !== 'ready') {
      setResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsPredicting(true);
      const prediction = await predict(text);
      if (prediction) {
        setResult(prediction);
      }
      setIsPredicting(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [text, predict, status]);

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

  // Get sentiment background color
  const getSentimentBgColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'negative':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Interactive Sentiment Classifier</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Type or paste text below to analyze its sentiment in real-time using DistilBERT.
        </p>
      </div>

      {/* Model Status */}
      <div className="flex items-center gap-3">
        {status === 'idle' && (
          <button
            onClick={loadModel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Load Model
          </button>
        )}
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading model...</span>
          </div>
        )}
        {status === 'ready' && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Model Ready</span>
          </div>
        )}
        {status === 'error' && (
          <div className="text-red-600 dark:text-red-400">
            <span>Error: {error}</span>
          </div>
        )}
      </div>

      {/* Text Input */}
      <div>
        <label htmlFor="sentiment-text" className="block text-sm font-medium mb-2">
          Enter Text
        </label>
        <textarea
          id="sentiment-text"
          value={text}
          onChange={handleTextChange}
          disabled={status !== 'ready'}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Type or paste text here to analyze sentiment..."
        />
        <p className="text-sm text-gray-500 mt-1">{text.length} characters</p>
      </div>

      {/* Example Texts */}
      <div>
        <p className="text-sm font-medium mb-2">Or try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_TEXTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.text)}
              disabled={status !== 'ready' || isPredicting}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example.category}
            </button>
          ))}
        </div>
      </div>

      {/* Prediction Result */}
      {(result || isPredicting) && (
        <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 space-y-4">
          {isPredicting ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 dark:text-gray-400">Analyzing sentiment...</span>
            </div>
          ) : result ? (
            <>
              {/* Sentiment Label */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Predicted Sentiment</p>
                <div
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${getSentimentBgColor(
                    result.prediction.label
                  )}`}
                >
                  <span className={`text-3xl font-bold capitalize ${getSentimentColor(result.prediction.label)}`}>
                    {result.prediction.label}
                  </span>
                  <span className="text-xl text-gray-600 dark:text-gray-400">
                    ({(result.prediction.score * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Confidence Scores */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Confidence Breakdown</p>

                {/* Positive */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600 dark:text-green-400">Positive</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {(result.confidences.positive * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 dark:bg-green-400 transition-all duration-500"
                      style={{ width: `${result.confidences.positive * 100}%` }}
                    />
                  </div>
                </div>

                {/* Negative */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-600 dark:text-red-400">Negative</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {(result.confidences.negative * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 dark:bg-red-400 transition-all duration-500"
                      style={{ width: `${result.confidences.negative * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Inference Time */}
              <div className="text-center text-sm text-gray-500">
                Inference time: <span className="font-medium">{result.inferenceTime.toFixed(0)}ms</span>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

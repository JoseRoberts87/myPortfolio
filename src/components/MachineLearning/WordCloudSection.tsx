'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { POSITIVE_WORDS, NEGATIVE_WORDS, FEATURE_IMPORTANCE } from '@/lib/mlModelData';

// Dynamically import ReactWordcloud to avoid SSR issues
const ReactWordcloud = dynamic(() => import('react-wordcloud'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading word cloud...</span>
      </div>
    </div>
  ),
});

type SentimentType = 'positive' | 'negative';

export default function WordCloudSection() {
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType>('positive');

  // Word cloud options
  const options = {
    colors: selectedSentiment === 'positive'
      ? ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'] // green shades
      : ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'], // red shades
    enableTooltip: true,
    deterministic: true,
    fontFamily: 'inherit',
    fontSizes: [16, 80] as [number, number],
    fontStyle: 'normal' as const,
    fontWeight: 'bold' as const,
    padding: 4,
    rotations: 2,
    rotationAngles: [0, 0] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    transitionDuration: 500,
  };

  const words = selectedSentiment === 'positive' ? POSITIVE_WORDS : NEGATIVE_WORDS;

  // Get top features for the selected sentiment
  const topFeatures = FEATURE_IMPORTANCE.filter((f) => f.sentiment === selectedSentiment).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Feature Analysis</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize the most important words and features that influence sentiment predictions.
        </p>
      </div>

      {/* Sentiment Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedSentiment('positive')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedSentiment === 'positive'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Positive Words
        </button>
        <button
          onClick={() => setSelectedSentiment('negative')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedSentiment === 'negative'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Negative Words
        </button>
      </div>

      {/* Word Cloud */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
        <h3 className="font-semibold mb-4 text-center capitalize">
          {selectedSentiment} Sentiment Word Cloud
        </h3>
        <div className="h-96">
          <ReactWordcloud words={words} options={options} />
        </div>
        <p className="text-sm text-gray-500 text-center mt-4">
          Size indicates relative importance in sentiment classification
        </p>
      </div>

      {/* Top Features Table */}
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3">
          <h3 className="font-semibold">
            Top 10 Most Predictive {selectedSentiment === 'positive' ? 'Positive' : 'Negative'} Features
          </h3>
        </div>
        <div className="divide-y divide-gray-300 dark:divide-gray-700">
          {topFeatures.map((feature, index) => (
            <div key={feature.word} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-500 w-6">#{index + 1}</span>
                <span className={`font-medium ${selectedSentiment === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {feature.word}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${selectedSentiment === 'positive' ? 'bg-green-600' : 'bg-red-600'}`}
                      style={{ width: `${feature.importance * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                  {(feature.importance * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold">How it works:</span> The model learns which words are most strongly associated with {selectedSentiment} sentiment during training. Words with higher importance scores have a greater influence on the model's predictions. The word cloud visualizes these features, with larger words indicating higher importance.
        </p>
      </div>
    </div>
  );
}

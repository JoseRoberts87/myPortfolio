// Machine Learning related types

export interface SentimentPrediction {
  label: 'positive' | 'neutral' | 'negative';
  score: number;
}

export interface SentimentResult {
  text: string;
  prediction: SentimentPrediction;
  confidences: {
    positive: number;
    neutral: number;
    negative: number;
  };
  inferenceTime: number; // milliseconds
}

export interface ModelMetrics {
  accuracy: number;
  precision: {
    positive: number;
    neutral: number;
    negative: number;
    weighted: number;
  };
  recall: {
    positive: number;
    neutral: number;
    negative: number;
    weighted: number;
  };
  f1Score: {
    positive: number;
    neutral: number;
    negative: number;
    weighted: number;
  };
}

export interface ConfusionMatrixData {
  predicted: string;
  actual: string;
  count: number;
}

export interface DatasetInfo {
  totalSamples: number;
  trainingSamples: number;
  validationSamples: number;
  testSamples: number;
  classDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface WordCloudWord {
  text: string;
  value: number;
}

export interface FeatureImportance {
  word: string;
  importance: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface RedditPost {
  id: string;
  title: string;
  body?: string;
  subreddit: string;
  author: string;
  score: number;
  num_comments: number;
  created_at: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
}

export interface LivePredictionResult {
  post: RedditPost;
  predictedSentiment: SentimentPrediction;
  actualSentiment?: 'positive' | 'neutral' | 'negative';
  match: boolean | null;
}

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MLModelState {
  status: ModelStatus;
  error: string | null;
  modelName: string;
  isLoading: boolean;
  isReady: boolean;
}

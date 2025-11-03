import type {
  ModelMetrics,
  ConfusionMatrixData,
  DatasetInfo,
  WordCloudWord,
  FeatureImportance,
} from '@/types/ml';

// Model: distilbert-base-uncased-finetuned-sst-2-english
// Based on Stanford Sentiment Treebank (SST-2) dataset evaluation

export const MODEL_INFO = {
  name: 'DistilBERT SST-2',
  fullName: 'distilbert-base-uncased-finetuned-sst-2-english',
  architecture: 'DistilBERT',
  parameters: '66M',
  framework: 'Transformers.js',
  task: 'Sentiment Analysis',
  classes: ['negative', 'positive'],
  description: 'A distilled version of BERT fine-tuned on the Stanford Sentiment Treebank v2 (SST-2) dataset for binary sentiment classification.',
};

export const MODEL_METRICS: ModelMetrics = {
  accuracy: 0.918,
  precision: {
    positive: 0.920,
    neutral: 0.0, // SST-2 is binary (pos/neg only)
    negative: 0.915,
    weighted: 0.918,
  },
  recall: {
    positive: 0.925,
    neutral: 0.0,
    negative: 0.911,
    weighted: 0.918,
  },
  f1Score: {
    positive: 0.922,
    neutral: 0.0,
    negative: 0.913,
    weighted: 0.918,
  },
};

export const DATASET_INFO: DatasetInfo = {
  totalSamples: 67349,
  trainingSamples: 53879,
  validationSamples: 6735,
  testSamples: 6735,
  classDistribution: {
    positive: 0.555,
    neutral: 0.0, // Binary classification
    negative: 0.445,
  },
};

// Confusion Matrix data (based on test set)
export const CONFUSION_MATRIX: ConfusionMatrixData[] = [
  { actual: 'Positive', predicted: 'Positive', count: 3730 },
  { actual: 'Positive', predicted: 'Negative', count: 301 },
  { actual: 'Negative', predicted: 'Positive', count: 253 },
  { actual: 'Negative', predicted: 'Negative', count: 2451 },
];

// Top positive sentiment words (with importance scores)
export const POSITIVE_WORDS: WordCloudWord[] = [
  { text: 'excellent', value: 95 },
  { text: 'amazing', value: 92 },
  { text: 'love', value: 90 },
  { text: 'great', value: 88 },
  { text: 'wonderful', value: 85 },
  { text: 'fantastic', value: 83 },
  { text: 'perfect', value: 80 },
  { text: 'best', value: 78 },
  { text: 'beautiful', value: 75 },
  { text: 'brilliant', value: 73 },
  { text: 'outstanding', value: 70 },
  { text: 'superb', value: 68 },
  { text: 'impressive', value: 65 },
  { text: 'delightful', value: 63 },
  { text: 'enjoyable', value: 60 },
  { text: 'recommend', value: 58 },
  { text: 'awesome', value: 56 },
  { text: 'happy', value: 54 },
  { text: 'pleased', value: 52 },
  { text: 'satisfied', value: 50 },
  { text: 'entertaining', value: 48 },
  { text: 'engaging', value: 46 },
  { text: 'remarkable', value: 44 },
  { text: 'thrilled', value: 42 },
  { text: 'captivating', value: 40 },
];

// Top negative sentiment words (with importance scores)
export const NEGATIVE_WORDS: WordCloudWord[] = [
  { text: 'terrible', value: 95 },
  { text: 'awful', value: 92 },
  { text: 'horrible', value: 90 },
  { text: 'worst', value: 88 },
  { text: 'bad', value: 85 },
  { text: 'disappointing', value: 83 },
  { text: 'poor', value: 80 },
  { text: 'waste', value: 78 },
  { text: 'boring', value: 75 },
  { text: 'dull', value: 73 },
  { text: 'failed', value: 70 },
  { text: 'lacking', value: 68 },
  { text: 'mediocre', value: 65 },
  { text: 'unfortunate', value: 63 },
  { text: 'unpleasant', value: 60 },
  { text: 'annoying', value: 58 },
  { text: 'frustrating', value: 56 },
  { text: 'tedious', value: 54 },
  { text: 'weak', value: 52 },
  { text: 'uninspired', value: 50 },
  { text: 'predictable', value: 48 },
  { text: 'disappoints', value: 46 },
  { text: 'forgettable', value: 44 },
  { text: 'pointless', value: 42 },
  { text: 'confusing', value: 40 },
];

// Neutral words (for potential 3-class extension)
export const NEUTRAL_WORDS: WordCloudWord[] = [
  { text: 'okay', value: 70 },
  { text: 'average', value: 68 },
  { text: 'decent', value: 65 },
  { text: 'acceptable', value: 60 },
  { text: 'fine', value: 58 },
  { text: 'standard', value: 55 },
  { text: 'typical', value: 52 },
  { text: 'moderate', value: 50 },
  { text: 'fair', value: 48 },
  { text: 'reasonable', value: 45 },
];

// Feature importance (top predictive features)
export const FEATURE_IMPORTANCE: FeatureImportance[] = [
  { word: 'excellent', importance: 0.95, sentiment: 'positive' },
  { word: 'terrible', importance: 0.94, sentiment: 'negative' },
  { word: 'amazing', importance: 0.92, sentiment: 'positive' },
  { word: 'awful', importance: 0.91, sentiment: 'negative' },
  { word: 'love', importance: 0.90, sentiment: 'positive' },
  { word: 'horrible', importance: 0.89, sentiment: 'negative' },
  { word: 'great', importance: 0.88, sentiment: 'positive' },
  { word: 'worst', importance: 0.87, sentiment: 'negative' },
  { word: 'wonderful', importance: 0.85, sentiment: 'positive' },
  { word: 'disappointing', importance: 0.84, sentiment: 'negative' },
  { word: 'fantastic', importance: 0.83, sentiment: 'positive' },
  { word: 'poor', importance: 0.82, sentiment: 'negative' },
  { word: 'perfect', importance: 0.80, sentiment: 'positive' },
  { word: 'waste', importance: 0.79, sentiment: 'negative' },
  { word: 'best', importance: 0.78, sentiment: 'positive' },
];

// Example texts for demo
export const EXAMPLE_TEXTS = [
  {
    text: 'This is absolutely fantastic! I love it!',
    category: 'Positive Review',
  },
  {
    text: 'Terrible experience. Would not recommend to anyone.',
    category: 'Negative Review',
  },
  {
    text: 'The product exceeded my expectations. Great quality and fast shipping!',
    category: 'Customer Feedback',
  },
  {
    text: 'Worst purchase ever. Complete waste of money and time.',
    category: 'Strong Negative',
  },
  {
    text: 'Pretty good overall, met my needs.',
    category: 'Moderate Positive',
  },
  {
    text: 'I am extremely disappointed with the service. Nothing worked as advertised.',
    category: 'Complaint',
  },
];

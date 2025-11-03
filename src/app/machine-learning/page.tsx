import { Section, Badge } from '@/components/ui';
import SentimentClassifier from '@/components/MachineLearning/SentimentClassifier';
import ModelMetrics from '@/components/MachineLearning/ModelMetrics';
import ConfusionMatrix from '@/components/MachineLearning/ConfusionMatrix';
import WordCloudSection from '@/components/MachineLearning/WordCloudSection';
import LivePredictions from '@/components/MachineLearning/LivePredictions';

export default function MachineLearningPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Machine Learning & NLP
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Interactive sentiment analysis using DistilBERT, featuring real-time predictions, model performance metrics, and explainability visualizations.
          </p>
        </div>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Badge variant="primary">HuggingFace</Badge>
          <Badge variant="primary">Transformers.js</Badge>
          <Badge variant="primary">DistilBERT</Badge>
          <Badge variant="primary">PyTorch</Badge>
          <Badge variant="primary">NLP</Badge>
          <Badge variant="primary">Sentiment Analysis</Badge>
          <Badge variant="primary">TypeScript</Badge>
          <Badge variant="primary">React</Badge>
        </div>

        {/* Model Description */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">About the Model</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            This implementation uses <strong>DistilBERT</strong>, a distilled version of BERT fine-tuned on the Stanford Sentiment Treebank (SST-2) dataset. The model runs entirely in the browser using Transformers.js, providing real-time sentiment analysis without server calls.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">66M</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Parameters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">91.8%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">~100ms</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inference Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">67K+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Training Samples</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Interactive Sentiment Classifier */}
      <Section padding="lg">
        <SentimentClassifier />
      </Section>

      {/* Model Performance Metrics */}
      <Section padding="lg" background="subtle">
        <ModelMetrics />
      </Section>

      {/* Confusion Matrix */}
      <Section padding="lg">
        <ConfusionMatrix />
      </Section>

      {/* Feature Analysis / Word Clouds */}
      <Section padding="lg" background="subtle">
        <WordCloudSection />
      </Section>

      {/* Live Predictions on Reddit Data */}
      <Section padding="lg">
        <LivePredictions />
      </Section>

      {/* Technical Implementation Details */}
      <Section padding="lg" background="subtle">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Technical Implementation</h2>

          <div className="space-y-6">
            {/* Architecture */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-3">Architecture & Approach</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The sentiment analysis system leverages a pre-trained DistilBERT model fine-tuned on the SST-2 dataset. DistilBERT is a smaller, faster, and lighter version of BERT that retains 97% of BERT's language understanding while being 60% faster and 40% smaller.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Model:</strong> distilbert-base-uncased-finetuned-sst-2-english</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Framework:</strong> Transformers.js for client-side inference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Task:</strong> Binary sentiment classification (positive/negative)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span><strong>Deployment:</strong> Fully client-side, no backend API calls required</span>
                </li>
              </ul>
            </div>

            {/* Training Details */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-3">Training & Evaluation</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The model was fine-tuned on the Stanford Sentiment Treebank v2 (SST-2), a benchmark dataset for binary sentiment classification containing movie reviews labeled as positive or negative.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Dataset</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• 67,349 total samples</li>
                    <li>• 80% training, 10% validation, 10% test</li>
                    <li>• Balanced class distribution</li>
                    <li>• Movie review domain</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Performance</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    <li>• 91.8% accuracy on test set</li>
                    <li>• 92.2% weighted F1-score</li>
                    <li>• Low false positive/negative rates</li>
                    <li>• Fast inference (~100ms)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Integration */}
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold mb-3">Integration with Portfolio Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                The model integrates with the existing Reddit data pipeline to provide live sentiment predictions on real posts. This demonstrates the practical application of ML models in production environments.
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Fetches random Reddit posts from PostgreSQL database</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Client-side inference using browser-loaded model</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Compares predictions with ground truth (when available)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                  <span>Real-time feedback on model performance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

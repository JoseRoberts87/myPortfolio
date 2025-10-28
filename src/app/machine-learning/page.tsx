import { Section, Card, Badge } from '@/components/ui';

export default function MachineLearningPage() {
  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Machine Learning
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            NLP-powered sentiment analysis for social media content with interactive predictions and insights.
          </p>
        </div>
      </Section>

      <Section padding="lg">
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Badge variant="warning" size="lg" className="mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-2xl font-semibold mb-4">Sentiment Analysis Model</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              This section will showcase a fine-tuned BERT/RoBERTa model for sentiment analysis,
              featuring real-time predictions, model performance metrics, and interactive visualizations
              of sentiment patterns in social media data.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Badge variant="primary">Python</Badge>
              <Badge variant="primary">PyTorch</Badge>
              <Badge variant="primary">Transformers</Badge>
              <Badge variant="primary">BERT</Badge>
              <Badge variant="primary">FastAPI</Badge>
              <Badge variant="primary">NLP</Badge>
            </div>
          </div>
        </Card>
      </Section>

      <Section padding="lg" background="subtle">
        <h2 className="text-3xl font-bold mb-8">Planned Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Model Training</h3>
            <p className="text-gray-400">
              Fine-tuned transformer models (BERT/RoBERTa) trained on social media data for accurate sentiment classification.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Real-time Inference</h3>
            <p className="text-gray-400">
              FastAPI endpoint for instant sentiment predictions with confidence scores and entity recognition.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Model Metrics</h3>
            <p className="text-gray-400">
              Interactive visualizations of accuracy, precision, recall, F1-score, and confusion matrices.
            </p>
          </Card>
          <Card variant="bordered">
            <h3 className="text-xl font-semibold mb-3">Feature Analysis</h3>
            <p className="text-gray-400">
              Word clouds, feature importance, and attention visualization to understand model decisions.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}

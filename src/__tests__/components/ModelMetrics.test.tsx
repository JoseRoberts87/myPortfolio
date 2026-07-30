import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelMetrics from '@/components/MachineLearning/ModelMetrics';

// Presentational component. Renders static MODEL_METRICS / DATASET_INFO / MODEL_INFO
// from src/lib/mlModelData.ts. It does NOT use recharts, so no chart mock is needed.

describe('ModelMetrics', () => {
  it('renders the section headings', () => {
    render(<ModelMetrics />);

    expect(screen.getByRole('heading', { name: 'Model Performance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Per-Class Performance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dataset Information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Model Information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Class Distribution' })).toBeInTheDocument();
  });

  it('renders the overall metric labels', () => {
    render(<ModelMetrics />);

    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Precision (Weighted)')).toBeInTheDocument();
    expect(screen.getByText('Recall (Weighted)')).toBeInTheDocument();
    expect(screen.getByText('F1 Score (Weighted)')).toBeInTheDocument();
  });

  it('renders the weighted accuracy value from MODEL_METRICS', () => {
    render(<ModelMetrics />);

    // accuracy + all three weighted metrics are 0.918 -> "91.8%" (4 cards).
    expect(screen.getAllByText('91.8%')).toHaveLength(4);
  });

  it('renders the per-class precision/recall/F1 percentages', () => {
    render(<ModelMetrics />);

    // Positive: precision 0.920, recall 0.925, f1 0.922
    expect(screen.getByText('92.0%')).toBeInTheDocument();
    expect(screen.getByText('92.5%')).toBeInTheDocument();
    expect(screen.getByText('92.2%')).toBeInTheDocument();
    // Negative: precision 0.915, recall 0.911, f1 0.913
    expect(screen.getByText('91.5%')).toBeInTheDocument();
    expect(screen.getByText('91.1%')).toBeInTheDocument();
    expect(screen.getByText('91.3%')).toBeInTheDocument();
  });

  it('renders the dataset sample counts', () => {
    render(<ModelMetrics />);

    expect(screen.getByText('67,349')).toBeInTheDocument(); // totalSamples
    expect(screen.getByText('53,879')).toBeInTheDocument(); // trainingSamples
    // validation and test samples are both 6,735.
    expect(screen.getAllByText('6,735')).toHaveLength(2);
  });

  it('renders the model information fields', () => {
    render(<ModelMetrics />);

    expect(screen.getByText('DistilBERT')).toBeInTheDocument();
    expect(screen.getByText('66M')).toBeInTheDocument();
    expect(screen.getByText('Transformers.js')).toBeInTheDocument();
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
  });

  it('renders the class distribution percentages', () => {
    render(<ModelMetrics />);

    expect(screen.getByText('55.5%')).toBeInTheDocument(); // positive
    expect(screen.getByText('44.5%')).toBeInTheDocument(); // negative
  });
});

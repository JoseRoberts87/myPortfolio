import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfusionMatrix from '@/components/MachineLearning/ConfusionMatrix';

// Presentational component. Renders the static CONFUSION_MATRIX from
// src/lib/mlModelData.ts:
//   TP (Pos/Pos) = 3730, FN (Pos/Neg) = 301, FP (Neg/Pos) = 253, TN (Neg/Neg) = 2451
//   total = 6735 -> 55.4% / 4.5% / 3.8% / 36.4%

describe('ConfusionMatrix', () => {
  it('renders the heading and description', () => {
    render(<ConfusionMatrix />);

    expect(screen.getByRole('heading', { name: 'Confusion Matrix' })).toBeInTheDocument();
    expect(
      screen.getByText(/true positives, true negatives, false positives, and false negatives/i)
    ).toBeInTheDocument();
  });

  it('renders the Predicted and Actual axis labels', () => {
    render(<ConfusionMatrix />);

    expect(screen.getByText('Predicted')).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
  });

  it('renders the matrix cell counts (TP/FN/FP/TN)', () => {
    render(<ConfusionMatrix />);

    expect(screen.getByText('3730')).toBeInTheDocument(); // TP
    expect(screen.getByText('301')).toBeInTheDocument(); // FN
    expect(screen.getByText('253')).toBeInTheDocument(); // FP
    expect(screen.getByText('2451')).toBeInTheDocument(); // TN
  });

  it('renders the per-cell percentages', () => {
    render(<ConfusionMatrix />);

    expect(screen.getByText('55.4%')).toBeInTheDocument(); // TP
    expect(screen.getByText('4.5%')).toBeInTheDocument(); // FN
    expect(screen.getByText('3.8%')).toBeInTheDocument(); // FP
    expect(screen.getByText('36.4%')).toBeInTheDocument(); // TN
  });

  it('renders the TP/TN/FP/FN insight labels', () => {
    render(<ConfusionMatrix />);

    expect(screen.getByText('True Positives')).toBeInTheDocument();
    expect(screen.getByText('True Negatives')).toBeInTheDocument();
    expect(screen.getByText('False Positives')).toBeInTheDocument();
    expect(screen.getByText('False Negatives')).toBeInTheDocument();
  });

  it('renders the insight values and total predictions', () => {
    render(<ConfusionMatrix />);

    // Matrix Insights combines the count with its percentage, e.g. "3730 (55.4%)".
    expect(screen.getByText(/3730\s*\(55\.4%\)/)).toBeInTheDocument();
    expect(screen.getByText('Total Predictions')).toBeInTheDocument();
    expect(screen.getByText('6,735')).toBeInTheDocument();
  });
});

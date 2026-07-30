import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WordCloudSection from '@/components/MachineLearning/WordCloudSection';

// Uses useState to toggle between POSITIVE_WORDS and NEGATIVE_WORDS (+ filtered
// FEATURE_IMPORTANCE). Anchors chosen so they appear in exactly one sentiment set:
//   'brilliant' -> POSITIVE_WORDS only (not in feature table)
//   'dull'      -> NEGATIVE_WORDS only (not in feature table)
//   95.0% -> excellent (top positive feature), 94.0% -> terrible (top negative feature)

describe('WordCloudSection', () => {
  it('renders the header and both sentiment toggle buttons', () => {
    render(<WordCloudSection />);

    expect(screen.getByRole('heading', { name: 'Feature Analysis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Positive Words' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Negative Words' })).toBeInTheDocument();
  });

  it('shows positive words and features by default', () => {
    render(<WordCloudSection />);

    expect(screen.getByText('positive Sentiment Word Cloud')).toBeInTheDocument();
    expect(screen.getByText(/Top 10 Most Predictive Positive Features/)).toBeInTheDocument();
    expect(screen.getByText('brilliant')).toBeInTheDocument();
    expect(screen.getByText('95.0%')).toBeInTheDocument(); // excellent importance
    expect(screen.queryByText('dull')).not.toBeInTheDocument();
  });

  it('switches to the negative set when "Negative Words" is clicked', () => {
    render(<WordCloudSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Negative Words' }));

    expect(screen.getByText('negative Sentiment Word Cloud')).toBeInTheDocument();
    expect(screen.getByText(/Top 10 Most Predictive Negative Features/)).toBeInTheDocument();
    expect(screen.getByText('dull')).toBeInTheDocument();
    expect(screen.getByText('94.0%')).toBeInTheDocument(); // terrible importance
    expect(screen.queryByText('brilliant')).not.toBeInTheDocument();
  });

  it('restores the positive set when "Positive Words" is clicked again', () => {
    render(<WordCloudSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Negative Words' }));
    expect(screen.getByText('dull')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Positive Words' }));

    expect(screen.getByText('brilliant')).toBeInTheDocument();
    expect(screen.queryByText('dull')).not.toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SentimentClassifier from '@/components/MachineLearning/SentimentClassifier';
import { useMLModel } from '@/hooks/useMLModel';

// Mock the ML hook so we can drive each status independently.
jest.mock('@/hooks/useMLModel', () => ({ useMLModel: jest.fn() }));
const mockUse = useMLModel as jest.Mock;

const base = {
  status: 'idle' as const,
  error: null as string | null,
  modelName: 'DistilBERT',
  isLoading: false,
  isReady: false,
  loadModel: jest.fn().mockResolvedValue(undefined),
  predict: jest.fn().mockResolvedValue(null),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUse.mockReturnValue({ ...base });
});

// NOTE: this component has no explicit "analyze" button. Predictions are triggered
// by the example-category buttons (immediate) or a 500ms debounced effect while
// typing. We exercise predict via an example button, which is the real affordance.

describe('SentimentClassifier', () => {
  it('shows a "Load Model" affordance and disabled input when idle', () => {
    render(<SentimentClassifier />);

    const loadButton = screen.getByRole('button', { name: 'Load Model' });
    expect(loadButton).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type or paste text/i)).toBeDisabled();

    fireEvent.click(loadButton);
    expect(base.loadModel).toHaveBeenCalled();
  });

  it('shows a loading indicator while the model loads', () => {
    mockUse.mockReturnValue({ ...base, status: 'loading', isLoading: true });
    render(<SentimentClassifier />);

    expect(screen.getByText('Loading model...')).toBeInTheDocument();
  });

  it('enables the text input and example buttons when ready', () => {
    mockUse.mockReturnValue({ ...base, status: 'ready', isReady: true });
    render(<SentimentClassifier />);

    expect(screen.getByText('Model Ready')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type or paste text/i)).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Positive Review' })).toBeEnabled();
  });

  it('calls predict and renders the sentiment result when analyzing text', async () => {
    const predict = jest.fn().mockResolvedValue({
      prediction: { label: 'positive', score: 0.9 },
      confidences: { positive: 0.9, neutral: 0, negative: 0.1 },
      text: 'This is absolutely fantastic! I love it!',
      inferenceTime: 5,
    });
    mockUse.mockReturnValue({ ...base, status: 'ready', isReady: true, predict });

    render(<SentimentClassifier />);

    fireEvent.click(screen.getByRole('button', { name: 'Positive Review' }));

    // Predicted sentiment label ("positive", lowercase) is unique to the result panel.
    expect(await screen.findByText('positive')).toBeInTheDocument();
    expect(predict).toHaveBeenCalledWith('This is absolutely fantastic! I love it!');
    expect(screen.getByText('90.0%')).toBeInTheDocument(); // positive confidence
  });

  it('shows the error message when the model errors', () => {
    mockUse.mockReturnValue({ ...base, status: 'error', error: 'boom' });
    render(<SentimentClassifier />);

    expect(screen.getByText(/Error: boom/)).toBeInTheDocument();
  });
});

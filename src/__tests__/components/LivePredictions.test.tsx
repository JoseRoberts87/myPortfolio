import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LivePredictions from '@/components/MachineLearning/LivePredictions';
import { useMLModel } from '@/hooks/useMLModel';
import type { RedditPost } from '@/types/ml';

// Mock the ML hook and global fetch (Reddit posts).
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

const post: RedditPost = {
  id: '1',
  title: 'Great product launch',
  body: 'I really enjoyed it',
  subreddit: 'technology',
  author: 'user123',
  score: 100,
  num_comments: 5,
  created_at: '2026-07-20T00:00:00Z',
  sentiment: 'positive',
  sentiment_score: 0.95,
};

// The component logs verbosely via console.log; silence it (and console.error) to
// keep test output clean.
let logSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  mockUse.mockReturnValue({ ...base });
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ posts: [post] }),
  }) as jest.Mock;
});

afterEach(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

describe('LivePredictions', () => {
  it('renders the header and the analyze button on initial load', () => {
    render(<LivePredictions />);

    expect(
      screen.getByRole('heading', { name: 'Live Predictions on Real Data' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze a Random Post/i })).toBeEnabled();
    // No result or error before interaction.
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument();
  });

  it('fetches a Reddit post and renders the prediction when the model is ready', async () => {
    const predict = jest.fn().mockResolvedValue({
      prediction: { label: 'positive', score: 0.9 },
      confidences: { positive: 0.9, neutral: 0, negative: 0.1 },
      text: 'Great product launch I really enjoyed it',
      inferenceTime: 5,
    });
    mockUse.mockReturnValue({ ...base, status: 'ready', isReady: true, predict });

    render(<LivePredictions />);

    fireEvent.click(screen.getByRole('button', { name: /Analyze a Random Post/i }));

    // Wait for the async fetch -> predict -> render chain to complete.
    expect(
      await screen.findByText('Prediction matches actual sentiment!')
    ).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/reddit/posts?page=')
    );
    expect(predict).toHaveBeenCalledWith('Great product launch I really enjoyed it');
  });

  it('renders the fetched post details and predicted sentiment', async () => {
    const predict = jest.fn().mockResolvedValue({
      prediction: { label: 'positive', score: 0.9 },
      confidences: { positive: 0.9, neutral: 0, negative: 0.1 },
      text: 'Great product launch I really enjoyed it',
      inferenceTime: 5,
    });
    mockUse.mockReturnValue({ ...base, status: 'ready', isReady: true, predict });

    render(<LivePredictions />);

    fireEvent.click(screen.getByRole('button', { name: /Analyze a Random Post/i }));

    expect(await screen.findByText('Great product launch')).toBeInTheDocument();
    expect(screen.getByText('r/technology')).toBeInTheDocument();
    expect(screen.getByText('90.0% confidence')).toBeInTheDocument();
    // Both the model prediction and actual sentiment badges read "positive".
    expect(screen.getAllByText('positive')).toHaveLength(2);
  });
});

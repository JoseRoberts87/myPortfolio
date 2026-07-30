/**
 * Unit tests for the useMLModel hook.
 *
 * The hook dynamically imports @huggingface/transformers inside loadModel(),
 * builds a sentiment-analysis classifier via pipeline(), and predict(text)
 * runs that classifier expecting [{ label, score }]. jest.mock intercepts the
 * dynamic import so no real model is downloaded.
 */
import { renderHook, act } from '@testing-library/react';
import { useMLModel } from '@/hooks/useMLModel';
import { pipeline } from '@huggingface/transformers';
import { MODEL_INFO } from '@/lib/mlModelData';
import type { SentimentResult } from '@/types/ml';

// jest.mock is hoisted above the imports at transform time (and intercepts the
// dynamic import inside the hook too), so the static import of pipeline above
// resolves to this mock.
jest.mock('@huggingface/transformers', () => ({
  __esModule: true,
  pipeline: jest.fn(),
  env: { allowLocalModels: false, allowRemoteModels: true },
}));

const mockPipeline = pipeline as jest.Mock;

const MODEL_ID = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

/** Build a classifier mock resolving a single [{ label, score }] result. */
function makeClassifier(label: string, score: number) {
  return jest.fn().mockResolvedValue([{ label, score }]);
}

describe('useMLModel', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockPipeline.mockReset();
    // Silence the hook's expected progress/error logging.
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Self-verify: fail if any React "not wrapped in act(...)" warning slipped
    // through, guaranteeing the suite emits zero act() warnings.
    const actWarning = errorSpy.mock.calls.find((callArgs) =>
      String(callArgs[0] ?? '').includes('not wrapped in act')
    );
    expect(actWarning).toBeUndefined();
    jest.restoreAllMocks();
  });

  it('starts in the idle state', () => {
    const { result } = renderHook(() => useMLModel());

    expect(result.current.status).toBe('idle');
    expect(result.current.isReady).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.modelName).toBe(MODEL_INFO.fullName);
    expect(result.current.error).toBeNull();
  });

  it('loads the model successfully', async () => {
    mockPipeline.mockResolvedValue(makeClassifier('POSITIVE', 0.9));

    const { result } = renderHook(() => useMLModel());

    await act(async () => {
      await result.current.loadModel();
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.isReady).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockPipeline).toHaveBeenCalledWith('sentiment-analysis', MODEL_ID);
  });

  it('enters the error state when model loading fails', async () => {
    mockPipeline.mockRejectedValue(new Error('load fail'));

    const { result } = renderHook(() => useMLModel());

    await act(async () => {
      await result.current.loadModel();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.isReady).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toBe('load fail');
  });

  it('returns null and records an error when predicting before the model is loaded', async () => {
    const { result } = renderHook(() => useMLModel());

    let prediction: SentimentResult | null = null;
    await act(async () => {
      prediction = await result.current.predict('hi');
    });

    expect(prediction).toBeNull();
    expect(result.current.error).toMatch(/model not loaded/i);
    expect(mockPipeline).not.toHaveBeenCalled();
  });

  it('predicts positive sentiment', async () => {
    const classifier = makeClassifier('POSITIVE', 0.9);
    mockPipeline.mockResolvedValue(classifier);

    const { result } = renderHook(() => useMLModel());

    await act(async () => {
      await result.current.loadModel();
    });

    let prediction: SentimentResult | null = null;
    await act(async () => {
      prediction = await result.current.predict('I absolutely love this');
    });

    expect(prediction).not.toBeNull();
    const value = prediction as unknown as SentimentResult;
    expect(value.prediction.label).toBe('positive');
    expect(value.prediction.score).toBe(0.9);
    expect(value.confidences.positive).toBe(0.9);
    expect(value.text).toBe('I absolutely love this');
    expect(classifier).toHaveBeenCalledWith('I absolutely love this');
  });

  it('predicts negative sentiment', async () => {
    const classifier = makeClassifier('NEGATIVE', 0.8);
    mockPipeline.mockResolvedValue(classifier);

    const { result } = renderHook(() => useMLModel());

    await act(async () => {
      await result.current.loadModel();
    });

    let prediction: SentimentResult | null = null;
    await act(async () => {
      prediction = await result.current.predict('This was a terrible experience');
    });

    expect(prediction).not.toBeNull();
    const value = prediction as unknown as SentimentResult;
    expect(value.prediction.label).toBe('negative');
    expect(value.prediction.score).toBe(0.8);
    expect(value.confidences.negative).toBe(0.8);
  });

  it('returns null for empty / whitespace-only text', async () => {
    const classifier = makeClassifier('POSITIVE', 0.9);
    mockPipeline.mockResolvedValue(classifier);

    const { result } = renderHook(() => useMLModel());

    await act(async () => {
      await result.current.loadModel();
    });

    let prediction: SentimentResult | null = null;
    await act(async () => {
      prediction = await result.current.predict('   ');
    });

    expect(prediction).toBeNull();
    // Whitespace short-circuits before the classifier is invoked.
    expect(classifier).not.toHaveBeenCalled();
    // Silence-spy is referenced so lint does not flag it as unused.
    expect(logSpy).toHaveBeenCalled();
  });
});

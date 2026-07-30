/**
 * Unit tests for the useObjectDetection hook.
 *
 * The hook loads a COCO-SSD model on mount and exposes helpers to detect
 * objects in a single image or continuously in a <video> element. The heavy
 * TensorFlow modules are mocked so these tests run fast and deterministically.
 */
import { renderHook, act, waitFor } from '@testing-library/react';

jest.mock('@tensorflow/tfjs', () => ({}));
jest.mock('@tensorflow-models/coco-ssd', () => ({ load: jest.fn() }));

import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useObjectDetection } from '@/hooks/useObjectDetection';

const mockLoad = cocoSsd.load as jest.Mock;
const mockDetect = jest.fn();

describe('useObjectDetection', () => {
  beforeEach(() => {
    mockLoad.mockReset();
    mockDetect.mockReset();
    mockLoad.mockResolvedValue({ detect: mockDetect });
  });

  afterEach(() => {
    // Some tests opt into fake timers; always restore real timers afterwards.
    jest.useRealTimers();
  });

  it('starts with isModelLoading true', async () => {
    const { result } = renderHook(() => useObjectDetection());

    expect(result.current.isModelLoading).toBe(true);

    // Flush the pending async model load so the state update happens inside act.
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));
  });

  it('loads the model and clears the loading flag', async () => {
    const { result } = renderHook(() => useObjectDetection());

    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    expect(result.current.model).toBeTruthy();
    expect(result.current.modelError).toBeNull();
  });

  it('sets modelError when the model fails to load', async () => {
    mockLoad.mockReset();
    mockLoad.mockRejectedValue(new Error('x'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useObjectDetection());

    await waitFor(() => expect(result.current.modelError).toBeTruthy());
    expect(result.current.isModelLoading).toBe(false);

    errorSpy.mockRestore();
  });

  it('detectImage maps predictions to the DetectedObject shape', async () => {
    const { result } = renderHook(() => useObjectDetection());
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    mockDetect.mockResolvedValue([
      { class: 'person', score: 0.9, bbox: [0, 0, 10, 10] },
    ]);

    let dets: any;
    await act(async () => {
      dets = await result.current.detectImage({} as HTMLImageElement);
    });

    expect(dets[0].class).toBe('person');
    expect(dets[0].score).toBe(0.9);
    expect(dets[0].bbox).toEqual([0, 0, 10, 10]);
  });

  it('startDetection/stopDetection toggle isDetecting and reset stats', async () => {
    const { result } = renderHook(() => useObjectDetection());
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    // Fake timers keep the ~30fps detection loop and the 1s FPS interval from
    // ever firing; we only assert the synchronous state transitions.
    jest.useFakeTimers();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    act(() => {
      result.current.startDetection({} as HTMLVideoElement);
    });
    expect(result.current.isDetecting).toBe(true);

    act(() => {
      result.current.stopDetection();
    });
    expect(result.current.isDetecting).toBe(false);
    expect(result.current.stats).toEqual({
      fps: 0,
      objectCount: 0,
      detections: [],
    });

    logSpy.mockRestore();
    jest.useRealTimers();
  });
});

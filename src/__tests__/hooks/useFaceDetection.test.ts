/**
 * Unit tests for the useFaceDetection hook.
 *
 * The hook dynamically imports MediaPipe's FaceDetection on mount, initializes
 * it, and drives a requestAnimationFrame detection loop. MediaPipe is mocked so
 * no WASM is loaded, and requestAnimationFrame is stubbed where a loop would
 * otherwise be scheduled so the tests stay bounded and deterministic.
 */
import { renderHook, act, waitFor } from '@testing-library/react';

const mockInitialize = jest.fn().mockResolvedValue(undefined);
const mockSetOptions = jest.fn();
const mockOnResults = jest.fn();
const mockSend = jest.fn().mockResolvedValue(undefined);
const mockClose = jest.fn();

jest.mock('@mediapipe/face_detection', () => ({
  __esModule: true,
  FaceDetection: jest.fn().mockImplementation(() => ({
    setOptions: mockSetOptions,
    initialize: mockInitialize,
    onResults: mockOnResults,
    send: mockSend,
    close: mockClose,
  })),
}));

import { useFaceDetection } from '@/hooks/useFaceDetection';

describe('useFaceDetection', () => {
  beforeEach(() => {
    mockInitialize.mockReset();
    mockInitialize.mockResolvedValue(undefined);
    mockSetOptions.mockReset();
    mockOnResults.mockReset();
    mockSend.mockReset();
    mockSend.mockResolvedValue(undefined);
    mockClose.mockReset();
  });

  it('starts with isModelLoading true', async () => {
    const { result } = renderHook(() => useFaceDetection());

    expect(result.current.isModelLoading).toBe(true);

    // Flush the pending async model load so the state update happens inside act.
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));
  });

  it('loads the model, calling setOptions and initialize', async () => {
    const { result } = renderHook(() => useFaceDetection());

    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    expect(result.current.modelError).toBeNull();
    expect(mockSetOptions).toHaveBeenCalled();
    expect(mockInitialize).toHaveBeenCalled();
  });

  it('sets modelError when initialize rejects', async () => {
    mockInitialize.mockRejectedValueOnce(new Error('x'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useFaceDetection());

    await waitFor(() => expect(result.current.modelError).toBeTruthy());

    errorSpy.mockRestore();
  });

  it('startDetection registers onResults and sets isDetecting', async () => {
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(1 as any);

    const { result } = renderHook(() => useFaceDetection());
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    act(() => {
      result.current.startDetection({ readyState: 4 } as HTMLVideoElement);
    });

    expect(result.current.isDetecting).toBe(true);
    expect(mockOnResults).toHaveBeenCalledWith(expect.any(Function));

    rafSpy.mockRestore();
  });

  it('onResults maps detections into stats', async () => {
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(1 as any);

    const { result } = renderHook(() => useFaceDetection());
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    act(() => {
      result.current.startDetection({ readyState: 4 } as HTMLVideoElement);
    });

    // The hook passes its results handler to onResults; grab it and invoke it
    // with a MediaPipe-shaped detection payload.
    const onResultsCallback = mockOnResults.mock.calls[0][0];

    act(() => {
      onResultsCallback({
        detections: [
          {
            boundingBox: { xCenter: 0.5, yCenter: 0.5, width: 0.2, height: 0.2 },
            landmarks: [],
            V: [{ ga: 0.95 }],
          },
        ],
      });
    });

    expect(result.current.stats.faceCount).toBe(1);
    expect(result.current.stats.faces[0].score).toBe(0.95);

    rafSpy.mockRestore();
  });

  it('stopDetection resets isDetecting and stats', async () => {
    const rafSpy = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockReturnValue(1 as any);
    const cancelSpy = jest
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useFaceDetection());
    await waitFor(() => expect(result.current.isModelLoading).toBe(false));

    act(() => {
      result.current.startDetection({ readyState: 4 } as HTMLVideoElement);
    });
    expect(result.current.isDetecting).toBe(true);

    act(() => {
      result.current.stopDetection();
    });

    expect(result.current.isDetecting).toBe(false);
    expect(result.current.stats).toEqual({ fps: 0, faceCount: 0, faces: [] });

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
  });
});

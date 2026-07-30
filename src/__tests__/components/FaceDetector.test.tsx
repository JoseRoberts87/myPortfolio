import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the face-overlay draw utilities and the detection hook so no real
// canvas context, webcam, or MediaPipe model is exercised. UI is driven
// entirely by the controlled hook return value.
jest.mock('@/utils/drawFaceOverlays', () => ({
  drawFaceOverlays: jest.fn(),
  clearCanvas: jest.fn(),
}));
jest.mock('@/hooks/useFaceDetection', () => ({
  useFaceDetection: jest.fn(),
}));

import FaceDetector from '@/components/ComputerVision/FaceDetector';
import { useFaceDetection } from '@/hooks/useFaceDetection';

const mockUse = useFaceDetection as jest.Mock;

// Webcam + canvas stubs (defensive; draw utils are mocked so a context is
// never actually requested).
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest
      .fn()
      .mockResolvedValue({ getTracks: () => [{ stop: jest.fn() }] }),
  },
  configurable: true,
});
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({})) as any;

const base = {
  isModelLoading: false,
  modelError: null,
  isDetecting: false,
  stats: { fps: 0, faceCount: 0, faces: [] },
  startDetection: jest.fn(),
  stopDetection: jest.fn(),
};

const renderWith = (overrides: Partial<typeof base>) => {
  mockUse.mockReturnValue({ ...base, ...overrides });
  return render(<FaceDetector />);
};

describe('FaceDetector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUse.mockReturnValue(base);
  });

  it('shows a loading indicator while the models are loading', () => {
    renderWith({ isModelLoading: true });

    expect(screen.getByText('Loading AI Models...')).toBeInTheDocument();
    expect(screen.getByText('Powered by Google MediaPipe')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Loading Models...' });
    expect(button).toBeDisabled();
  });

  it('renders the enable-camera control once the models are ready', () => {
    renderWith({ isModelLoading: false });

    const button = screen.getByRole('button', { name: 'Enable Camera' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(screen.queryByText('Loading AI Models...')).not.toBeInTheDocument();
    expect(screen.getByText(/Click .* to begin/)).toBeInTheDocument();
  });

  it('renders a model error message when the hook reports an error', () => {
    renderWith({ modelError: 'Failed to load MediaPipe models' });

    expect(screen.getByText('Model Error')).toBeInTheDocument();
    expect(
      screen.getByText('Failed to load MediaPipe models')
    ).toBeInTheDocument();
  });

  it('reflects the face count, FPS, and per-face list while detecting', () => {
    renderWith({
      isDetecting: true,
      stats: {
        fps: 24,
        faceCount: 2,
        faces: [{ score: 0.9 }, { score: 0.82 }],
      } as never,
    });

    // Stats bar reflects the hook stats
    expect(screen.getByText('24')).toBeInTheDocument(); // FPS
    expect(screen.getByText('2')).toBeInTheDocument(); // face count stat
    expect(screen.getByText('Active')).toBeInTheDocument(); // status badge
    // Detected faces list reflects faceCount and per-face rows
    expect(screen.getByText('Detected Faces (2)')).toBeInTheDocument();
    expect(screen.getByText('Face 1')).toBeInTheDocument();
    expect(screen.getByText('Face 2')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});

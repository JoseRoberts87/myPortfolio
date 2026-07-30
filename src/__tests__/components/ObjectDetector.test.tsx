import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the canvas draw utilities and the detection hook so we never touch a
// real 2D context, webcam, or TensorFlow model. UI is driven entirely by the
// controlled hook return value.
jest.mock('@/utils/drawBoundingBoxes', () => ({
  drawBoundingBoxes: jest.fn(),
  clearCanvas: jest.fn(),
}));
jest.mock('@/hooks/useObjectDetection', () => ({
  useObjectDetection: jest.fn(),
}));

import ObjectDetector from '@/components/ComputerVision/ObjectDetector';
import { useObjectDetection } from '@/hooks/useObjectDetection';

const mockUse = useObjectDetection as jest.Mock;

// Webcam + canvas stubs (defensive; draw utils are mocked so a context is
// never actually requested, but this keeps jsdom quiet if anything changes).
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
  model: null,
  isModelLoading: false,
  modelError: null,
  isDetecting: false,
  stats: { fps: 0, objectCount: 0, detections: [] },
  startDetection: jest.fn(),
  stopDetection: jest.fn(),
  detectImage: jest.fn(),
};

const renderWith = (overrides: Partial<typeof base>) => {
  mockUse.mockReturnValue({ ...base, ...overrides });
  return render(<ObjectDetector />);
};

describe('ObjectDetector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUse.mockReturnValue(base);
  });

  it('shows a loading indicator while the model is loading', () => {
    renderWith({ isModelLoading: true });

    // Loading overlay + disabled button reflect the loading hook state
    expect(screen.getByText('Loading AI Model...')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'Loading Model...' });
    expect(button).toBeDisabled();
  });

  it('renders the enable-camera control once the model is ready', () => {
    renderWith({ isModelLoading: false, model: {} as never });

    const button = screen.getByRole('button', { name: 'Enable Camera' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    // Not stuck in the loading overlay
    expect(screen.queryByText('Loading AI Model...')).not.toBeInTheDocument();
    expect(screen.getByText(/Click .* to begin/)).toBeInTheDocument();
  });

  it('renders a model error message when the hook reports an error', () => {
    renderWith({ modelError: 'Failed to load COCO-SSD model' });

    expect(screen.getByText('Model Error')).toBeInTheDocument();
    expect(
      screen.getByText('Failed to load COCO-SSD model')
    ).toBeInTheDocument();
  });

  it('surfaces object count, FPS, and detection list while detecting', () => {
    renderWith({
      isDetecting: true,
      stats: {
        fps: 30,
        objectCount: 2,
        detections: [
          { class: 'person', score: 0.95, bbox: [0, 0, 10, 10] },
          { class: 'dog', score: 0.8, bbox: [0, 0, 10, 10] },
        ],
      } as never,
    });

    // Stats bar reflects the hook stats
    expect(screen.getByText('30')).toBeInTheDocument(); // FPS
    expect(screen.getByText('2')).toBeInTheDocument(); // object count
    expect(screen.getByText('Active')).toBeInTheDocument(); // status badge
    // Detected objects list rows
    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByText('dog')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });
});

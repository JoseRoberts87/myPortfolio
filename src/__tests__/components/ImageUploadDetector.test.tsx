import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the server-side detection API so no real network/backend call happens.
jest.mock('@/lib/api', () => ({
  detectObjectsInImage: jest.fn(),
}));

import ImageUploadDetector from '@/components/ComputerVision/ImageUploadDetector';
import { detectObjectsInImage } from '@/lib/api';

const mockDetect = detectObjectsInImage as jest.Mock;

// The hidden file input has id="image-upload".
const getFileInput = (container: HTMLElement) =>
  container.querySelector('#image-upload') as HTMLInputElement;

describe('ImageUploadDetector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the upload UI, heading, and server-side badge', () => {
    const { container } = render(<ImageUploadDetector />);

    expect(
      screen.getByRole('heading', { name: 'YOLO Object Detection' })
    ).toBeInTheDocument();
    expect(screen.getByText('Server-Side')).toBeInTheDocument();
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, JPEG up to 10MB')).toBeInTheDocument();
    // Hidden file input exists and accepts images
    const input = getFileInput(container);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('surfaces the confidence slider and action buttons after selecting a file', async () => {
    const { container } = render(<ImageUploadDetector />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    // Preview <img alt="Original"> only appears once the FileReader resolves;
    // awaiting it flushes that async state update inside act().
    expect(await screen.findByAltText('Original')).toBeInTheDocument();

    expect(screen.getByText(/Confidence Threshold: 50%/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Detect Objects' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  it('calls the detection API and renders returned detections', async () => {
    mockDetect.mockResolvedValue({
      detections: [
        { class_name: 'person', confidence: 0.92, bbox: [0, 0, 10, 10] },
        { class_name: 'chair', confidence: 0.61, bbox: [5, 5, 20, 20] },
      ],
      image_width: 640,
      image_height: 480,
      annotated_image: null,
    });

    const { container } = render(<ImageUploadDetector />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(getFileInput(container), { target: { files: [file] } });
    await screen.findByAltText('Original');

    fireEvent.click(screen.getByRole('button', { name: 'Detect Objects' }));

    // Result list header reflects the number of detections returned by the mock
    expect(await screen.findByText('Detected Objects (2)')).toBeInTheDocument();
    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.getByText('chair')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();

    // API mock was wired and invoked with the selected file + confidence options
    expect(mockDetect).toHaveBeenCalledTimes(1);
    expect(mockDetect).toHaveBeenCalledWith(file, {
      confidence: 0.5,
      returnAnnotated: true,
    });
  });
});

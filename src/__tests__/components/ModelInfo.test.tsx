import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModelInfo from '@/components/ComputerVision/ModelInfo';

// ModelInfo is purely presentational (a single `useState` toggle) with no
// detection hooks, canvas, or webcam, so nothing needs to be mocked here.

describe('ModelInfo Component', () => {
  it('renders the model info headings and key details', () => {
    render(<ModelInfo />);

    expect(
      screen.getByRole('heading', { name: 'About COCO-SSD Model' })
    ).toBeInTheDocument();
    expect(screen.getByText('Detectable Objects')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    // Framework stat value
    expect(screen.getByText('TensorFlow.js')).toBeInTheDocument();
  });

  it('shows a truncated class list with a "+N more" badge by default', () => {
    render(<ModelInfo />);

    // First class is visible, the last class is hidden behind the toggle
    expect(screen.getByText('person')).toBeInTheDocument();
    expect(screen.queryByText('toothbrush')).not.toBeInTheDocument();

    // Toggle button advertises the full count (80 COCO classes)
    expect(
      screen.getByRole('button', { name: 'View All (80)' })
    ).toBeInTheDocument();
    // Warning badge for the hidden remainder (80 - 20 = 60)
    expect(screen.getByText('+60 more')).toBeInTheDocument();
  });

  it('reveals all classes when the toggle is clicked and hides them again', () => {
    render(<ModelInfo />);

    const toggle = screen.getByRole('button', { name: 'View All (80)' });
    fireEvent.click(toggle);

    // Previously hidden class is now rendered, remainder badge is gone
    expect(screen.getByText('toothbrush')).toBeInTheDocument();
    expect(screen.queryByText('+60 more')).not.toBeInTheDocument();
    // Button label flips to "Show Less"
    const collapse = screen.getByRole('button', { name: 'Show Less' });
    expect(collapse).toBeInTheDocument();

    // Clicking again collapses the list back down
    fireEvent.click(collapse);
    expect(screen.queryByText('toothbrush')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View All (80)' })
    ).toBeInTheDocument();
  });
});

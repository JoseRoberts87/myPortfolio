import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeDownload from '@/components/ResumeDownload';

describe('ResumeDownload Component', () => {
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    originalCreateElement = document.createElement;
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    jest.restoreAllMocks();
  });

  it('should render the component with title and description', () => {
    render(<ResumeDownload />);

    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('PDF Document')).toBeInTheDocument();
  });

  it('should display candidate name and title', () => {
    render(<ResumeDownload />);

    expect(screen.getByText('Jose Roberts')).toBeInTheDocument();
    expect(screen.getByText('Senior Full-Stack Engineer')).toBeInTheDocument();
  });

  it('should display key qualifications', () => {
    render(<ResumeDownload />);

    expect(
      screen.getByText(/6\+ years of full-stack development experience/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Expertise in React, Next.js, TypeScript, Python, AWS/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cloud infrastructure and DevOps with Terraform & Docker/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Machine Learning & Data Engineering capabilities/i)
    ).toBeInTheDocument();
  });

  it('should display download button', () => {
    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).not.toBeDisabled();
  });

  it('should display file information', () => {
    render(<ResumeDownload />);

    expect(screen.getByText('PDF • 79 KB')).toBeInTheDocument();
  });

  it('should display security badges', () => {
    render(<ResumeDownload />);

    expect(screen.getByText('Secure Download')).toBeInTheDocument();
    expect(screen.getByText('Printer Friendly')).toBeInTheDocument();
  });

  it('should have document icon', () => {
    const { container } = render(<ResumeDownload />);

    // Check for SVG document icon
    const documentIcon = container.querySelector('svg path[d*="M9 12h6"]');
    expect(documentIcon).toBeInTheDocument();
  });

  it('should have download icon in button', () => {
    const { container } = render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    const svg = downloadButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should trigger download when button is clicked', () => {
    const mockClick = jest.fn();
    const mockLink = document.createElement('a');
    mockLink.click = mockClick;

    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    expect(mockLink.href).toContain('/Jose-Roberts-Resume.pdf');
    expect(mockLink.download).toBe('Jose-Roberts-Resume.pdf');
    expect(mockClick).toHaveBeenCalled();
  });

  it('should show "Downloading..." text while downloading', () => {
    const mockClick = jest.fn();
    const mockLink = document.createElement('a');
    mockLink.click = mockClick;

    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    expect(screen.getByText('Downloading...')).toBeInTheDocument();
  });

  it('should disable button while downloading', () => {
    const mockClick = jest.fn();
    const mockLink = document.createElement('a');
    mockLink.click = mockClick;

    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    expect(downloadButton).toBeDisabled();
  });

  it('should reset button state after download completes', async () => {
    jest.useFakeTimers();

    const mockClick = jest.fn();
    const mockLink = document.createElement('a');
    mockLink.click = mockClick;

    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    expect(screen.getByText('Downloading...')).toBeInTheDocument();

    // Fast-forward time by 1000ms
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByText('Download Resume')).toBeInTheDocument();
      expect(downloadButton).not.toBeDisabled();
    });

    jest.useRealTimers();
  });

  it('should have hover effects on download button', () => {
    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    expect(downloadButton).toHaveClass('hover:from-purple-500');
    expect(downloadButton).toHaveClass('hover:to-purple-400');
  });

  it('should have gradient background on CTA section', () => {
    const { container } = render(<ResumeDownload />);

    const ctaSection = container.querySelector('.bg-gradient-to-br.from-purple-900\\/20');
    expect(ctaSection).toBeInTheDocument();
  });

  it('should display checkmark icons for qualifications', () => {
    const { container } = render(<ResumeDownload />);

    // Should have 4 qualification items with checkmark icons
    const checkmarks = container.querySelectorAll('path[clip-rule="evenodd"]');
    expect(checkmarks.length).toBeGreaterThanOrEqual(4);
  });

  it('should have responsive grid layout', () => {
    const { container } = render(<ResumeDownload />);

    const grid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
    expect(grid).toBeInTheDocument();
  });

  it('should have proper button styling', () => {
    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    expect(downloadButton).toHaveClass('px-8');
    expect(downloadButton).toHaveClass('py-4');
    expect(downloadButton).toHaveClass('rounded-lg');
    expect(downloadButton).toHaveClass('font-semibold');
  });

  it('should render within a Card component', () => {
    const { container } = render(<ResumeDownload />);

    // Card component adds rounded-lg class
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
  });

  it('should have download cloud icon', () => {
    const { container } = render(<ResumeDownload />);

    // Check for cloud download SVG icon
    const cloudIcon = container.querySelector('svg path[d*="M7 16a4 4 0"]');
    expect(cloudIcon).toBeInTheDocument();
  });

  it('should animate download icon while downloading', () => {
    const mockClick = jest.fn();
    const mockLink = document.createElement('a');
    mockLink.click = mockClick;

    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    const { container } = render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    // Icon should have animate-bounce class while downloading
    const downloadIcon = downloadButton.querySelector('svg');
    expect(downloadIcon).toHaveClass('animate-bounce');
  });

  it('should have correct file path for resume', () => {
    const mockClick = jest.fn();
    const mockLink = document.createElement('a');
    mockLink.click = mockClick;

    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as any;

    render(<ResumeDownload />);

    const downloadButton = screen.getByRole('button', { name: /download resume/i });
    fireEvent.click(downloadButton);

    expect(mockLink.href).toContain('/Jose-Roberts-Resume.pdf');
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentGenerator from '@/components/ContentGenerator';

const okGen = (
  content: string,
  sources: Array<{ id: string; title: string; score: number }> = [],
) => ({
  ok: true,
  json: async () => ({ content, sources, model: 'llama3.2', tokens_used: 256 }),
});

describe('ContentGenerator', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the brief field, controls, and suggested briefs', () => {
    render(<ContentGenerator />);
    expect(screen.getByLabelText(/Target role or job description/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Tone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Senior AI Engineer — RAG systems & agentic workflows' }),
    ).toBeInTheDocument();
  });

  it('fills the brief when a suggested brief is clicked', () => {
    render(<ContentGenerator />);
    fireEvent.click(
      screen.getByRole('button', { name: 'ML Engineer — time-series forecasting & MLOps' }),
    );
    expect(screen.getByLabelText(/Target role or job description/i)).toHaveValue(
      'ML Engineer — time-series forecasting & MLOps',
    );
  });

  it('generates content and renders it with grounding sources', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      okGen('I am a Data & AI Architect who built an agentic workforce.', [
        { id: 'mojotech', title: 'MojoTech', score: 0.8 },
      ]),
    );

    render(<ContentGenerator />);
    fireEvent.change(screen.getByLabelText(/Target role or job description/i), {
      target: { value: 'Senior AI Engineer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await screen.findByText('I am a Data & AI Architect who built an agentic workforce.');
    // Grounding sources shown.
    expect(screen.getByText('MojoTech')).toBeInTheDocument();
    expect(screen.getByText(/grounded in Jose's résumé, not invented/i)).toBeInTheDocument();
    // Hit the generate endpoint.
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/generate$/);
  });

  it('sends the selected format and tone in the request body', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(okGen('Draft.'));

    render(<ContentGenerator />);
    fireEvent.change(screen.getByLabelText('Format'), { target: { value: 'cover_letter' } });
    fireEvent.change(screen.getByLabelText('Tone'), { target: { value: 'punchy' } });
    fireEvent.change(screen.getByLabelText(/Target role or job description/i), {
      target: { value: 'Staff role' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await screen.findByText('Draft.');
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body).toEqual({ brief: 'Staff role', format: 'cover_letter', tone: 'punchy' });
  });

  it('copies the generated content to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    (global.fetch as jest.Mock).mockResolvedValueOnce(okGen('Copy me.'));

    render(<ContentGenerator />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    await screen.findByText('Copy me.');

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(writeText).toHaveBeenCalledWith('Copy me.');
    await screen.findByText('Copied ✓');
  });

  it('shows an error when the backend returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'The content generator is not configured.' }),
    });

    render(<ContentGenerator />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await screen.findByText('The content generator is not configured.');
  });

  it('shows a network-error message when the fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    render(<ContentGenerator />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await screen.findByText(/Could not reach the generator/i);
  });
});

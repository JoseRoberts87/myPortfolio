import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom doesn't provide TextEncoder/TextDecoder; the SSE reader/decoder needs them.
Object.assign(global, { TextEncoder, TextDecoder });

import ContentGenerator from '@/components/ContentGenerator';

// Build a mock streaming Response whose body yields the given SSE events.
function sseResponse(events: Array<Record<string, unknown>>) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(''));
  let sent = false;
  return {
    ok: true,
    body: {
      getReader: () => ({
        read: async () =>
          sent ? { done: true, value: undefined } : ((sent = true), { done: false, value: bytes }),
      }),
    },
  };
}

// A full successful generation as its stream of events (issue #171): the draft
// arrives token-by-token after the grounding sources.
const okGenStream = (
  content: string,
  sources: Array<{ id: string; title: string; score: number }> = [],
) =>
  sseResponse([
    { type: 'sources', sources, model: 'llama3.2' },
    // Split the content into a few token events to exercise incremental append.
    ...content.match(/.{1,10}/g)!.map((text) => ({ type: 'token', text })),
    { type: 'done', tokens_used: 256 },
  ]);

describe('ContentGenerator (streaming)', () => {
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

  it('streams the draft and renders it with grounding sources', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      okGenStream('I am a Data & AI Architect who built an agentic workforce.', [
        { id: 'mojotech', title: 'MojoTech', score: 0.8 },
      ]),
    );

    render(<ContentGenerator />);
    fireEvent.change(screen.getByLabelText(/Target role or job description/i), {
      target: { value: 'Senior AI Engineer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    // The token events reassemble into the full draft.
    await screen.findByText('I am a Data & AI Architect who built an agentic workforce.');
    // Grounding sources shown.
    expect(screen.getByText('MojoTech')).toBeInTheDocument();
    expect(screen.getByText(/grounded in Jose's résumé, not invented/i)).toBeInTheDocument();
    // Hit the streaming generate endpoint.
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/generate\/stream$/);
  });

  it('sends the selected format and tone in the request body', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(okGenStream('Draft.'));

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
    (global.fetch as jest.Mock).mockResolvedValueOnce(okGenStream('Copy me.'));

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

  it('renders a mid-stream error event as the error state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      sseResponse([
        { type: 'sources', sources: [], model: 'llama3.2' },
        { type: 'error', detail: 'The content generator is temporarily unavailable.' },
      ]),
    );

    render(<ContentGenerator />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await screen.findByText('The content generator is temporarily unavailable.');
  });

  it('shows a network-error message when the fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    render(<ContentGenerator />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await screen.findByText(/Could not reach the generator/i);
  });
});

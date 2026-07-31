import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom doesn't provide TextEncoder/TextDecoder; the SSE reader/decoder needs them.
Object.assign(global, { TextEncoder, TextDecoder });

import AiChat from '@/components/AiChat';

// jsdom lacks Element.prototype.scrollTo (used by the auto-scroll effect).
beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

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

describe('AiChat (streaming)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the empty state with suggested questions', () => {
    render(<AiChat />);
    expect(screen.getByText(/Ask anything about Jose/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'What has Jose done with agentic AI?' }),
    ).toBeInTheDocument();
  });

  it('discloses that conversations may be logged before the first message', () => {
    render(<AiChat />);
    expect(screen.getByText(/Conversations may be logged/i)).toBeInTheDocument();
  });

  it('streams a grounded answer token-by-token and shows sources', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      sseResponse([
        {
          type: 'sources',
          sources: [{ id: 'mojotech', title: 'MojoTech — Data and AI Architect (2026)', score: 0.71 }],
          model: 'gpt-oss:20b',
        },
        { type: 'token', text: 'Jose built ' },
        { type: 'token', text: 'an agentic workforce ' },
        { type: 'token', text: 'that cut errors 30%.' },
        { type: 'done' },
      ]),
    );

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: 'What has Jose done with agentic AI?' }));

    // Tokens accumulate into the full answer.
    await screen.findByText('Jose built an agentic workforce that cut errors 30%.');
    expect(screen.getByText('What has Jose done with agentic AI?')).toBeInTheDocument();
    expect(screen.getByText('MojoTech — Data and AI Architect (2026)')).toBeInTheDocument();
    // Hit the streaming endpoint.
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/chat\/stream$/);
  });

  it('submits a typed question via the form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      sseResponse([{ type: 'token', text: 'Answer text.' }, { type: 'done' }]),
    );
    render(<AiChat />);

    fireEvent.change(screen.getByLabelText(/Ask about Jose/i), { target: { value: 'What tools?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await screen.findByText('Answer text.');
    expect(screen.getByText('What tools?')).toBeInTheDocument();
  });

  it('shows an error bubble when the backend returns a non-OK response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'The AI assistant is not configured.' }),
    });

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: /biggest measurable results/i }));

    await screen.findByText('The AI assistant is not configured.');
  });

  it('shows a network-error message when the fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: /real-time \/ IoT work/i }));

    await screen.findByText(/Could not reach the AI service/i);
  });
});

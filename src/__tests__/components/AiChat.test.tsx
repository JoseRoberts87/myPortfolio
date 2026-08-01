import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom doesn't provide TextEncoder/TextDecoder; the SSE reader/decoder needs them.
Object.assign(global, { TextEncoder, TextDecoder });

// The mount-time health probe (#210) would consume the per-test fetch mocks;
// default it to 'online' here — offline behavior is covered in AiOffline.test.
jest.mock('@/hooks/useAiHealth', () => ({ useAiHealth: () => 'online' }));

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

  it('discloses that the bot speaks about Jose, not for him (#180)', () => {
    render(<AiChat />);
    expect(
      screen.getByText(/doesn't speak for him, and can make mistakes/i),
    ).toBeInTheDocument();
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

    // Production copy (no dev-only "port 8000" hint outside development).
    await screen.findByText(/The assistant is temporarily unavailable/i);
  });

  it('beacons the real error and surfaces its cause when the request throws', async () => {
    const fetchMock = global.fetch as jest.Mock;
    // 1st call = the stream request (throws); later calls = the diagnostic beacon.
    fetchMock
      .mockRejectedValueOnce(new TypeError('Load failed'))
      .mockResolvedValue({ ok: true, status: 204 });

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: /real-time \/ IoT work/i }));

    // The technical cause is shown on-screen (so a mobile screenshot reveals it).
    await screen.findByText(/TypeError: Load failed \(at fetch\)/i);

    // And a diagnostic was POSTed to the client-error endpoint.
    const beacon = fetchMock.mock.calls.find((c) =>
      String(c[0]).includes('/api/v1/ai/client-error'),
    );
    expect(beacon).toBeTruthy();
    const body = JSON.parse(beacon![1].body as string);
    expect(body.component).toBe('ai-chat');
    expect(body.stage).toBe('fetch');
    expect(body.name).toBe('TypeError');
  });

  it('prefers the error-middleware envelope message over the generic fallback (#209)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: { message: 'The assistant has reached today\'s usage limit and is resting.' },
      }),
    });

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: /biggest measurable results/i }));

    await screen.findByText(/reached today's usage limit/i);
  });

  it('keeps partial output with a notice when the stream dies mid-answer (#211)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      sseResponse([
        { type: 'token', text: 'Jose has 15+ years' },
        { type: 'error', detail: 'upstream died' },
      ]),
    );

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: /biggest measurable results/i }));

    // The streamed text survives, with a non-destructive notice — not an error bubble.
    await screen.findByText('Jose has 15+ years');
    expect(screen.getByText(/answer above may be incomplete/i)).toBeInTheDocument();
    expect(screen.queryByText(/upstream died/)).not.toBeInTheDocument();
  });

  it('offers Try again on an error bubble and resends the same question (#211)', async () => {
    const fetchMock = global.fetch as jest.Mock;
    // Route by URL: the failure triggers a diagnostic beacon (#208) between the
    // two chat requests, which must not consume the retry's queued response.
    const chatResponses: unknown[] = [
      { ok: false, json: async () => ({ detail: 'busy' }) },
      sseResponse([{ type: 'token', text: 'Recovered.' }]),
    ];
    fetchMock.mockImplementation((url: string) =>
      String(url).includes('/client-error')
        ? Promise.resolve({ ok: true, status: 204 })
        : Promise.resolve(chatResponses.shift()),
    );

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: /biggest measurable results/i }));
    await screen.findByText('busy');

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('Recovered.');
    // Same question was resent (comparing only the chat-stream calls).
    const chatCalls = fetchMock.mock.calls.filter((c) =>
      String(c[0]).includes('/chat/stream'),
    );
    expect(chatCalls).toHaveLength(2);
    expect(JSON.parse(chatCalls[1][1].body).question).toBe(
      JSON.parse(chatCalls[0][1].body).question,
    );
  });
});

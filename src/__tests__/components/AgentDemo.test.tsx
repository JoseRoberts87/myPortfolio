import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom doesn't provide TextEncoder/TextDecoder; the SSE reader/decoder needs them.
Object.assign(global, { TextEncoder, TextDecoder });

import AgentDemo from '@/components/AgentDemo';

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

// A full successful agent run as its stream of events (issue #171).
const okRunStream = (
  answer: string,
  steps: Array<{ tool: string; arguments: Record<string, unknown>; result: string }> = [],
) =>
  sseResponse([
    { type: 'model', model: 'llama3.2' },
    ...steps.map((s) => ({ type: 'step', ...s })),
    { type: 'answer', text: answer },
    { type: 'done', tokens_used: 128, steps: steps.length },
  ]);

describe('AgentDemo (streaming)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the empty state with suggested questions', () => {
    render(<AgentDemo />);
    expect(screen.getByText(/watch the agent decide which tools to call/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'How many years of experience does Jose have in total?' }),
    ).toBeInTheDocument();
  });

  it('renders the streamed tool-call trace and the final answer', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      okRunStream('Jose has 15+ years of experience.', [
        { tool: 'get_current_date', arguments: {}, result: '2026-07-30' },
        { tool: 'calculate', arguments: { expression: '2026 - 2011' }, result: '15.0' },
      ]),
    );

    render(<AgentDemo />);
    fireEvent.click(
      screen.getByRole('button', { name: 'How many years of experience does Jose have in total?' }),
    );

    // Final grounded answer.
    await screen.findByText('Jose has 15+ years of experience.');
    // The trace renders each streamed step with its arguments.
    expect(screen.getByText('Checked the date')).toBeInTheDocument();
    expect(screen.getByText('Ran a calculation')).toBeInTheDocument();
    expect(screen.getByText(/calculate\(expression: 2026 - 2011\)/)).toBeInTheDocument();
    // Tool results are shown.
    expect(screen.getByText(/→ 15\.0/)).toBeInTheDocument();
    // Footer summarizes the run.
    expect(screen.getByText(/2 tool calls · llama3\.2 · 128 tokens/)).toBeInTheDocument();
    // The POST hit the streaming agent endpoint.
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/agent\/stream$/);
  });

  it('submits a typed question via the form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(okRunStream('Done.', []));
    render(<AgentDemo />);

    fireEvent.change(screen.getByLabelText(/Ask the tool-using agent/i), {
      target: { value: 'What tools do you have?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run' }));

    await screen.findByText('Done.');
    expect(screen.getByText('What tools do you have?')).toBeInTheDocument();
  });

  it('shows an error bubble when the backend returns an error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'The AI agent is not configured.' }),
    });

    render(<AgentDemo />);
    fireEvent.click(screen.getByRole('button', { name: /Bank of America/i }));

    await screen.findByText('The AI agent is not configured.');
  });

  it('renders a mid-stream error event as an error bubble', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      sseResponse([
        { type: 'model', model: 'llama3.2' },
        { type: 'error', detail: 'The AI agent is temporarily unavailable.' },
      ]),
    );

    render(<AgentDemo />);
    fireEvent.click(screen.getByRole('button', { name: /Very Technology/i }));

    await screen.findByText('The AI agent is temporarily unavailable.');
  });

  it('shows a network-error message when the fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    render(<AgentDemo />);
    fireEvent.click(screen.getByRole('button', { name: /Amazon Robotics and Evonik/i }));

    await screen.findByText(/Could not reach the agent/i);
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentDemo from '@/components/AgentDemo';

// jsdom lacks Element.prototype.scrollTo (used by the auto-scroll effect).
beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

const okRun = (
  answer: string,
  steps: Array<{ tool: string; arguments: Record<string, unknown>; result: string }> = [],
) => ({
  ok: true,
  json: async () => ({ answer, steps, model: 'llama3.2', tokens_used: 128 }),
});

describe('AgentDemo', () => {
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

  it('renders the tool-call trace and the final answer', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      okRun('Jose has 15+ years of experience.', [
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
    // The trace renders each tool call with its arguments.
    expect(screen.getByText('Checked the date')).toBeInTheDocument();
    expect(screen.getByText('Ran a calculation')).toBeInTheDocument();
    expect(screen.getByText(/calculate\(expression: 2026 - 2011\)/)).toBeInTheDocument();
    // Tool results are shown.
    expect(screen.getByText(/→ 15\.0/)).toBeInTheDocument();
    // Footer summarizes the run.
    expect(screen.getByText(/2 tool calls · llama3\.2 · 128 tokens/)).toBeInTheDocument();
    // The POST hit the agent endpoint.
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/agent$/);
  });

  it('submits a typed question via the form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(okRun('Done.', []));
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

  it('shows a network-error message when the fetch throws', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    render(<AgentDemo />);
    fireEvent.click(screen.getByRole('button', { name: /Amazon Robotics and Evonik/i }));

    await screen.findByText(/Could not reach the agent/i);
  });
});

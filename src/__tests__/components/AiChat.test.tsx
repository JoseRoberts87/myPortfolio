import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AiChat from '@/components/AiChat';

// jsdom lacks Element.prototype.scrollTo (used by the auto-scroll effect).
beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

const okAnswer = (answer: string, sources: Array<{ id: string; title: string; score: number }> = []) => ({
  ok: true,
  json: async () => ({ answer, sources, model: 'llama3.2', tokens_used: 42 }),
});

describe('AiChat', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the empty state with suggested questions', () => {
    render(<AiChat />);
    expect(screen.getByText(/Ask anything about Jose/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'What has Jose done with agentic AI?' })).toBeInTheDocument();
  });

  it('sends a suggested question and renders the grounded answer + sources', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      okAnswer('Jose built an agentic workforce that cut errors 30%.', [
        { id: 'mojotech', title: 'MojoTech — Data and AI Architect (2026)', score: 0.71 },
      ]),
    );

    render(<AiChat />);
    fireEvent.click(screen.getByRole('button', { name: 'What has Jose done with agentic AI?' }));

    // The user's question and the assistant's grounded answer both render.
    await screen.findByText(/agentic workforce that cut errors/i);
    expect(screen.getByText('What has Jose done with agentic AI?')).toBeInTheDocument();
    // Cited source chip.
    expect(screen.getByText('MojoTech — Data and AI Architect (2026)')).toBeInTheDocument();
    // The POST hit the chat endpoint.
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/chat$/);
  });

  it('submits a typed question via the form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(okAnswer('Answer text.'));
    render(<AiChat />);

    fireEvent.change(screen.getByLabelText(/Ask about Jose/i), { target: { value: 'What tools?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await screen.findByText('Answer text.');
    expect(screen.getByText('What tools?')).toBeInTheDocument();
  });

  it('shows an error bubble when the backend returns an error', async () => {
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

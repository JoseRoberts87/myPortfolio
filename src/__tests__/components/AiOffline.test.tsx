/**
 * Health-gated offline states for the AI demos (issue #210): when the backend
 * probe fails or reports unconfigured, each demo renders a designed offline
 * panel — contact CTA + labeled sample — instead of a dead input.
 *
 * Uses the REAL useAiHealth hook (unlike the per-component suites, which mock
 * it to 'online'), so the probe cache must be reset between tests.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import AiChat from '@/components/AiChat';
import AgentDemo from '@/components/AgentDemo';
import ContentGenerator from '@/components/ContentGenerator';
import { __resetAiHealthProbe } from '@/hooks/useAiHealth';

// jsdom lacks Element.prototype.scrollTo (used by the auto-scroll effects).
beforeAll(() => {
  Element.prototype.scrollTo = jest.fn();
});

beforeEach(() => {
  __resetAiHealthProbe();
  global.fetch = jest.fn();
});
afterEach(() => {
  jest.restoreAllMocks();
});

const unreachable = () =>
  (global.fetch as jest.Mock).mockRejectedValue(new TypeError('Load failed'));

const unconfigured = () =>
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ configured: false }),
  });

const healthy = () =>
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ configured: true }),
  });

describe('AI demos offline state (#210)', () => {
  it('AiChat shows the offline panel with a sample when the backend is unreachable', async () => {
    unreachable();
    render(<AiChat />);

    await screen.findByText(/The assistant is offline right now/i);
    expect(screen.getByRole('link', { name: /contact form/i })).toHaveAttribute(
      'href',
      '/#contact',
    );
    expect(screen.getByText(/Sample conversation/i)).toBeInTheDocument();
    // No live input is offered.
    expect(screen.queryByPlaceholderText(/Ask about Jose/i)).not.toBeInTheDocument();
  });

  it('AgentDemo shows the offline panel when health reports unconfigured', async () => {
    unconfigured();
    render(<AgentDemo />);

    await screen.findByText(/The agent is offline right now/i);
    expect(screen.queryByPlaceholderText(/needs a tool/i)).not.toBeInTheDocument();
  });

  it('ContentGenerator shows the offline panel when the backend is unreachable', async () => {
    unreachable();
    render(<ContentGenerator />);

    await screen.findByText(/The generator is offline right now/i);
    expect(screen.queryByRole('button', { name: 'Generate' })).not.toBeInTheDocument();
  });

  it('a healthy probe keeps the live UI (no offline panel)', async () => {
    healthy();
    render(<AiChat />);

    // The live input renders and stays after the probe resolves.
    expect(screen.getByPlaceholderText(/Ask about Jose/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/Ask about Jose/i)).toBeInTheDocument();
    expect(screen.queryByText(/offline right now/i)).not.toBeInTheDocument();
  });

  it('one probe is shared across all three demos (module-level cache)', async () => {
    healthy();
    render(
      <>
        <AiChat />
        <AgentDemo />
        <ContentGenerator />
      </>,
    );
    await screen.findByPlaceholderText(/Ask about Jose/i);

    const healthCalls = (global.fetch as jest.Mock).mock.calls.filter((c) =>
      String(c[0]).includes('/api/v1/ai/health'),
    );
    expect(healthCalls).toHaveLength(1);
  });
});

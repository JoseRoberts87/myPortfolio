/**
 * Homepage hero positioning (#190): outcome-first headline, credibility line,
 * a primary CTA that leads to featured work, and the resume still one click
 * away. Locks the acceptance criteria so future copy edits keep the intent.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// This suite targets the hero only — stub the heavy section components (some
// need ResizeObserver/layout that jsdom lacks) so the render stays synchronous.
jest.mock('@/components/VisitStats', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ImpactMetrics', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/SkillsMatrix', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Timeline', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/Certifications', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ResumeDownload', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/ContactForm', () => ({ __esModule: true, default: () => null }));

import Home from '@/app/page';

// The page mounts VisitStats, which beacons/fetches on load.
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  });
});
afterEach(() => jest.restoreAllMocks());

describe('homepage hero (#190)', () => {
  it('keeps identity: name as the h1 and the architect role line', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { level: 1, name: 'Jose Roberts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Data & AI Architect/ })).toBeInTheDocument();
  });

  it('leads with a business outcome, not a technology list', () => {
    render(<Home />);
    expect(
      screen.getByText(/replace manual workflows and turn data into decisions/i),
    ).toBeInTheDocument();
  });

  it('backs the outcome with real, cited results and credentials', () => {
    render(<Home />);
    const support = screen.getByText(/15\+ years across finance/i);
    // The two strongest case-study results anchor the claim.
    expect(support).toHaveTextContent(/72%/);
    expect(support).toHaveTextContent(/\$2M/);
    expect(support).toHaveTextContent(/Databricks-certified/);
  });

  it('points the primary CTA at the case studies', () => {
    render(<Home />);
    const cta = screen.getByRole('link', { name: 'See the Case Studies' });
    expect(cta).toHaveAttribute('href', '/case-studies');
  });

  it('keeps the resume download visible in the hero', () => {
    render(<Home />);
    const resume = screen.getByRole('link', { name: /Download Resume/i });
    expect(resume).toHaveAttribute('href', '/Jose-Roberts-Resume.pdf');
    expect(resume).toHaveAttribute('download');
  });

  describe('featured case studies (#199)', () => {
    it('features the three studies with the strongest documented outcomes', () => {
      render(<Home />);
      expect(screen.getByText('Agentic AI Workforce')).toBeInTheDocument();
      expect(screen.getByText('Real-Time IoT Data Platform')).toBeInTheDocument();
      expect(screen.getByText('ML Energy Forecasting')).toBeInTheDocument();
    });

    it('leads every featured card with an Impact line', () => {
      render(<Home />);
      expect(screen.getAllByText('Impact:')).toHaveLength(3);
      // Outcome claims come straight from the case-study data (single source
      // of truth), e.g. the IoT study's downtime reduction.
      expect(screen.getByText(/83% less equipment downtime/i)).toBeInTheDocument();
    });
  });
});

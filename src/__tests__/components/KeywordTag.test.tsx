import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KeywordTag } from '@/components/NLP';
import type { Keyword } from '@/types/api';

const makeKeyword = (overrides: Partial<Keyword> = {}): Keyword => ({
  id: 1,
  article_id: 10,
  keyword: 'machine learning',
  score: 0.42,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('KeywordTag', () => {
  it('renders the keyword text', () => {
    render(<KeywordTag keyword={makeKeyword()} />);
    expect(screen.getByText('machine learning')).toBeInTheDocument();
  });

  it('varies color intensity by TF-IDF score', () => {
    render(
      <>
        <KeywordTag keyword={makeKeyword({ keyword: 'neural networks', score: 0.5 })} />
        <KeywordTag keyword={makeKeyword({ id: 2, keyword: 'the', score: 0.05 })} />
      </>
    );

    // Both variants render their text.
    expect(screen.getByText('neural networks')).toBeInTheDocument();
    expect(screen.getByText('the')).toBeInTheDocument();

    // A high-relevance keyword must be styled differently from a low-relevance
    // one (the TF-IDF score drives the emphasis). Assert the two differ rather
    // than pinning exact color/weight tokens.
    const highBadge = screen.getByText('neural networks').parentElement as HTMLElement;
    const lowBadge = screen.getByText('the').parentElement as HTMLElement;
    expect(highBadge.className).not.toBe(lowBadge.className);
  });

  it('renders the formatted score only when showScore is set', () => {
    const { rerender } = render(<KeywordTag keyword={makeKeyword({ score: 0.42 })} />);
    // Score hidden by default.
    expect(screen.queryByText('0.420')).not.toBeInTheDocument();

    rerender(<KeywordTag keyword={makeKeyword({ score: 0.42 })} showScore />);
    // TF-IDF score is formatted to 3 decimal places.
    expect(screen.getByText('0.420')).toBeInTheDocument();
  });

  it('exposes the keyword and score in the title tooltip', () => {
    render(<KeywordTag keyword={makeKeyword({ keyword: 'data pipeline', score: 0.311 })} />);
    const badge = screen.getByText('data pipeline').parentElement as HTMLElement;
    const title = badge.getAttribute('title') ?? '';
    expect(title).toContain('data pipeline');
    expect(title).toContain('0.311');
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EntityBadge } from '@/components/NLP';
import type { Entity } from '@/types/api';

const makeEntity = (overrides: Partial<Entity> = {}): Entity => ({
  id: 1,
  article_id: 10,
  entity_type: 'PERSON',
  entity_text: 'Barack Obama',
  start_char: 0,
  end_char: 12,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('EntityBadge', () => {
  it('renders the entity text', () => {
    render(<EntityBadge entity={makeEntity()} />);
    expect(screen.getByText('Barack Obama')).toBeInTheDocument();
  });

  it('color-codes the badge differently per entity type', () => {
    render(
      <>
        <EntityBadge entity={makeEntity({ entity_type: 'PERSON', entity_text: 'Barack Obama' })} />
        <EntityBadge
          entity={makeEntity({ id: 2, entity_type: 'ORG', entity_text: 'Acme Corp' })}
        />
      </>
    );

    // Both variants render their text.
    expect(screen.getByText('Barack Obama')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    // Styling is driven by entity_type: PERSON is blue, ORG is purple.
    const personBadge = screen.getByTitle('Person: Barack Obama');
    const orgBadge = screen.getByTitle('Organization: Acme Corp');
    expect(personBadge).toHaveClass('bg-blue-600/20', 'text-blue-400');
    expect(orgBadge).toHaveClass('bg-purple-600/20', 'text-purple-400');
    expect(personBadge).not.toHaveClass('bg-purple-600/20');
  });

  it('shows the human-readable type label when showType is set', () => {
    render(<EntityBadge entity={makeEntity({ entity_type: 'GPE', entity_text: 'France' })} showType />);
    // GPE maps to the human label "Location".
    expect(screen.getByText('Location:')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('falls back to neutral styling and the raw type for unknown entity types', () => {
    render(<EntityBadge entity={makeEntity({ entity_type: 'MADE_UP', entity_text: 'Widget' })} />);
    const badge = screen.getByTitle('MADE_UP: Widget');
    expect(badge).toHaveClass('bg-gray-600/20', 'text-gray-400');
  });

  it('applies the shared base badge styles and a descriptive title tooltip', () => {
    render(<EntityBadge entity={makeEntity()} />);
    const badge = screen.getByTitle('Person: Barack Obama');
    expect(badge).toHaveClass('inline-flex', 'rounded-md', 'border');
  });
});

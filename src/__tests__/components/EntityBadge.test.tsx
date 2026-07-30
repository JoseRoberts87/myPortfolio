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

    // The entity type drives the styling: two different types must produce
    // different classes (the color encodes the type). Assert they differ rather
    // than pinning exact color tokens.
    const personBadge = screen.getByTitle('Person: Barack Obama');
    const orgBadge = screen.getByTitle('Organization: Acme Corp');
    expect(personBadge.className).not.toBe(orgBadge.className);
  });

  it('shows the human-readable type label when showType is set', () => {
    render(<EntityBadge entity={makeEntity({ entity_type: 'GPE', entity_text: 'France' })} showType />);
    // GPE maps to the human label "Location".
    expect(screen.getByText('Location:')).toBeInTheDocument();
    expect(screen.getByText('France')).toBeInTheDocument();
  });

  it('falls back to the raw type label and distinct styling for unknown entity types', () => {
    render(
      <>
        <EntityBadge entity={makeEntity({ entity_type: 'MADE_UP', entity_text: 'Widget' })} />
        <EntityBadge entity={makeEntity({ id: 2, entity_type: 'PERSON', entity_text: 'Ada' })} />
      </>
    );

    // Unknown types have no human label, so the tooltip keeps the raw type.
    const unknownBadge = screen.getByTitle('MADE_UP: Widget');
    expect(unknownBadge).toBeInTheDocument();

    // ...and they render with different styling than a known (PERSON) type.
    const personBadge = screen.getByTitle('Person: Ada');
    expect(unknownBadge.className).not.toBe(personBadge.className);
  });

  it('exposes a descriptive title tooltip combining the type label and text', () => {
    render(<EntityBadge entity={makeEntity()} />);
    // The tooltip is "<human label>: <entity text>".
    expect(screen.getByTitle('Person: Barack Obama')).toBeInTheDocument();
  });
});

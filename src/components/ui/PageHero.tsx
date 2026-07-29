import { ReactNode } from 'react';
import Section from './Section';
import Badge from './Badge';

interface PageHeroProps {
  /** Optional small accent kicker rendered above the title (e.g. a section label). */
  eyebrow?: string;
  /** Main page heading (renders the page's single <h1>). */
  title: string;
  /** Supporting subtitle beneath the title. */
  tagline?: ReactNode;
  /** Convenience: renders a centered row of primary Badges below the tagline. */
  badges?: string[];
  /** Extra supporting content (controls, stat rows) rendered below the tagline/badges. */
  children?: ReactNode;
}

/**
 * Standard hero used across all feature pages: a `subtle` Section with a centered
 * eyebrow / title / tagline, plus an optional badges row and a custom slot. A fixed
 * min-height with vertically-centered content keeps every hero the same size
 * regardless of how much content it carries (sparse title+tagline pages match the
 * fuller badge/control pages).
 *
 * Consolidates the previously copy-pasted hero blocks so spacing, sizing, and
 * colors stay consistent in one place (see CHANGELOG / issue #81). Page wrappers
 * keep their own `min-h-screen pt-16` container.
 */
export default function PageHero({ eyebrow, title, tagline, badges, children }: PageHeroProps) {
  return (
    <Section padding="none" background="subtle">
      <div className="flex min-h-[360px] flex-col justify-center py-16 text-center">
        {eyebrow && (
          <p className="text-accent text-sm font-semibold uppercase tracking-wider mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {title}
        </h1>
        {tagline && (
          <p className="text-xl text-muted max-w-3xl mx-auto">
            {tagline}
          </p>
        )}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {badges.map((badge) => (
              <Badge key={badge} variant="primary">
                {badge}
              </Badge>
            ))}
          </div>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </Section>
  );
}

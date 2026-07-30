/**
 * Automated accessibility audit (issue #87).
 *
 * Runs axe-core against the shared, user-facing components and asserts a few
 * concrete a11y guarantees the manual audit fixed: a skip link, associated form
 * labels, and labelled icon-only controls. Color-contrast is a layout-dependent
 * rule that axe skips under jsdom, so contrast was verified separately against
 * the purple/slate design tokens.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import ThemeToggle from '@/components/ThemeToggle';
import LayoutContent from '@/components/LayoutContent';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { ThemeProvider } from '@/contexts/ThemeContext';

expect.extend(toHaveNoViolations);

// Header uses usePathname(); give it a stable route.
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

global.fetch = jest.fn();

const withTheme = (ui: React.ReactElement) => <ThemeProvider>{ui}</ThemeProvider>;

describe('accessibility (axe)', () => {
  it('Header has no detectable violations', async () => {
    const { container } = render(withTheme(<Header />));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Footer has no detectable violations', async () => {
    const { container } = render(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ContactForm has no detectable violations', async () => {
    const { container } = render(<ContactForm />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ThemeToggle has no detectable violations', async () => {
    const { container } = render(withTheme(<ThemeToggle />));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Button has no detectable violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Input (with label + error) has no detectable violations', async () => {
    const { container } = render(
      <Input label="Full name" error="Name is required" fullWidth />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Textarea (with label + helper text) has no detectable violations', async () => {
    const { container } = render(
      <Textarea label="Message" helperText="Max 500 characters" fullWidth />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('specific a11y guarantees', () => {
  it('LayoutContent renders a skip link that targets the main landmark', () => {
    render(
      withTheme(
        <LayoutContent>
          <p>Page body</p>
        </LayoutContent>
      )
    );
    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveAttribute('href', '#main-content');

    const main = document.getElementById('main-content');
    expect(main?.tagName).toBe('MAIN');
    // Focusable target so the skip link can move focus into the content.
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('Input associates its label with the control via htmlFor/id', () => {
    render(<Input label="Email address" />);
    // getByLabelText only resolves when the label is programmatically linked.
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  });

  it('Input links its error text and marks the field invalid', () => {
    render(<Input label="Email address" error="Invalid email" />);
    const input = screen.getByLabelText('Email address');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Invalid email');
  });

  it('Textarea associates its label with the control via htmlFor/id', () => {
    render(<Textarea label="Your message" />);
    expect(screen.getByLabelText('Your message')).toBeInTheDocument();
  });

  it('ThemeToggle exposes an accessible name for the icon-only button', () => {
    render(withTheme(<ThemeToggle />));
    expect(
      screen.getByRole('button', { name: /switch to (dark|light) mode/i })
    ).toBeInTheDocument();
  });

  it('Header mobile menu toggle is a labelled control tied to its menu', () => {
    render(withTheme(<Header />));
    const toggle = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(toggle).toHaveAttribute('aria-controls', 'mobile-menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

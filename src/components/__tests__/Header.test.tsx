import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Header uses usePathname() for active-link state; provide a stable value.
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe('Header Component', () => {
  it('renders the brand name linking home', () => {
    renderWithTheme(<Header />);
    const brand = screen.getByRole('link', { name: 'Jose Roberts' });
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute('href', '/');
  });

  it('renders primary nav links with correct hrefs', () => {
    renderWithTheme(<Header />);
    expect(screen.getByRole('link', { name: 'AI Chat' })).toHaveAttribute('href', '/ai-agents');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/#timeline');
  });

  it('renders the "Let\'s talk" CTA linking to the contact section', () => {
    renderWithTheme(<Header />);
    expect(screen.getByRole('link', { name: /let's talk/i })).toHaveAttribute('href', '/#contact');
  });

  it('reveals the Work dropdown items only after the Work button is clicked', () => {
    renderWithTheme(<Header />);
    const workButton = screen.getByRole('button', { name: 'Work' });
    expect(workButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Web Development' })).not.toBeInTheDocument();

    fireEvent.click(workButton);

    expect(workButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Web Development' })).toHaveAttribute('href', '/web-dev');
    expect(screen.getByRole('link', { name: 'Cloud & DevOps' })).toHaveAttribute('href', '/cloud-devops');
  });

  it('toggles the mobile drawer via the menu button', () => {
    renderWithTheme(<Header />);
    const menuButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    // Work items live only in the (unrendered) desktop dropdown + mobile drawer.
    expect(screen.queryByRole('link', { name: 'Machine Learning' })).not.toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Machine Learning' })).toHaveAttribute('href', '/machine-learning');

    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Machine Learning' })).not.toBeInTheDocument();
  });

  it('applies fixed positioning and backdrop blur to the banner', () => {
    renderWithTheme(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
    expect(header).toHaveClass('backdrop-blur-sm');
  });
});

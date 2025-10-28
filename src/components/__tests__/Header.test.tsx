import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Header Component', () => {
  it('renders the logo/brand name', () => {
    renderWithTheme(<Header />);
    const logo = screen.getByText('Portfolio');
    expect(logo).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderWithTheme(<Header />);

    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Web Development').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Data Pipelines').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Analytics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Machine Learning').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Computer Vision').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cloud & DevOps').length).toBeGreaterThan(0);
  });

  it('has correct href attributes for navigation links', () => {
    renderWithTheme(<Header />);

    const homeLink = screen.getAllByRole('link', { name: 'Home' })[0];
    expect(homeLink).toHaveAttribute('href', '/');

    const webDevLink = screen.getAllByRole('link', { name: 'Web Development' })[0];
    expect(webDevLink).toHaveAttribute('href', '/web-dev');
  });

  it('displays desktop navigation on larger screens', () => {
    renderWithTheme(<Header />);

    // Desktop navigation should be present - find the desktop nav container
    const desktopNavLinks = screen.getAllByRole('link', { name: 'Home' });
    const desktopNavContainer = desktopNavLinks[0].closest('div')?.parentElement;
    expect(desktopNavContainer).toHaveClass('hidden', 'md:flex');
  });

  it('toggles mobile menu when hamburger button is clicked', () => {
    renderWithTheme(<Header />);

    // Find the hamburger button
    const menuButton = screen.getByRole('button', { name: /open main menu/i });

    // Find the mobile menu container (the div with conditional hidden class)
    // It's the parent of the inner div with the links
    const mobileNavInner = screen.getAllByText('Home')[1].closest('div');
    const mobileNav = mobileNavInner?.parentElement;

    // Initially, mobile menu should be hidden
    expect(mobileNav).toHaveClass('hidden');

    // Click the button to open menu
    fireEvent.click(menuButton);

    // Mobile menu should now be visible (no longer have hidden class)
    expect(mobileNav).not.toHaveClass('hidden');
    expect(mobileNav).toHaveClass('block');

    // Click again to close
    fireEvent.click(menuButton);

    // Mobile menu should be hidden again
    expect(mobileNav).toHaveClass('hidden');
  });

  it('closes mobile menu when a navigation link is clicked', () => {
    renderWithTheme(<Header />);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(menuButton);

    // Click a mobile menu link
    const mobileHomeLink = screen.getAllByRole('link', { name: 'Home' })[1];
    fireEvent.click(mobileHomeLink);

    // Mobile menu should be closed - find the outer container
    const mobileNavInner = screen.getAllByText('Home')[1].closest('div');
    const mobileNav = mobileNavInner?.parentElement;
    expect(mobileNav).toHaveClass('hidden');
  });

  it('has proper ARIA attributes for accessibility', () => {
    renderWithTheme(<Header />);

    const menuButton = screen.getByRole('button', { name: /open main menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Open menu
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies fixed positioning and backdrop blur styles', () => {
    renderWithTheme(<Header />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed', 'top-0', 'left-0', 'right-0');
    expect(header).toHaveClass('backdrop-blur-sm');
  });

  it('shows close icon when menu is open', () => {
    renderWithTheme(<Header />);

    const menuButton = screen.getByRole('button', { name: /open main menu/i });

    // Get the SVG icons
    const hamburgerIcon = menuButton.querySelector('svg:not(.hidden)');
    const closeIcon = menuButton.querySelector('svg.hidden');

    expect(hamburgerIcon).not.toHaveClass('hidden');
    expect(closeIcon).toHaveClass('hidden');

    // Click to open menu
    fireEvent.click(menuButton);

    // Icons should swap
    const hamburgerIconAfter = menuButton.querySelector('svg.hidden');
    const closeIconAfter = menuButton.querySelector('svg:not(.hidden)');

    expect(hamburgerIconAfter).toHaveClass('hidden');
    expect(closeIconAfter).not.toHaveClass('hidden');
  });
});

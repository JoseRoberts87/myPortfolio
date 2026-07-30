import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GitHubProfile from '@/components/GitHub/GitHubProfile';
import type { GitHubUser } from '@/types/github';

const baseUser: GitHubUser = {
  login: 'JoseRoberts87',
  id: 123456,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
  html_url: 'https://github.com/JoseRoberts87',
  name: 'Jose Roberts',
  company: '@Hasbro',
  blog: 'https://therpiproject.com',
  location: 'Providence, RI',
  email: null,
  bio: 'Data & AI Architect building full-stack systems',
  public_repos: 42,
  public_gists: 5,
  followers: 1200,
  following: 88,
  created_at: '2015-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('GitHubProfile', () => {
  it('renders the display name, username handle and bio', () => {
    render(<GitHubProfile user={baseUser} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Jose Roberts' })
    ).toBeInTheDocument();
    expect(screen.getByText('@JoseRoberts87')).toBeInTheDocument();
    expect(
      screen.getByText('Data & AI Architect building full-stack systems')
    ).toBeInTheDocument();
  });

  it('renders location, company and blog metadata', () => {
    render(<GitHubProfile user={baseUser} />);

    expect(screen.getByText('Providence, RI')).toBeInTheDocument();
    expect(screen.getByText('@Hasbro')).toBeInTheDocument();
    expect(screen.getByText('https://therpiproject.com')).toBeInTheDocument();
  });

  it('renders formatted repo/follower/following counts with labels', () => {
    render(<GitHubProfile user={baseUser} />);

    expect(screen.getByText('42')).toBeInTheDocument(); // public_repos
    expect(screen.getByText('1,200')).toBeInTheDocument(); // followers, formatNumber
    expect(screen.getByText('88')).toBeInTheDocument(); // following

    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('links to the GitHub profile and renders an avatar image', () => {
    render(<GitHubProfile user={baseUser} />);

    const viewLink = screen.getByRole('link', { name: 'View on GitHub' });
    expect(viewLink).toHaveAttribute('href', 'https://github.com/JoseRoberts87');
    expect(viewLink).toHaveAttribute('target', '_blank');

    // next/image renders an <img> with the user's name as alt text
    expect(screen.getByRole('img', { name: 'Jose Roberts' })).toBeInTheDocument();
  });

  it('falls back to the login and hides optional fields when data is missing', () => {
    const minimalUser: GitHubUser = {
      ...baseUser,
      name: null,
      bio: null,
      location: null,
      company: null,
      blog: '',
    };

    render(<GitHubProfile user={minimalUser} />);

    // Heading falls back to the login when name is null
    expect(
      screen.getByRole('heading', { level: 2, name: 'JoseRoberts87' })
    ).toBeInTheDocument();
    // Optional fields are not rendered
    expect(
      screen.queryByText('Data & AI Architect building full-stack systems')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Providence, RI')).not.toBeInTheDocument();
    expect(screen.queryByText('@Hasbro')).not.toBeInTheDocument();
  });
});

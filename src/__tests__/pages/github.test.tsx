/**
 * Integration tests for the GitHub page (src/app/github/page.tsx).
 *
 * The page delegates all data fetching to the `useGitHub` hook and switches
 * between loading / error / content states, composing the GitHubProfile / Stats /
 * Repos / Activity / Languages / Contributions children (each unit-tested
 * separately). These tests mock the hook to drive each state and assert the
 * page-level composition (section headings + CTAs) plus that the hook's data
 * flows down into the children.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import type {
  GitHubUser,
  GitHubRepo,
  GitHubEvent,
  GitHubStats,
  LanguageStat,
} from '@/types/github';

// Control the page's data source: mock the hook so we can drive every UI state.
jest.mock('@/hooks/useGitHub', () => ({ useGitHub: jest.fn() }));
import { useGitHub } from '@/hooks/useGitHub';
const mockUseGitHub = useGitHub as jest.Mock;

// GitHubLanguages renders a recharts PieChart, which relies on ResizeObserver /
// layout that jsdom does not provide. Stub the primitives (house style, matches
// GitHubLanguages.test / SkillsMatrix.test) so the render stays synchronous and
// free of act() warnings.
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  Legend: () => <div />,
  Tooltip: () => <div />,
}));

// Import the page AFTER the mocks above are registered.
import GitHubPage from '@/app/github/page';

// Mirror the page's own username resolution so link `href` assertions are
// deterministic regardless of the test env's .env files.
const USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'JoseRoberts87';

// --- Content fixture (shapes from src/types/github.ts) --------------------

const user: GitHubUser = {
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

const repos: GitHubRepo[] = [
  {
    id: 1,
    name: 'awesome-project',
    full_name: 'JoseRoberts87/awesome-project',
    html_url: 'https://github.com/JoseRoberts87/awesome-project',
    description: 'A flagship full-stack portfolio application',
    fork: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    pushed_at: '2026-07-20T00:00:00Z',
    homepage: 'https://therpiproject.com',
    size: 2048,
    stargazers_count: 128,
    watchers_count: 130,
    language: 'Python',
    forks_count: 24,
    open_issues_count: 3,
    topics: ['nextjs', 'fastapi'],
    visibility: 'public',
    default_branch: 'main',
  },
  {
    id: 2,
    name: 'data-pipeline',
    full_name: 'JoseRoberts87/data-pipeline',
    html_url: 'https://github.com/JoseRoberts87/data-pipeline',
    description: 'Automated ingestion and processing pipeline',
    fork: false,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    pushed_at: '2026-06-15T00:00:00Z',
    homepage: null,
    size: 1024,
    stargazers_count: 64,
    watchers_count: 70,
    language: 'JavaScript',
    forks_count: 12,
    open_issues_count: 1,
    topics: ['etl'],
    visibility: 'public',
    default_branch: 'main',
  },
  {
    id: 3,
    name: 'ml-toolkit',
    full_name: 'JoseRoberts87/ml-toolkit',
    html_url: 'https://github.com/JoseRoberts87/ml-toolkit',
    description: null,
    fork: false,
    created_at: '2022-03-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    pushed_at: '2026-05-10T00:00:00Z',
    homepage: null,
    size: 512,
    stargazers_count: 32,
    watchers_count: 40,
    language: 'Go',
    forks_count: 6,
    open_issues_count: 0,
    topics: [],
    visibility: 'public',
    default_branch: 'main',
  },
];

const events: GitHubEvent[] = [
  {
    id: 'evt-1',
    type: 'PushEvent',
    actor: {
      id: 123456,
      login: 'JoseRoberts87',
      avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
    },
    repo: { id: 1, name: 'JoseRoberts87/awesome-project', url: 'https://api.github.com/repos/JoseRoberts87/awesome-project' },
    payload: {
      push_id: 999,
      size: 2,
      commits: [{ sha: 'abc1234', message: 'Add integration tests for the GitHub page' }],
    },
    public: true,
    created_at: '2026-07-25T00:00:00Z',
  },
  {
    id: 'evt-2',
    type: 'PullRequestEvent',
    actor: {
      id: 123456,
      login: 'JoseRoberts87',
      avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
    },
    repo: { id: 2, name: 'JoseRoberts87/data-pipeline', url: 'https://api.github.com/repos/JoseRoberts87/data-pipeline' },
    payload: {
      action: 'opened',
      pull_request: { title: 'Improve the caching layer', number: 7 },
    },
    public: true,
    created_at: '2026-07-24T00:00:00Z',
  },
];

const languages: LanguageStat[] = [
  { name: 'TypeScript', bytes: 500000, percentage: 50, color: '#3178c6' },
  { name: 'Rust', bytes: 300000, percentage: 30, color: '#dea584' },
  { name: 'Elixir', bytes: 200000, percentage: 20, color: '#6e4a7e' },
];

const stats: GitHubStats = {
  totalRepos: 42,
  totalStars: 1567,
  totalForks: 210,
  totalWatchers: 340,
  languageStats: [],
  accountAge: 11,
};

// Base state matching the hook's initial shape (loading, nothing loaded yet).
const base = {
  user: null,
  repos: [],
  events: [],
  stats: null,
  languages: [],
  loading: true,
  error: null,
  refetch: jest.fn(),
};

// Fully-loaded content state.
const content = {
  ...base,
  user,
  repos,
  events,
  stats,
  languages,
  loading: false,
  error: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GitHubPage', () => {
  // The hero lives outside the loading/error/content conditionals, so it must
  // render in every state.
  it.each([
    ['loading', () => ({ ...base, loading: true })],
    ['error', () => ({ ...base, loading: false, error: 'API rate limit exceeded' })],
    ['content', () => content],
  ])('renders the "GitHub Activity" hero in the %s state', (_label, getState) => {
    mockUseGitHub.mockReturnValue(getState());
    render(<GitHubPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'GitHub Activity' })
    ).toBeInTheDocument();
  });

  it('shows the loading indicator while data is loading', () => {
    mockUseGitHub.mockReturnValue({ ...base, loading: true });
    const { container } = render(<GitHubPage />);

    expect(screen.getByText('Loading GitHub data...')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();

    // Error + content states are hidden while loading.
    expect(
      screen.queryByRole('heading', { name: 'Error Loading GitHub Data' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'GitHub Statistics' })
    ).not.toBeInTheDocument();
  });

  it('renders the error UI with the message plus retry / View on GitHub affordances', () => {
    mockUseGitHub.mockReturnValue({
      ...base,
      loading: false,
      error: 'API rate limit exceeded',
    });
    render(<GitHubPage />);

    expect(
      screen.getByRole('heading', { name: 'Error Loading GitHub Data' })
    ).toBeInTheDocument();
    expect(screen.getByText('API rate limit exceeded')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();

    const viewOnGitHub = screen.getByRole('link', { name: 'View on GitHub' });
    expect(viewOnGitHub).toHaveAttribute('href', `https://github.com/${USERNAME}`);
    expect(viewOnGitHub).toHaveAttribute('target', '_blank');
    expect(viewOnGitHub).toHaveAttribute('rel', 'noopener noreferrer');

    // Success content is not rendered in the error state.
    expect(
      screen.queryByRole('heading', { name: 'GitHub Statistics' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Loading GitHub data...')).not.toBeInTheDocument();
  });

  it('calls refetch when the "Try Again" button is clicked', () => {
    const refetch = jest.fn();
    mockUseGitHub.mockReturnValue({
      ...base,
      loading: false,
      error: 'API rate limit exceeded',
      refetch,
    });
    render(<GitHubPage />);

    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders the composed sections and flows hook data into the children', () => {
    mockUseGitHub.mockReturnValue(content);
    render(<GitHubPage />);

    // Page-level section headings (the page composes children beneath these).
    expect(
      screen.getByRole('heading', { name: 'GitHub Statistics' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Repositories' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Activity & Languages' })
    ).toBeInTheDocument();

    // Call to action.
    expect(
      screen.getByRole('heading', { name: 'Want to see more?' })
    ).toBeInTheDocument();
    const ctaLink = screen.getByRole('link', { name: /View Full GitHub Profile/i });
    expect(ctaLink).toHaveAttribute('href', `https://github.com/${USERNAME}`);
    expect(screen.getByRole('button', { name: /Refresh Data/i })).toBeInTheDocument();

    // Data flows into GitHubProfile.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Jose Roberts' })
    ).toBeInTheDocument();
    expect(screen.getByText('@JoseRoberts87')).toBeInTheDocument();

    // ...into GitHubStats (totalStars = 1567 -> "1,567").
    expect(screen.getByText('Total Stars')).toBeInTheDocument();
    expect(screen.getByText('1,567')).toBeInTheDocument();

    // ...into GitHubRepos (repo title link with its html_url).
    const repoLink = screen.getByRole('link', { name: 'awesome-project' });
    expect(repoLink).toHaveAttribute(
      'href',
      'https://github.com/JoseRoberts87/awesome-project'
    );

    // ...into GitHubActivity (event description derived from the PushEvent).
    expect(
      screen.getByRole('heading', { name: 'Recent Activity' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pushed 2 commits to JoseRoberts87\/awesome-project/)
    ).toBeInTheDocument();

    // ...into GitHubLanguages (recharts stubbed; assert list content).
    expect(
      screen.getByRole('heading', { name: 'Language Distribution' })
    ).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();

    // ...into GitHubContributions.
    expect(
      screen.getByRole('heading', { name: 'Contribution Activity' })
    ).toBeInTheDocument();

    // Loading / error states are not shown once content is ready.
    expect(screen.queryByText('Loading GitHub data...')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Error Loading GitHub Data' })
    ).not.toBeInTheDocument();
  });
});

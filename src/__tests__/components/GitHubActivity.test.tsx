import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GitHubActivity from '@/components/GitHub/GitHubActivity';
import type { GitHubEvent } from '@/types/github';

const actor = {
  id: 1,
  login: 'JoseRoberts87',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
};

const events: GitHubEvent[] = [
  {
    id: '1',
    type: 'PushEvent',
    actor,
    repo: { id: 10, name: 'JoseRoberts87/portfolio', url: 'https://api.github.com/repos/JoseRoberts87/portfolio' },
    payload: { size: 3, commits: [{ sha: 'abc123', message: 'Add GitHub component tests' }] },
    public: true,
    created_at: '2026-07-20T00:00:00Z',
  },
  {
    id: '2',
    type: 'PullRequestEvent',
    actor,
    repo: { id: 11, name: 'JoseRoberts87/api', url: 'https://api.github.com/repos/JoseRoberts87/api' },
    payload: { action: 'opened', pull_request: { title: 'Improve response caching', number: 42 } },
    public: true,
    created_at: '2026-07-19T00:00:00Z',
  },
  {
    id: '3',
    type: 'IssuesEvent',
    actor,
    repo: { id: 12, name: 'JoseRoberts87/backend', url: 'https://api.github.com/repos/JoseRoberts87/backend' },
    payload: { action: 'closed', issue: { title: 'Fix flaky health check', number: 7 } },
    public: true,
    created_at: '2026-07-18T00:00:00Z',
  },
  {
    id: '4',
    type: 'WatchEvent',
    actor,
    repo: { id: 13, name: 'facebook/react', url: 'https://api.github.com/repos/facebook/react' },
    payload: {},
    public: true,
    created_at: '2026-07-17T00:00:00Z',
  },
  {
    id: '5',
    type: 'PushEvent',
    actor,
    repo: { id: 14, name: 'JoseRoberts87/dotfiles', url: 'https://api.github.com/repos/JoseRoberts87/dotfiles' },
    payload: { size: 1 },
    public: true,
    created_at: '2026-07-16T00:00:00Z',
  },
];

describe('GitHubActivity', () => {
  it('renders an empty-state message when there are no events', () => {
    render(<GitHubActivity events={[]} />);

    expect(screen.getByText(/No recent activity found/i)).toBeInTheDocument();
  });

  it('renders the heading and a push event with its commit message', () => {
    render(<GitHubActivity events={events} />);

    expect(
      screen.getByRole('heading', { name: /Recent Activity/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pushed 3 commits to JoseRoberts87/portfolio')
    ).toBeInTheDocument();
    expect(screen.getByText(/Add GitHub component tests/)).toBeInTheDocument();
  });

  it('renders pull request and issue events with their titles', () => {
    render(<GitHubActivity events={events} />);

    expect(
      screen.getByText('Opened pull request #42 in JoseRoberts87/api')
    ).toBeInTheDocument();
    expect(screen.getByText(/Improve response caching/)).toBeInTheDocument();

    expect(
      screen.getByText('Closed issue #7 in JoseRoberts87/backend')
    ).toBeInTheDocument();
    expect(screen.getByText(/Fix flaky health check/)).toBeInTheDocument();
  });

  it('renders watch events and singular push copy, and links to repos', () => {
    render(<GitHubActivity events={events} />);

    expect(screen.getByText('Starred facebook/react')).toBeInTheDocument();
    // size === 1 uses the singular "commit"
    expect(
      screen.getByText('Pushed 1 commit to JoseRoberts87/dotfiles')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'JoseRoberts87/portfolio' })
    ).toHaveAttribute('href', 'https://github.com/JoseRoberts87/portfolio');
  });
});

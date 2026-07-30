import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GitHubRepos from '@/components/GitHub/GitHubRepos';
import type { GitHubRepo } from '@/types/github';

function makeRepo(overrides: Partial<GitHubRepo> & { id: number; name: string }): GitHubRepo {
  return {
    full_name: `JoseRoberts87/${overrides.name}`,
    html_url: `https://github.com/JoseRoberts87/${overrides.name}`,
    description: 'A repository',
    fork: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    pushed_at: '2024-06-01T00:00:00Z',
    homepage: null,
    size: 1000,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'TypeScript',
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
    visibility: 'public',
    default_branch: 'main',
    ...overrides,
  };
}

const repos: GitHubRepo[] = [
  makeRepo({
    id: 1,
    name: 'awesome-project',
    description: 'An awesome TypeScript project',
    language: 'TypeScript',
    stargazers_count: 150,
    forks_count: 12,
    watchers_count: 20,
  }),
  makeRepo({
    id: 2,
    name: 'data-pipeline',
    description: null,
    language: 'Python',
    stargazers_count: 80,
    forks_count: 5,
    watchers_count: 8,
  }),
  makeRepo({
    id: 3,
    name: 'forked-lib',
    description: 'A forked library',
    language: 'Go',
    fork: true,
    stargazers_count: 999,
    forks_count: 1,
    watchers_count: 2,
  }),
];

describe('GitHubRepos', () => {
  it('renders non-forked repo names, descriptions and language badges', () => {
    render(<GitHubRepos repos={repos} />);

    expect(screen.getByText('awesome-project')).toBeInTheDocument();
    expect(screen.getByText('data-pipeline')).toBeInTheDocument();
    expect(screen.getByText('An awesome TypeScript project')).toBeInTheDocument();
    // Null description falls back to placeholder copy
    expect(screen.getByText('No description provided')).toBeInTheDocument();
    // Language badges
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('renders formatted star, fork and watcher counts', () => {
    render(<GitHubRepos repos={repos} />);

    expect(screen.getByText('150')).toBeInTheDocument(); // stars
    expect(screen.getByText('12')).toBeInTheDocument(); // forks
    expect(screen.getByText('20')).toBeInTheDocument(); // watchers
  });

  it('hides forked repos by default and reveals them when toggled', () => {
    render(<GitHubRepos repos={repos} />);

    // Fork is filtered out by default
    expect(screen.queryByText('forked-lib')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', { name: /show forked repos/i }));

    expect(screen.getByText('forked-lib')).toBeInTheDocument();
  });

  it('respects the limit prop and sorts by stars by default', () => {
    const many: GitHubRepo[] = [
      makeRepo({ id: 10, name: 'top-repo', stargazers_count: 300 }),
      makeRepo({ id: 11, name: 'mid-repo', stargazers_count: 200 }),
      makeRepo({ id: 12, name: 'low-repo', stargazers_count: 100 }),
    ];

    render(<GitHubRepos repos={many} limit={2} />);

    expect(screen.getByText('top-repo')).toBeInTheDocument();
    expect(screen.getByText('mid-repo')).toBeInTheDocument();
    // Truncated by the limit
    expect(screen.queryByText('low-repo')).not.toBeInTheDocument();
    // Exactly two cards rendered
    expect(screen.getAllByText('View Code')).toHaveLength(2);
  });

  it('shows an empty-state message when there are no repos', () => {
    render(<GitHubRepos repos={[]} />);

    expect(
      screen.getByText(/No repositories found matching the current filters/i)
    ).toBeInTheDocument();
  });
});

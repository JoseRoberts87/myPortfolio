import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GitHubStats from '@/components/GitHub/GitHubStats';
import type { GitHubStats as GitHubStatsType } from '@/types/github';

const stats: GitHubStatsType = {
  totalRepos: 42,
  totalStars: 1234,
  totalForks: 88,
  totalWatchers: 500,
  languageStats: [],
  accountAge: 9,
};

describe('GitHubStats', () => {
  it('renders a labelled card for each stat', () => {
    render(<GitHubStats stats={stats} />);

    expect(screen.getByText('Repositories')).toBeInTheDocument();
    expect(screen.getByText('Total Stars')).toBeInTheDocument();
    expect(screen.getByText('Total Forks')).toBeInTheDocument();
    expect(screen.getByText('Years Active')).toBeInTheDocument();
  });

  it('renders formatted stat values', () => {
    render(<GitHubStats stats={stats} />);

    expect(screen.getByText('42')).toBeInTheDocument(); // totalRepos
    expect(screen.getByText('1,234')).toBeInTheDocument(); // totalStars, formatNumber
    expect(screen.getByText('88')).toBeInTheDocument(); // totalForks
  });

  it('renders the account age with a pluralized suffix', () => {
    render(<GitHubStats stats={stats} />);

    expect(screen.getByText('9 years')).toBeInTheDocument();
  });

  it('uses the singular "year" suffix when the account is one year old', () => {
    render(<GitHubStats stats={{ ...stats, accountAge: 1 }} />);

    expect(screen.getByText('1 year')).toBeInTheDocument();
  });

  it('renders zero values gracefully', () => {
    render(
      <GitHubStats
        stats={{
          totalRepos: 0,
          totalStars: 0,
          totalForks: 0,
          totalWatchers: 0,
          languageStats: [],
          accountAge: 0,
        }}
      />
    );

    // Repos, stars and forks each render a standalone "0"
    expect(screen.getAllByText('0')).toHaveLength(3);
    // accountAge 0 still gets the plural suffix
    expect(screen.getByText('0 years')).toBeInTheDocument();
  });
});

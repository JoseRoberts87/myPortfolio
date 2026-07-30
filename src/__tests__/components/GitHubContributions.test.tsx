import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GitHubContributions from '@/components/GitHub/GitHubContributions';

describe('GitHubContributions', () => {
  it('renders the heading and descriptive copy', () => {
    render(<GitHubContributions username="JoseRoberts87" />);

    expect(
      screen.getByRole('heading', { name: /Contribution Activity/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/contribution graph showing activity over the past year/i)
    ).toBeInTheDocument();
  });

  it('renders the contribution image built from the username', () => {
    render(<GitHubContributions username="JoseRoberts87" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://ghchart.rshah.org/JoseRoberts87');
    expect(img).toHaveAttribute('alt', "JoseRoberts87's GitHub contribution graph");
  });

  it('links to the user GitHub profile', () => {
    render(<GitHubContributions username="JoseRoberts87" />);

    expect(
      screen.getByRole('link', { name: /View detailed contribution activity on GitHub/i })
    ).toHaveAttribute('href', 'https://github.com/JoseRoberts87');
  });

  it('renders the Less/More intensity legend', () => {
    render(<GitHubContributions username="JoseRoberts87" />);

    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('rebuilds the image and profile URLs for a different username', () => {
    render(<GitHubContributions username="octocat" />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://ghchart.rshah.org/octocat'
    );
    expect(
      screen.getByRole('link', { name: /View detailed contribution activity on GitHub/i })
    ).toHaveAttribute('href', 'https://github.com/octocat');
  });
});

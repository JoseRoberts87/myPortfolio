/**
 * Unit tests for the useGitHub hook.
 *
 * The hook calls fetchGitHubData(username) on mount, manages the GitHubState
 * shape, and exposes refetch() which clears the cached localStorage entry
 * before fetching again. The GitHub lib is fully mocked so no network or real
 * cache access happens here.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGitHub } from '@/hooks/useGitHub';
import { fetchGitHubData } from '@/lib/github';
import type { GitHubData } from '@/types/github';

// jest.mock is hoisted above the imports at transform time, so the static
// import of fetchGitHubData above resolves to this mock.
jest.mock('@/lib/github', () => ({ fetchGitHubData: jest.fn() }));

const mockFetch = fetchGitHubData as jest.Mock;

const USERNAME = 'JoseRoberts87';

/**
 * Realistic success fixture matching every data field of GitHubState
 * (user, repos[], events[], stats, languages[]) per src/types/github.ts.
 */
function buildFixture(): GitHubData {
  return {
    user: {
      login: USERNAME,
      id: 12345,
      avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      html_url: `https://github.com/${USERNAME}`,
      name: 'Jose Roberts',
      company: '@therpiproject',
      blog: 'https://dev.therpiproject.com',
      location: 'United States',
      email: null,
      bio: 'Full-stack engineer',
      public_repos: 42,
      public_gists: 3,
      followers: 128,
      following: 64,
      created_at: '2015-06-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    repos: [
      {
        id: 987,
        name: 'portfolio',
        full_name: `${USERNAME}/portfolio`,
        html_url: `https://github.com/${USERNAME}/portfolio`,
        description: 'Full-stack portfolio application',
        fork: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-10T00:00:00Z',
        pushed_at: '2024-01-12T00:00:00Z',
        homepage: 'https://dev.therpiproject.com',
        size: 2048,
        stargazers_count: 87,
        watchers_count: 12,
        language: 'TypeScript',
        forks_count: 21,
        open_issues_count: 4,
        topics: ['nextjs', 'fastapi', 'terraform'],
        visibility: 'public',
        default_branch: 'main',
      },
    ],
    events: [
      {
        id: 'evt_1',
        type: 'PushEvent',
        actor: {
          id: 12345,
          login: USERNAME,
          avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        },
        repo: {
          id: 987,
          name: `${USERNAME}/portfolio`,
          url: `https://api.github.com/repos/${USERNAME}/portfolio`,
        },
        payload: {
          push_id: 555,
          size: 2,
          commits: [{ sha: 'abc123', message: 'feat: add hook tests' }],
        },
        public: true,
        created_at: '2024-01-12T00:00:00Z',
      },
    ],
    stats: {
      totalRepos: 42,
      totalStars: 120,
      totalForks: 30,
      totalWatchers: 15,
      languageStats: [
        { name: 'TypeScript', bytes: 90000, percentage: 60, color: '#3178c6' },
        { name: 'Python', bytes: 60000, percentage: 40, color: '#3572A5' },
      ],
      accountAge: 9,
    },
    languages: [
      { name: 'TypeScript', bytes: 90000, percentage: 60, color: '#3178c6' },
      { name: 'Python', bytes: 60000, percentage: 40, color: '#3572A5' },
    ],
  };
}

describe('useGitHub', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
    // Silence the hook's expected console.error on the failure path.
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Self-verify: fail loudly if any React "not wrapped in act(...)" warning
    // was emitted during the test, so the suite guarantees zero act() warnings.
    const actWarning = errorSpy.mock.calls.find((callArgs) =>
      String(callArgs[0] ?? '').includes('not wrapped in act')
    );
    expect(actWarning).toBeUndefined();
    jest.restoreAllMocks();
  });

  it('populates state on a successful fetch', async () => {
    const fixture = buildFixture();
    mockFetch.mockResolvedValue(fixture);

    const { result } = renderHook(() => useGitHub(USERNAME));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(USERNAME);
    expect(result.current.user).toEqual(fixture.user);
    expect(result.current.repos).toEqual(fixture.repos);
    expect(result.current.repos).toHaveLength(1);
    expect(result.current.events).toEqual(fixture.events);
    expect(result.current.stats).toEqual(fixture.stats);
    expect(result.current.languages).toEqual(fixture.languages);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.lastFetched).toBe('number');
  });

  it('captures the error message when the fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useGitHub(USERNAME));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('boom');
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    // The hook logged the failure via console.error (silenced above).
    expect(errorSpy).toHaveBeenCalled();
  });

  it('reports "No username provided" without calling the API when username is empty', async () => {
    const { result } = renderHook(() => useGitHub(''));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('No username provided');
    expect(result.current.loading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('refetch clears the cached entry and fetches again', async () => {
    const fixture = buildFixture();
    mockFetch.mockResolvedValue(fixture);

    const { result } = renderHook(() => useGitHub(USERNAME));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    expect(removeItemSpy).toHaveBeenCalledWith(`github_data_${USERNAME}`);
  });
});

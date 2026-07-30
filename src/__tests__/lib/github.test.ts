/**
 * Tests for the GitHub REST API client (`src/lib/github.ts`).
 *
 * `global.fetch` is replaced with a jest mock in every test and fed
 * GitHub-Response-like objects via the `mockResponse` helper below.
 *
 * localStorage is jsdom's real store, cleared before every test by the shared
 * `jest.setup.ts` — no per-file store install needed.
 */

import {
  formatNumber,
  formatTimeAgo,
  calculateStats,
  getGitHubUser,
  getGitHubRepos,
  getGitHubActivity,
  aggregateLanguageStats,
  fetchGitHubData,
} from '@/lib/github';
import type {
  GitHubUser,
  GitHubRepo,
  GitHubEvent,
  GitHubData,
} from '@/types/github';

// --- Response helper (as specified by the task) ---
const mockResponse = (
  body: unknown,
  opts: { ok?: boolean; status?: number; remaining?: string } = {}
) => ({
  ok: opts.ok ?? true,
  status: opts.status ?? 200,
  headers: {
    get: (h: string) =>
      h === 'X-RateLimit-Remaining' ? (opts.remaining ?? '5000') : null,
  },
  json: async () => body,
});

// --- Type-accurate fixtures (all fields the code may read are present) ---
function makeUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
  return {
    login: 'octocat',
    id: 1,
    avatar_url: 'https://avatars.example/octocat.png',
    html_url: 'https://github.com/octocat',
    name: 'The Octocat',
    company: null,
    blog: '',
    location: null,
    email: null,
    bio: null,
    public_repos: 42,
    public_gists: 0,
    followers: 100,
    following: 10,
    // ~2 years old, derived relative to "now" so no absolute dates are hardcoded
    created_at: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    name: 'repo',
    full_name: 'octocat/repo',
    html_url: 'https://github.com/octocat/repo',
    description: null,
    fork: false,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2021-01-01T00:00:00Z',
    pushed_at: '2021-01-01T00:00:00Z',
    homepage: null,
    size: 100,
    stargazers_count: 0,
    watchers_count: 0,
    language: null,
    forks_count: 0,
    open_issues_count: 0,
    topics: [],
    visibility: 'public',
    default_branch: 'main',
    ...overrides,
  };
}

function makeEvent(overrides: Partial<GitHubEvent> = {}): GitHubEvent {
  return {
    id: 'e1',
    type: 'PushEvent',
    actor: { id: 1, login: 'octocat', avatar_url: '' },
    repo: { id: 1, name: 'octocat/repo', url: '' },
    payload: {},
    public: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn();
  // localStorage is cleared by the shared jest.setup beforeEach.
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('formatNumber', () => {
  it('formats large numbers with thousands separators', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });

  it('formats zero as "0"', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatTimeAgo', () => {
  it('formats a 2-hour-old date as "2 hours ago"', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('2 hours ago');
  });

  it('uses the singular unit for a 1-day-old date', () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatTimeAgo(oneDayAgo)).toBe('1 day ago');
  });

  it('returns "just now" for dates under a minute old', () => {
    const fiveSecondsAgo = new Date(Date.now() - 5 * 1000).toISOString();
    expect(formatTimeAgo(fiveSecondsAgo)).toBe('just now');
  });
});

describe('calculateStats', () => {
  it('sums stars/forks/watchers and derives repo count and account age', () => {
    const user = makeUser({ public_repos: 7 });
    const repos = [
      makeRepo({ stargazers_count: 10, forks_count: 2, watchers_count: 3 }),
      makeRepo({ stargazers_count: 5, forks_count: 1, watchers_count: 4 }),
    ];

    const stats = calculateStats(user, repos);

    expect(stats.totalStars).toBe(15);
    expect(stats.totalForks).toBe(3);
    expect(stats.totalWatchers).toBe(7);
    expect(stats.totalRepos).toBe(user.public_repos);
    expect(typeof stats.accountAge).toBe('number');
    expect(stats.accountAge).toBeGreaterThanOrEqual(0);
    // A ~2-year-old account rounds down to exactly 2 whole years.
    expect(stats.accountAge).toBe(2);
  });
});

describe('getGitHubUser', () => {
  it('fetches the user and calls the correct users endpoint', async () => {
    const user = makeUser();
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(user));

    const result = await getGitHubUser('octocat');

    expect(result).toEqual(user);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://api.github.com/users/octocat'
    );
  });
});

describe('getGitHubRepos', () => {
  it('filters out forks by default and builds a sorted, paginated URL', async () => {
    const repos = [
      makeRepo({ id: 1, name: 'a', fork: false }),
      makeRepo({ id: 2, name: 'b', fork: true }),
      makeRepo({ id: 3, name: 'c', fork: false }),
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(repos));

    const result = await getGitHubRepos('octocat');

    expect(result).toHaveLength(2);
    expect(result.every((r) => !r.fork)).toBe(true);

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain('sort=');
    expect(url).toContain('per_page=');
  });

  it('keeps forks when includeForks is true', async () => {
    const repos = [
      makeRepo({ id: 1, name: 'a', fork: false }),
      makeRepo({ id: 2, name: 'b', fork: true }),
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(repos));

    const result = await getGitHubRepos('octocat', { includeForks: true });

    expect(result).toHaveLength(2);
  });

  it('applies the limit by slicing the result set', async () => {
    const repos = [
      makeRepo({ id: 1, name: 'a' }),
      makeRepo({ id: 2, name: 'b' }),
      makeRepo({ id: 3, name: 'c' }),
    ];
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(repos));

    const result = await getGitHubRepos('octocat', { limit: 1 });

    expect(result).toHaveLength(1);
  });
});

describe('getGitHubActivity', () => {
  it('returns only the 10 most recent events', async () => {
    const events = Array.from({ length: 15 }, (_, i) =>
      makeEvent({ id: `e${i}` })
    );
    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse(events));

    const result = await getGitHubActivity('octocat');

    expect(result).toHaveLength(10);
  });
});

describe('fetchGitHub error handling (via getGitHubUser)', () => {
  it('rejects with a "not found" error on 404', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({}, { ok: false, status: 404 })
    );

    await expect(getGitHubUser('ghost')).rejects.toThrow(/not found/i);
  });

  it('rejects with a "rate limit" error on 429', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({}, { ok: false, status: 429 })
    );

    await expect(getGitHubUser('octocat')).rejects.toThrow(/rate limit/i);
  });

  it('surfaces the API-provided message on other error statuses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse({ message: 'boom' }, { ok: false, status: 500 })
    );

    await expect(getGitHubUser('octocat')).rejects.toThrow(/boom/);
  });

  it('warns when the remaining rate limit is low', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce(
      mockResponse(makeUser(), { remaining: '3' })
    );

    await getGitHubUser('octocat');

    expect(console.warn as jest.Mock).toHaveBeenCalledWith(
      expect.stringContaining('rate limit low')
    );
  });
});

describe('aggregateLanguageStats', () => {
  it('aggregates languages into sorted stats with colors and percentages', async () => {
    const repos = [makeRepo({ name: 'ts-heavy' }), makeRepo({ name: 'mixed' })];
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse({ TypeScript: 100 }))
      .mockResolvedValueOnce(mockResponse({ TypeScript: 50, CSS: 50 }));

    const result = await aggregateLanguageStats('octocat', repos);

    expect(result).toHaveLength(2);
    // Sorted by bytes descending: TypeScript (100 + 50 = 150) first.
    expect(result[0]).toMatchObject({
      name: 'TypeScript',
      bytes: 150,
      color: '#3178c6',
    });
    expect(result[1]).toMatchObject({ name: 'CSS', bytes: 50, color: '#563d7c' });
    expect(result[0].bytes).toBeGreaterThan(result[1].bytes);
    // Percentages: 150/200 = 75%, 50/200 = 25% -> sum to ~100.
    expect(result[0].percentage).toBeCloseTo(75);
    expect(result[0].percentage + result[1].percentage).toBeCloseTo(100);
  });
});

describe('fetchGitHubData', () => {
  it('returns cached data without calling fetch on a cache hit', async () => {
    const cachedData: GitHubData = {
      user: makeUser(),
      repos: [makeRepo({ name: 'cached' })],
      events: [makeEvent()],
      stats: {
        totalRepos: 42,
        totalStars: 1,
        totalForks: 0,
        totalWatchers: 0,
        languageStats: [],
        accountAge: 2,
      },
      languages: [
        { name: 'TypeScript', bytes: 100, percentage: 100, color: '#3178c6' },
      ],
    };
    localStorage.setItem(
      'github_data_octocat',
      JSON.stringify({ data: cachedData, timestamp: Date.now(), username: 'octocat' })
    );

    const result = await fetchGitHubData('octocat');

    expect(result).toEqual(cachedData);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches, composes GitHubData, and writes the cache on a cache miss', async () => {
    const user = makeUser({ public_repos: 2 });
    const repos = [
      makeRepo({ id: 1, name: 'alpha' }),
      makeRepo({ id: 2, name: 'beta' }),
    ];
    const events = [
      makeEvent({ id: 'e1' }),
      makeEvent({ id: 'e2' }),
      makeEvent({ id: 'e3' }),
    ];

    // Ordered responses: user, repos, events, then one language call per repo.
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(mockResponse(user)) // getGitHubUser
      .mockResolvedValueOnce(mockResponse(repos)) // getGitHubRepos
      .mockResolvedValueOnce(mockResponse(events)) // getGitHubActivity
      .mockResolvedValueOnce(mockResponse({ TypeScript: 100 })) // languages: alpha
      .mockResolvedValueOnce(mockResponse({ TypeScript: 50, CSS: 50 })); // languages: beta

    const result = await fetchGitHubData('octocat');

    expect(result.user).toEqual(user);
    expect(result.repos).toHaveLength(2);
    expect(result.events).toHaveLength(3);
    expect(result.stats?.totalRepos).toBe(user.public_repos);
    expect(result.languages.map((l) => l.name)).toEqual(['TypeScript', 'CSS']);

    // The cache should now be populated for this username.
    const written = localStorage.getItem('github_data_octocat');
    expect(written).not.toBeNull();
    expect(JSON.parse(written as string).data.user.login).toBe('octocat');
  });
});

/**
 * GitHub API Service
 * Functions for fetching data from GitHub REST API v3
 */

import type {
  GitHubUser,
  GitHubRepo,
  GitHubEvent,
  GitHubLanguages,
  GitHubStats,
  GitHubCache,
  GitHubData,
  LanguageStat,
  RepoFilterOptions,
} from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_KEY_PREFIX = 'github_data';
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Language colors (common programming languages)
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Jupyter: '#DA5B0B',
  Default: '#6e7681',
};

/**
 * Get cached GitHub data from localStorage
 */
function getCachedData(username: string): GitHubCache | null {
  try {
    const key = `${CACHE_KEY_PREFIX}_${username}`;
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const parsedCache: GitHubCache = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - parsedCache.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return parsedCache;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

/**
 * Save GitHub data to localStorage cache
 */
function setCachedData(username: string, data: GitHubData): void {
  try {
    const key = `${CACHE_KEY_PREFIX}_${username}`;
    const cache: GitHubCache = {
      data,
      timestamp: Date.now(),
      username,
    };

    localStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

/**
 * Fetch with error handling and rate limit detection
 */
async function fetchGitHub<T>(endpoint: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;

  // Get GitHub token from environment variable (optional but recommended to avoid rate limits)
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
    });

    // Check rate limit
    const remaining = response.headers.get('X-RateLimit-Remaining');
    if (remaining && parseInt(remaining) < 10) {
      console.warn(`GitHub API rate limit low: ${remaining} requests remaining`);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      }

      if (response.status === 404) {
        throw new Error('GitHub user or resource not found.');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch from GitHub API');
  }
}

/**
 * Fetch user profile data
 */
export async function getGitHubUser(username: string): Promise<GitHubUser> {
  return fetchGitHub<GitHubUser>(`/users/${username}`);
}

/**
 * Fetch user repositories
 */
export async function getGitHubRepos(
  username: string,
  options: Partial<RepoFilterOptions> = {}
): Promise<GitHubRepo[]> {
  const { sort = 'updated', includeForks = false, limit } = options;

  // GitHub API allows max 100 per page
  const perPage = limit && limit <= 100 ? limit : 100;

  const repos = await fetchGitHub<GitHubRepo[]>(
    `/users/${username}/repos?sort=${sort}&per_page=${perPage}&direction=desc`
  );

  // Filter out forks if needed
  let filteredRepos = includeForks ? repos : repos.filter(repo => !repo.fork);

  // Apply limit if specified
  if (limit) {
    filteredRepos = filteredRepos.slice(0, limit);
  }

  return filteredRepos;
}

/**
 * Fetch user's public events (recent activity)
 */
export async function getGitHubActivity(username: string): Promise<GitHubEvent[]> {
  const events = await fetchGitHub<GitHubEvent[]>(
    `/users/${username}/events/public?per_page=30`
  );

  // Return last 10 events
  return events.slice(0, 10);
}

/**
 * Fetch languages for a specific repository
 */
export async function getRepoLanguages(
  username: string,
  repoName: string
): Promise<GitHubLanguages> {
  return fetchGitHub<GitHubLanguages>(`/repos/${username}/${repoName}/languages`);
}

/**
 * Aggregate language statistics across all repos
 */
export async function aggregateLanguageStats(
  username: string,
  repos: GitHubRepo[]
): Promise<LanguageStat[]> {
  const languageTotals: Record<string, number> = {};

  // Fetch languages for each repo (in parallel, but in batches to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);

    const languagePromises = batch.map(async (repo) => {
      try {
        const languages = await getRepoLanguages(username, repo.name);
        return languages;
      } catch (error) {
        console.error(`Failed to fetch languages for ${repo.name}:`, error);
        return {};
      }
    });

    const batchResults = await Promise.all(languagePromises);

    // Aggregate totals
    batchResults.forEach((languages) => {
      Object.entries(languages).forEach(([lang, bytes]) => {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      });
    });
  }

  // Calculate total bytes
  const totalBytes = Object.values(languageTotals).reduce((sum, bytes) => sum + bytes, 0);

  // Convert to array with percentages and colors
  const languageStats: LanguageStat[] = Object.entries(languageTotals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: (bytes / totalBytes) * 100,
      color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Default,
    }))
    .sort((a, b) => b.bytes - a.bytes); // Sort by bytes descending

  // Return top 7 languages
  return languageStats.slice(0, 7);
}

/**
 * Calculate aggregated statistics
 */
export function calculateStats(user: GitHubUser, repos: GitHubRepo[]): GitHubStats {
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalWatchers = repos.reduce((sum, repo) => sum + repo.watchers_count, 0);

  // Calculate account age in years
  const createdDate = new Date(user.created_at);
  const now = new Date();
  const accountAge = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

  return {
    totalRepos: user.public_repos,
    totalStars,
    totalForks,
    totalWatchers,
    languageStats: [], // Will be filled in later
    accountAge,
  };
}

/**
 * Fetch all GitHub data for a user
 * This is the main function to get all data at once
 */
export async function fetchGitHubData(username: string): Promise<GitHubData> {
  // Check cache first
  const cached = getCachedData(username);
  if (cached) {
    console.log('Using cached GitHub data');
    return cached.data;
  }

  console.log('Fetching fresh GitHub data...');

  // Fetch user and repos in parallel
  const [user, repos] = await Promise.all([
    getGitHubUser(username),
    getGitHubRepos(username, { limit: 100, includeForks: false }),
  ]);

  // Fetch events
  const events = await getGitHubActivity(username);

  // Calculate basic stats
  const stats = calculateStats(user, repos);

  // Fetch language stats (this can be slow, so we do it after getting basic data)
  const languageStats = await aggregateLanguageStats(username, repos);
  stats.languageStats = languageStats;

  const data: GitHubData = {
    user,
    repos,
    events,
    stats,
    languages: languageStats,
  };

  // Cache the data
  setCachedData(username, data);

  return data;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
}

/**
 * Format number with commas (e.g., 1000 -> "1,000")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

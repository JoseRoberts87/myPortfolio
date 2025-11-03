// GitHub API response types

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  visibility: string;
  default_branch: string;
}

export interface GitHubLanguages {
  [language: string]: number; // Language name -> bytes of code
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    push_id?: number;
    size?: number;
    commits?: Array<{
      sha: string;
      message: string;
    }>;
    pull_request?: {
      title: string;
      number: number;
    };
    issue?: {
      title: string;
      number: number;
    };
  };
  public: boolean;
  created_at: string;
}

// Aggregated statistics
export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  languageStats: LanguageStat[];
  accountAge: number; // Years active
}

export interface LanguageStat {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

// Repo sort options
export type RepoSortOption = 'stars' | 'updated' | 'forks' | 'name';

// Repo filter options
export interface RepoFilterOptions {
  sort: RepoSortOption;
  includeForks: boolean;
  limit?: number;
}

// GitHub data state
export interface GitHubData {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  stats: GitHubStats | null;
  languages: LanguageStat[];
}

// GitHub hook state
export interface GitHubState extends GitHubData {
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// Cache structure
export interface GitHubCache {
  data: GitHubData;
  timestamp: number;
  username: string;
}

// API error response
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  status?: number;
}

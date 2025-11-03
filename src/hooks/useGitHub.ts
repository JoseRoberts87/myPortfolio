'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchGitHubData } from '@/lib/github';
import type { GitHubState } from '@/types/github';

/**
 * Custom hook for fetching and managing GitHub data
 * Includes caching, error handling, and loading states
 */
export function useGitHub(username: string) {
  const [state, setState] = useState<GitHubState>({
    user: null,
    repos: [],
    events: [],
    stats: null,
    languages: [],
    loading: true,
    error: null,
    lastFetched: null,
  });

  /**
   * Fetch GitHub data
   */
  const fetchData = useCallback(async () => {
    if (!username) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'No username provided',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchGitHubData(username);

      setState({
        ...data,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });
    } catch (error) {
      console.error('Error fetching GitHub data:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to fetch GitHub data';

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [username]);

  /**
   * Refetch data (force refresh)
   */
  const refetch = useCallback(() => {
    // Clear cache
    const cacheKey = `github_data_${username}`;
    localStorage.removeItem(cacheKey);

    // Fetch fresh data
    fetchData();
  }, [username, fetchData]);

  /**
   * Fetch data on mount and when username changes
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
}

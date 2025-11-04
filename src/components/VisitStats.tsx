'use client';

import { useEffect, useState } from 'react';

interface ReferrerStat {
  referrer: string;
  count: number;
}

interface PageStat {
  page: string;
  count: number;
}

interface VisitStatsData {
  total_visits: number;
  unique_visitors: number;
  recent_visits: number;
  top_referrers: ReferrerStat[];
  visits_by_page: PageStat[];
}

export default function VisitStats() {
  const [stats, setStats] = useState<VisitStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${baseUrl}/api/v1/visits/stats`);

        if (!response.ok) {
          throw new Error('Failed to fetch visit statistics');
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching visit stats:', err);
        setError('Unable to load stats');
      } finally {
        setLoading(false);
      }
    };

    // Track current visit
    const trackVisit = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${baseUrl}/api/v1/visits/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_url: window.location.href,
            referrer: document.referrer || null,
          }),
        });
      } catch (err) {
        console.error('Error tracking visit:', err);
      }
    };

    trackVisit();
    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg min-w-[200px]">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-400 font-medium">Live Stats</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">{stats.total_visits.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Total Visits</p>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold text-purple-400">{stats.unique_visitors.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Visitors</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Last 24h</span>
            <span className="text-sm font-semibold text-green-400">{stats.recent_visits.toLocaleString()}</span>
          </div>
        </div>

        {stats.top_referrers && stats.top_referrers.length > 0 && (
          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-gray-400 mb-1">Top Referrer</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-400 truncate max-w-[140px]">
                {new URL(stats.top_referrers[0].referrer).hostname}
              </span>
              <span className="text-xs text-gray-400">{stats.top_referrers[0].count}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

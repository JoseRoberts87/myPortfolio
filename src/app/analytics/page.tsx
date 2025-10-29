'use client';

import { useState, useEffect } from 'react';
import { Section, Card, Badge } from '@/components/ui';
import { getAnalyticsOverview } from '@/lib/api';
import type { AnalyticsOverview } from '@/types/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#10b981',
  neutral: '#eab308',
  negative: '#ef4444',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await getAnalyticsOverview(timeRange);
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  const sentimentTotals = data?.sentiment_trends.reduce(
    (acc, day) => ({
      positive: acc.positive + day.positive,
      neutral: acc.neutral + day.neutral,
      negative: acc.negative + day.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 }
  );

  const sentimentPieData = sentimentTotals
    ? [
        { name: 'Positive', value: sentimentTotals.positive, color: SENTIMENT_COLORS.positive },
        { name: 'Neutral', value: sentimentTotals.neutral, color: SENTIMENT_COLORS.neutral },
        { name: 'Negative', value: sentimentTotals.negative, color: SENTIMENT_COLORS.negative },
      ]
    : [];

  return (
    <div className="min-h-screen pt-16">
      <Section padding="xl" background="subtle">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Comprehensive analytics and insights from Reddit data pipeline
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-400">Time Range:</span>
            {[7, 14, 30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>
      </Section>

      {loading && !data ? (
        <Section padding="lg">
          <div className="text-center py-12 text-gray-400">Loading analytics...</div>
        </Section>
      ) : error ? (
        <Section padding="lg">
          <Card variant="bordered" padding="lg">
            <div className="text-center py-12">
              <Badge variant="error" size="lg" className="mb-4">
                Error
              </Badge>
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadAnalytics}
                className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </Card>
        </Section>
      ) : data ? (
        <>
          {data.engagement_metrics && (
            <Section padding="lg">
              <h2 className="text-2xl font-bold mb-6">Engagement Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card variant="bordered" padding="lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {data.engagement_metrics.avg_score.toFixed(0)}
                    </div>
                    <div className="text-gray-400 mt-1 text-sm">Avg Score</div>
                  </div>
                </Card>
                <Card variant="bordered" padding="lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {data.engagement_metrics.max_score}
                    </div>
                    <div className="text-gray-400 mt-1 text-sm">Max Score</div>
                  </div>
                </Card>
                <Card variant="bordered" padding="lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {data.engagement_metrics.avg_comments.toFixed(1)}
                    </div>
                    <div className="text-gray-400 mt-1 text-sm">Avg Comments</div>
                  </div>
                </Card>
                <Card variant="bordered" padding="lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">
                      {data.engagement_metrics.max_comments}
                    </div>
                    <div className="text-gray-400 mt-1 text-sm">Max Comments</div>
                  </div>
                </Card>
                <Card variant="bordered" padding="lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">
                      {(data.engagement_metrics.avg_upvote_ratio * 100).toFixed(0)}%
                    </div>
                    <div className="text-gray-400 mt-1 text-sm">Upvote Ratio</div>
                  </div>
                </Card>
              </div>
            </Section>
          )}

          <Section padding="lg" background="subtle">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="bordered" padding="lg">
                <h2 className="text-xl font-bold mb-4">Post Volume Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.post_volume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card variant="bordered" padding="lg">
                <h2 className="text-xl font-bold mb-4">Sentiment Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.sentiment_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} dot={{ fill: SENTIMENT_COLORS.positive }} />
                    <Line type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2} dot={{ fill: SENTIMENT_COLORS.neutral }} />
                    <Line type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2} dot={{ fill: SENTIMENT_COLORS.negative }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </Section>

          <Section padding="lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="bordered" padding="lg">
                <h2 className="text-xl font-bold mb-4">Top Subreddits</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.top_subreddits.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="subreddit" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="post_count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card variant="bordered" padding="lg">
                <h2 className="text-xl font-bold mb-4">Sentiment Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </Section>

          <Section padding="lg" background="subtle">
            <Card variant="bordered" padding="lg">
              <h2 className="text-xl font-bold mb-4">Sentiment by Subreddit</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.sentiment_by_subreddit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="subreddit" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} />
                  <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
                  <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Section>

          <Section padding="lg">
            <Card variant="bordered" padding="lg">
              <h2 className="text-xl font-bold mb-4">Subreddit Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400">Subreddit</th>
                      <th className="text-right py-3 px-4 text-gray-400">Posts</th>
                      <th className="text-right py-3 px-4 text-gray-400">Avg Score</th>
                      <th className="text-right py-3 px-4 text-gray-400">Avg Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_subreddits.map((subreddit) => (
                      <tr key={subreddit.subreddit} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-3 px-4">
                          <Badge variant="primary">r/{subreddit.subreddit}</Badge>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {subreddit.post_count}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {subreddit.avg_score}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-300">
                          {subreddit.avg_comments}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Section>
        </>
      ) : null}
    </div>
  );
}

'use client';

import { Card } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { LanguageStat } from '@/types/github';

interface GitHubLanguagesProps {
  languages: LanguageStat[];
}

export default function GitHubLanguages({ languages }: GitHubLanguagesProps) {
  if (languages.length === 0) {
    return (
      <Card variant="bordered" className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No language data available.
        </p>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = languages.map((lang) => ({
    name: lang.name,
    value: lang.percentage,
    color: lang.color,
  }));

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    return `${entry.name} ${entry.value.toFixed(1)}%`;
  };

  return (
    <Card variant="bordered" className="p-6">
      <h3 className="text-xl font-bold mb-4">Language Distribution</h3>

      {/* Pie Chart */}
      <div className="mb-6" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)}%`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Language List */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Top Languages
        </p>
        {languages.map((lang, index) => (
          <div key={lang.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Color Dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: lang.color }}
              />

              {/* Language Name */}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {lang.name}
              </span>
            </div>

            {/* Percentage */}
            <div className="flex items-center gap-3">
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                  }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                {lang.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Languages Note */}
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
        Based on {languages.length} most used language{languages.length !== 1 ? 's' : ''} across all repositories
      </p>
    </Card>
  );
}

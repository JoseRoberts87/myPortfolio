'use client';

import { Keyword } from '@/types/api';
import { HTMLAttributes } from 'react';

interface KeywordTagProps extends HTMLAttributes<HTMLSpanElement> {
  keyword: Keyword;
  size?: 'sm' | 'md';
  showScore?: boolean;
  compact?: boolean;
}

/**
 * Tag component for displaying Keywords with TF-IDF scores
 * Color intensity based on score (higher score = more prominent)
 */
export default function KeywordTag({
  keyword,
  size = 'sm',
  showScore = false,
  compact = false,
  className = '',
  ...props
}: KeywordTagProps) {
  // Get color intensity based on TF-IDF score
  // Typical TF-IDF scores range from 0 to ~0.5-0.8
  const getScoreColorClass = (score: number): string => {
    if (score >= 0.4) {
      return 'bg-indigo-600/30 text-indigo-300 border-indigo-400/40 font-semibold'; // High relevance
    } else if (score >= 0.25) {
      return 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 font-medium'; // Medium-high
    } else if (score >= 0.15) {
      return 'bg-indigo-600/15 text-indigo-400 border-indigo-500/20'; // Medium
    } else {
      return 'bg-indigo-600/10 text-indigo-500 border-indigo-500/15'; // Lower relevance
    }
  };

  const baseStyles = 'inline-flex items-center gap-1 rounded-full border transition-all hover:scale-105';
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const scoreColorClass = getScoreColorClass(keyword.score);

  // Format score for display
  const formattedScore = keyword.score.toFixed(3);

  return (
    <span
      className={`${baseStyles} ${sizeStyles} ${scoreColorClass} ${className}`}
      title={`Keyword: ${keyword.keyword}\nTF-IDF Score: ${formattedScore}\n(Higher score = more relevant to this article)`}
      {...props}
    >
      <span className={compact ? 'truncate max-w-[80px]' : ''}>{keyword.keyword}</span>
      {showScore && (
        <span className="text-[0.75em] opacity-70 font-mono">
          {formattedScore}
        </span>
      )}
    </span>
  );
}

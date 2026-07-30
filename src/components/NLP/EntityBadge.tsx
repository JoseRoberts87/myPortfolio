'use client';

import { Entity } from '@/types/api';
import { HTMLAttributes } from 'react';

interface EntityBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  entity: Entity;
  size?: 'sm' | 'md';
  showType?: boolean;
}

/**
 * Badge component for displaying Named Entities
 * Color-coded by entity type (PERSON, ORG, GPE, etc.)
 */
export default function EntityBadge({
  entity,
  size = 'sm',
  showType = false,
  className = '',
  ...props
}: EntityBadgeProps) {
  // Color mapping for different entity types
  const getEntityTypeStyles = (type: string): string => {
    const typeStyles: Record<string, string> = {
      PERSON: 'bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
      ORG: 'bg-purple-600/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
      GPE: 'bg-green-600/20 text-green-700 dark:text-green-300 border-green-500/30', // Geo-Political Entity
      LOC: 'bg-teal-600/20 text-teal-700 dark:text-teal-300 border-teal-500/30', // Location
      DATE: 'bg-orange-600/20 text-orange-700 dark:text-orange-300 border-orange-500/30',
      TIME: 'bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      MONEY: 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      PERCENT: 'bg-cyan-600/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      PRODUCT: 'bg-pink-600/20 text-pink-700 dark:text-pink-300 border-pink-500/30',
      EVENT: 'bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      WORK_OF_ART: 'bg-rose-600/20 text-rose-700 dark:text-rose-300 border-rose-500/30',
      LAW: 'bg-violet-600/20 text-violet-700 dark:text-violet-300 border-violet-500/30',
      LANGUAGE: 'bg-fuchsia-600/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
      NORP: 'bg-lime-600/20 text-lime-700 dark:text-lime-300 border-lime-500/30', // Nationalities, Religious/Political groups
      FAC: 'bg-sky-600/20 text-sky-700 dark:text-sky-300 border-sky-500/30', // Facilities
      CARDINAL: 'bg-slate-600/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
      ORDINAL: 'bg-zinc-600/20 text-zinc-700 dark:text-zinc-300 border-zinc-500/30',
      QUANTITY: 'bg-stone-600/20 text-stone-700 dark:text-stone-300 border-stone-500/30',
    };

    return typeStyles[type] || 'bg-gray-600/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
  };

  // Get human-readable label for entity type
  const getEntityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      PERSON: 'Person',
      ORG: 'Organization',
      GPE: 'Location',
      LOC: 'Place',
      DATE: 'Date',
      TIME: 'Time',
      MONEY: 'Money',
      PERCENT: 'Percent',
      PRODUCT: 'Product',
      EVENT: 'Event',
      WORK_OF_ART: 'Art',
      LAW: 'Law',
      LANGUAGE: 'Language',
      NORP: 'Group',
      FAC: 'Facility',
      CARDINAL: 'Number',
      ORDINAL: 'Order',
      QUANTITY: 'Quantity',
    };

    return labels[type] || type;
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md border';
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const typeStyles = getEntityTypeStyles(entity.entity_type);

  return (
    <span
      className={`${baseStyles} ${sizeStyles} ${typeStyles} ${className}`}
      title={`${getEntityTypeLabel(entity.entity_type)}: ${entity.entity_text}`}
      {...props}
    >
      {showType && (
        <span className="mr-1 opacity-70 text-[0.65em] uppercase font-semibold">
          {getEntityTypeLabel(entity.entity_type)}:
        </span>
      )}
      <span className="truncate max-w-[120px]">{entity.entity_text}</span>
    </span>
  );
}

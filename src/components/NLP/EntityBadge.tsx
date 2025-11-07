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
      PERSON: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
      ORG: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
      GPE: 'bg-green-600/20 text-green-400 border-green-500/30', // Geo-Political Entity
      LOC: 'bg-teal-600/20 text-teal-400 border-teal-500/30', // Location
      DATE: 'bg-orange-600/20 text-orange-400 border-orange-500/30',
      TIME: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
      MONEY: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
      PERCENT: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
      PRODUCT: 'bg-pink-600/20 text-pink-400 border-pink-500/30',
      EVENT: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
      WORK_OF_ART: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
      LAW: 'bg-violet-600/20 text-violet-400 border-violet-500/30',
      LANGUAGE: 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/30',
      NORP: 'bg-lime-600/20 text-lime-400 border-lime-500/30', // Nationalities, Religious/Political groups
      FAC: 'bg-sky-600/20 text-sky-400 border-sky-500/30', // Facilities
      CARDINAL: 'bg-slate-600/20 text-slate-400 border-slate-500/30',
      ORDINAL: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30',
      QUANTITY: 'bg-stone-600/20 text-stone-400 border-stone-500/30',
    };

    return typeStyles[type] || 'bg-gray-600/20 text-gray-400 border-gray-500/30';
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

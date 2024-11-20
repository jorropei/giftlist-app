import React from 'react';
import type { Present } from '../types';

const PRIORITY_COLORS = {
  'must-have': 'bg-red-500/20 text-red-400',
  'nice-to-have': 'bg-yellow-500/20 text-yellow-400',
  'optional': 'bg-blue-500/20 text-blue-400',
} as const;

export function PriorityBadge({ priority }: { priority: Present['priority'] }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[priority]}`}>
      {priority.replace('-', ' ')}
    </span>
  );
}
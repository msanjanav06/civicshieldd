import React from 'react';
import { formatUrgencyBadge, formatStatusBadge } from '../../utils/formatters';

export function UrgencyBadge({ urgency, size = 'sm' }) {
  const badge = formatUrgencyBadge(urgency);
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${badge.bg} ${badge.text} ${badge.border} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot} ${urgency === 'Critical' ? 'animate-ping' : ''}`} />
      <span>{urgency}</span>
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }) {
  const badge = formatStatusBadge(status);
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${badge.bg} ${badge.text} ${badge.border} ${sizeClasses}`}>
      {status}
    </span>
  );
}

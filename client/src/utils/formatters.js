export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function formatCoordinates(lat, lng) {
  if (lat === undefined || lat === null || lng === undefined || lng === null) return 'N/A';
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

export function formatUrgencyBadge(urgency) {
  switch (urgency) {
    case 'Critical':
      return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-600' };
    case 'Medium':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' };
    case 'Low':
    default:
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' };
  }
}

export function formatStatusBadge(status) {
  switch (status) {
    case 'Reported':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'Acknowledged':
      return { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' };
    case 'Assigned':
      return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' };
    case 'In Progress':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
    case 'Verified':
      return { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' };
    case 'Resolved':
      return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'Rejected':
      return { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  }
}

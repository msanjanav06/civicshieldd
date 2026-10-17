import React from 'react';
import { Link } from 'react-router-dom';
import { History, Wrench, ShieldCheck, AlertCircle, XCircle, Clock } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export default function RecentActivityFeed({ activities = [], loading = false }) {
  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading live operational feed...</div>;
  }

  if (!activities || activities.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-400">No recent activity recorded yet.</div>;
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'REPORTED':
        return <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">Reported</span>;
      case 'ASSIGNED':
        return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold">Assigned</span>;
      case 'STATUS_CHANGE':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">Status Update</span>;
      case 'VERIFIED':
        return <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">Verified</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Resolved</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">{action}</span>;
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1 divide-y divide-slate-100">
      {activities.map((item, idx) => (
        <div key={item._id || idx} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
          <div className="mt-1 flex-shrink-0">
            {getActionBadge(item.action)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-800 truncate">
                {item.actorName} <span className="text-[10px] text-slate-400 font-normal">({item.actorRole})</span>
              </span>
              <span className="text-[10px] text-slate-400 flex-shrink-0">
                {formatRelativeTime(item.timestamp)}
              </span>
            </div>

            {item.incident && (
              <div className="mt-0.5">
                <Link
                  to={`/incidents/${item.incident.incidentId || item.incident}`}
                  className="text-[11px] font-mono font-bold text-sky-600 hover:text-sky-700 hover:underline inline-block mr-2"
                >
                  {item.incident.incidentId || 'Incident'}
                </Link>
                <span className="text-[11px] text-slate-600 line-clamp-1">
                  {item.notes || item.incident.title}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Wrench, ArrowRight, Camera, ShieldAlert } from 'lucide-react';
import { UrgencyBadge, StatusBadge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';

export default function IncidentCard({ incident }) {
  const hasPhotos = incident.photos && incident.photos.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all p-5 flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top bar: ID, Urgency, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
              {incident.incidentId}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              {incident.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <UrgencyBadge urgency={incident.urgency} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Title and description */}
        <div>
          <Link to={`/incidents/${incident.incidentId}`}>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug line-clamp-1">
              {incident.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Photo thumbnail if present */}
        {hasPhotos && (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
            <img
              src={incident.photos[0]}
              alt={incident.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {incident.photos.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Camera className="w-3 h-3" /> +{incident.photos.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Address and Landmark */}
        <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-1">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="truncate">
            {incident.address}
            {incident.landmark ? ` (${incident.landmark})` : ''}
          </span>
        </div>

        {/* Assigned Crew indication */}
        {incident.assignedCrew && (
          <div className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
            <span className="truncate">
              <strong>Crew:</strong> {incident.assignedCrew.name || 'Dispatched Field Team'}
            </span>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {formatRelativeTime(incident.createdAt)}
        </span>

        <Link
          to={`/incidents/${incident.incidentId}`}
          className="font-bold text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-0.5 transition"
        >
          Track & Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { UrgencyBadge, StatusBadge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';

// Helper to create custom divIcon marker based on Urgency
function createUrgencyMarker(urgency) {
  let colorClass = 'marker-medium';
  let pinColor = '#f59e0b';

  if (urgency === 'Critical') {
    colorClass = 'marker-critical';
    pinColor = '#dc2626';
  } else if (urgency === 'Low') {
    colorClass = 'marker-low';
    pinColor = '#10b981';
  }

  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`;

  return L.divIcon({
    className: `custom-marker-pin ${colorClass}`,
    html: `<div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translate(-50%, -50%);">
      ${svgIcon}
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [0, 0]
  });
}

// Auto-bounds fitter
function FitBoundsToMarkers({ incidents }) {
  const map = useMap();

  useEffect(() => {
    if (!incidents || incidents.length === 0) return;

    const validCoords = incidents
      .filter((i) => i.location?.coordinates && i.location.coordinates.length === 2)
      .map((i) => [i.location.coordinates[1], i.location.coordinates[0]]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [incidents, map]);

  return null;
}

export default function IncidentMap({
  incidents = [],
  height = '500px',
  center = [37.7749, -122.4194],
  zoom = 13,
  selectedIncidentId = null
}) {
  const markerIcons = useMemo(() => ({
    Critical: createUrgencyMarker('Critical'),
    Medium: createUrgencyMarker('Medium'),
    Low: createUrgencyMarker('Low')
  }), []);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsToMarkers incidents={incidents} />

        {incidents.map((inc) => {
          if (!inc.location?.coordinates || inc.location.coordinates.length !== 2) return null;
          const [lng, lat] = inc.location.coordinates;
          const icon = markerIcons[inc.urgency] || markerIcons.Medium;

          return (
            <Marker key={inc._id || inc.incidentId} position={[lat, lng]} icon={icon}>
              <Popup className="civic-popup" minWidth={260} maxWidth={320}>
                <div className="p-1 space-y-2">
                  <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-1.5">
                    <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                      {inc.incidentId}
                    </span>
                    <UrgencyBadge urgency={inc.urgency} />
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                    {inc.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[170px]">{inc.address}</span>
                    <StatusBadge status={inc.status} />
                  </div>

                  {inc.photos && inc.photos.length > 0 && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200">
                      <img src={inc.photos[0]} alt={inc.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{formatRelativeTime(inc.createdAt)}</span>
                    <Link
                      to={`/incidents/${inc.incidentId}`}
                      className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs space-y-1">
        <span className="block font-bold text-[10px] text-slate-500 uppercase tracking-wider">
          Urgency Legend
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-rose-200" />
          <span className="text-[11px] text-slate-700 font-medium">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
          <span className="text-[11px] text-slate-700 font-medium">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span className="text-[11px] text-slate-700 font-medium">Low</span>
        </div>
      </div>
    </div>
  );
}

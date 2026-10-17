import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Navigation } from 'lucide-react';

// Custom Pin using divIcon
const pinIcon = L.divIcon({
  className: 'custom-picker-pin',
  html: `<div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); transform: translate(-50%, -100%);">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [0, 0]
});

// Click listener helper component
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Center updater helper
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
  height = '320px'
}) {
  const defaultCenter = [37.7749, -122.4194]; // Default Metro Center
  const currentPos = latitude && longitude ? [latitude, longitude] : defaultCenter;
  const [locating, setLocating] = useState(false);

  const handleSelect = (lat, lng) => {
    onLocationChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSelect(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        // Fallback to metro center if permission denied
        setLocating(false);
        alert('Could not retrieve GPS coordinates. Please click on the map to set location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          Click anywhere on the map to pinpoint exact coordinates
        </span>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={locating}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold border border-sky-200 transition"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          {locating ? 'Detecting...' : 'Use My GPS'}
        </button>
      </div>

      <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-300 relative shadow-inner">
        <MapContainer
          center={currentPos}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={currentPos} />
          <MapClickHandler onLocationSelect={handleSelect} />

          {latitude && longitude && (
            <Marker position={[latitude, longitude]} icon={pinIcon} />
          )}
        </MapContainer>

        {/* Floating coordinates badge */}
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-700 shadow-md flex items-center gap-2">
          <Crosshair className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {latitude && longitude
              ? `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
              : 'Select location on map'}
          </span>
        </div>
      </div>
    </div>
  );
}

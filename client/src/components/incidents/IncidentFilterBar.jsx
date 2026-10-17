import React from 'react';
import { Search, Filter, RotateCcw, Map, List, LayoutGrid } from 'lucide-react';
import { HAZARD_CATEGORIES, URGENCY_LEVELS, INCIDENT_STATUSES } from '../../utils/constants';

export default function IncidentFilterBar({
  filters,
  onFilterChange,
  onReset,
  viewMode,
  onViewModeChange,
  totalResults = 0
}) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-4">
      {/* Top Search & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by title, incident ID (e.g. CS-2026), street address..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-end sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => onViewModeChange('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              viewMode === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Split View</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('feed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              viewMode === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Feed Only</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('map')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map Only</span>
          </button>
        </div>
      </div>

      {/* Filter Selects Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Categories</option>
            {HAZARD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency</label>
          <select
            value={filters.urgency || ''}
            onChange={(e) => onFilterChange('urgency', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Urgencies</option>
            {URGENCY_LEVELS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="">All Statuses</option>
            {INCIDENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sort By</label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="newest">Newest Reported</option>
            <option value="oldest">Oldest First</option>
            <option value="urgency">Highest Urgency</option>
          </select>
        </div>
      </div>

      {/* Bottom Bar: Results Count & Reset Button */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="font-medium">
          Showing <strong className="text-slate-900">{totalResults}</strong> matching incidents
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition"
        >
          <RotateCcw className="w-3 h-3" /> Reset Filters
        </button>
      </div>
    </div>
  );
}

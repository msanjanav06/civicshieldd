import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, AlertCircle, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import IncidentMap from '../components/map/IncidentMap';
import IncidentCard from '../components/incidents/IncidentCard';
import IncidentFilterBar from '../components/incidents/IncidentFilterBar';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function IncidentFeedPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [viewMode, setViewMode] = useState('both'); // 'both', 'feed', 'map'

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    urgency: '',
    status: '',
    sortBy: 'newest'
  });

  const fetchIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: viewMode === 'map' ? 50 : 8,
        search: filters.search,
        category: filters.category,
        urgency: filters.urgency,
        status: filters.status,
        sortBy: filters.sortBy
      };

      const res = await api.get('/incidents', { params });
      setIncidents(res.data.incidents || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters, viewMode]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      urgency: '',
      status: '',
      sortBy: 'newest'
    });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Public Incident Feed & Live Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial hazard tracking and dispatch operations across municipal sectors.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-sky-600/30 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Hazard
        </Link>
      </div>

      {/* Filter Bar */}
      <IncidentFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={total}
      />

      {/* Main Content Layout */}
      {loading ? (
        <div className="py-24">
          <LoadingSpinner size="lg" text="Querying municipal incident database..." />
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Incidents Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No hazard reports match your current search and filter criteria. Try adjusting or clearing your filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-bold text-sky-600 bg-sky-50 rounded-xl hover:bg-sky-100 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Split Mode */}
          {viewMode === 'both' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column */}
              <div className="lg:col-span-6 lg:sticky lg:top-24">
                <IncidentMap incidents={incidents} height="560px" />
              </div>

              {/* Feed Column */}
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {incidents.map((inc) => (
                    <IncidentCard key={inc._id || inc.incidentId} incident={inc} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feed Only Mode */}
          {viewMode === 'feed' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {incidents.map((inc) => (
                <IncidentCard key={inc._id || inc.incidentId} incident={inc} />
              ))}
            </div>
          )}

          {/* Map Only Mode */}
          {viewMode === 'map' && (
            <div>
              <IncidentMap incidents={incidents} height="680px" />
            </div>
          )}

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-xs font-semibold text-slate-700 px-3">
                Page {page} of {pages}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Shield, ArrowRight, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusTimeline from '../components/incidents/StatusTimeline';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CitizenTrackingPage() {
  const [incidentIdInput, setIncidentIdInput] = useState('');
  const [incident, setIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = incidentIdInput.trim().toUpperCase();
    if (!query) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.get(`/incidents/${query}`);
      setIncident(res.data.incident);
      setHistory(res.data.history || []);
    } catch (err) {
      setIncident(null);
      setError(err.response?.data?.message || `No incident found matching identifier '${query}'.`);
    } finally {
      setLoading(false);
    }
  };

  const sampleSearch = (id) => {
    setIncidentIdInput(id);
    setLoading(true);
    setError('');
    setSearched(true);
    api.get(`/incidents/${id}`)
      .then((res) => {
        setIncident(res.data.incident);
        setHistory(res.data.history || []);
      })
      .catch((err) => {
        setIncident(null);
        setError(err.response?.data?.message || 'Incident not found.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="h-12 w-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Municipal Hazard Status
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Enter your unique Incident Identifier to inspect live field crew dispatch progress, on-site verification logs, and resolution details.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-xl mx-auto bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              required
              value={incidentIdInput}
              onChange={(e) => setIncidentIdInput(e.target.value.toUpperCase())}
              placeholder="e.g. CS-2026-1002"
              className="w-full pl-10 pr-3 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none uppercase font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick sample pills */}
        <div className="pt-3 border-t border-slate-100 mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-[11px] text-slate-400">Try Sample IDs:</span>
          {['CS-2026-1001', 'CS-2026-1002', 'CS-2026-1006'].map((sampleId) => (
            <button
              key={sampleId}
              type="button"
              onClick={() => sampleSearch(sampleId)}
              className="font-mono text-[11px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 transition"
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading && (
        <div className="py-12">
          <LoadingSpinner text="Retrieving dispatch status from municipal registry..." />
        </div>
      )}

      {/* Result Card */}
      {incident && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status summary */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  {incident.incidentId}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                  {incident.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <UrgencyBadge urgency={incident.urgency} />
                <StatusBadge status={incident.status} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              {incident.title}
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              {incident.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{incident.address}</span>
            </div>
          </div>

          {/* Status timeline */}
          <StatusTimeline
            currentStatus={incident.status}
            rejectionReason={incident.rejectionReason}
            history={history}
          />

          {/* Full Details link */}
          <div className="text-center">
            <Link
              to={`/incidents/${incident.incidentId}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition"
            >
              Open Full Incident Record & Technical Audit Log <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

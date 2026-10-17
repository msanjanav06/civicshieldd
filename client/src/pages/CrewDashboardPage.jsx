import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  Truck,
  Phone,
  Shield,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Camera,
  Layers,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import VerificationFormModal from '../components/incidents/VerificationFormModal';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CrewDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'resolved'

  // Verification modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetIncident, setTargetIncident] = useState(null);
  const [modalMode, setModalMode] = useState('verify'); // 'verify' or 'resolve'

  const fetchCrewIncidents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents', {
        params: { limit: 50, sortBy: 'newest' }
      });
      const all = res.data.incidents || [];

      // If crew, filter to their assigned incidents, or if admin show all assigned
      let filtered = all;
      if (!isAdmin) {
        filtered = all.filter(
          (inc) => String(inc.assignedCrew?._id || inc.assignedCrew) === String(user?._id)
        );
      } else {
        filtered = all.filter((inc) => !!inc.assignedCrew);
      }
      setIncidents(filtered);
    } catch (err) {
      console.error('Failed to load crew assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchCrewIncidents();
  }, [fetchCrewIncidents]);

  const handleStatusChange = async (incId, newStatus) => {
    try {
      await api.patch(`/incidents/${incId}/status`, { status: newStatus });
      fetchCrewIncidents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const openVerifyModal = (inc, mode) => {
    setTargetIncident(inc);
    setModalMode(mode);
    setModalOpen(true);
  };

  const activeIncidents = incidents.filter(
    (i) => !['Resolved', 'Rejected'].includes(i.status)
  );
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved');

  const displayedList = activeTab === 'active' ? activeIncidents : resolvedIncidents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Crew Profile Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-2xl">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700">
                Active Field Duty
              </span>
              <span className="text-xs text-slate-400">• Unit Online</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {user?.name || 'Field Crew Member'}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {user?.crewDetails?.department || 'Municipal Infrastructure Rapid Response Unit'}
            </p>
          </div>
        </div>

        {/* Quick crew stats pill */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-xs">
          {user?.crewDetails?.vehicleId && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Unit: <strong className="text-white font-mono">{user.crewDetails.vehicleId}</strong></span>
            </div>
          )}
          {user?.crewDetails?.phone && (
            <div className="flex items-center gap-1.5 text-slate-300 border-l border-slate-700 pl-3">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{user.crewDetails.phone}</span>
            </div>
          )}
          <button
            onClick={fetchCrewIncidents}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition ml-2"
            title="Refresh queue"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Active Field Dispatches</span>
          <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {activeIncidents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'resolved'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Completed & Certified</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {resolvedIncidents.length}
          </span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Retrieving crew dispatch tasks..." />
        </div>
      ) : displayedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {activeTab === 'active' ? 'No Pending Dispatches' : 'No Resolved Dispatches Yet'}
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'active'
              ? 'All assigned infrastructure tickets have been certified or closed.'
              : 'Completed resolutions will appear here with proof documentation.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedList.map((inc) => (
            <div
              key={inc._id || inc.incidentId}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                      {inc.incidentId}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                      {inc.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UrgencyBadge urgency={inc.urgency} />
                    <StatusBadge status={inc.status} />
                  </div>
                </div>

                <Link to={`/incidents/${inc.incidentId}`}>
                  <h3 className="text-base font-bold text-slate-900 hover:text-sky-600 transition leading-snug">
                    {inc.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{inc.address}</span>
                </div>

                {inc.photos && inc.photos.length > 0 && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-100">
                    <img src={inc.photos[0]} alt={inc.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Verification notes badge if already verified */}
                {inc.verification?.verifiedAt && (
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-0.5">
                    <div className="font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-teal-600" /> On-Site Log Recorded:
                    </div>
                    <p className="text-[11px] text-teal-800 italic">"{inc.verification.notes}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Active Tab */}
              {activeTab === 'active' && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {inc.status === 'Assigned' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(inc._id, 'In Progress')}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition"
                      >
                        Mobilize In-Progress
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openVerifyModal(inc, 'verify')}
                      className="px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1"
                    >
                      <Shield className="w-3 h-3" />
                      Verify On-Site
                    </button>

                    <button
                      type="button"
                      onClick={() => openVerifyModal(inc, 'resolve')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Mark Resolved
                    </button>
                  </div>

                  <Link
                    to={`/incidents/${inc.incidentId}`}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Crew Verification & Resolution Modal */}
      <VerificationFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        incident={targetIncident}
        mode={modalMode}
        onSuccess={fetchCrewIncidents}
      />
    </div>
  );
}

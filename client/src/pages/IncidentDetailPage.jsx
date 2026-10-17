import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Shield,
  Wrench,
  ArrowLeft,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  History,
  XCircle,
  Camera,
  ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { formatDate, formatRelativeTime, formatCoordinates } from '../utils/formatters';
import LocationPickerMap from '../components/map/LocationPickerMap';
import StatusTimeline from '../components/incidents/StatusTimeline';
import VerificationFormModal from '../components/incidents/VerificationFormModal';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isCrew } = useAuth();

  const [incident, setIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationMode, setVerificationMode] = useState('verify'); // 'verify' or 'resolve'

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Status transition loading
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIncident = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data.incident);
      setHistory(res.data.history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Incident could not be found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      await api.patch(`/incidents/${incident._id}/status`, { status: newStatus });
      await fetchIncident();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      setRejectLoading(true);
      await api.patch(`/incidents/${incident._id}/status`, {
        status: 'Rejected',
        rejectionReason: rejectionReason.trim()
      });
      setRejectModalOpen(false);
      await fetchIncident();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject incident.');
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Loading incident record..." />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Incident Not Available</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This incident record does not exist.'}</p>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  const [lng, lat] = incident.location?.coordinates || [-122.4194, 37.7749];

  // Permissions
  const canManageCrew = isAdmin || (isCrew && String(incident.assignedCrew?._id || incident.assignedCrew) === String(user?._id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Incident Feed
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Share Public ID:</span>
          <code className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 select-all">
            {incident.incidentId}
          </code>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm sm:text-base font-extrabold text-sky-800 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
              {incident.incidentId}
            </span>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
              {incident.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <UrgencyBadge urgency={incident.urgency} size="lg" />
            <StatusBadge status={incident.status} size="lg" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {incident.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Reported: {formatDate(incident.createdAt)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            Reporter: {incident.reporterName || 'Citizen Report'}
          </span>
          {incident.assignedCrew && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-semibold text-indigo-700">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Crew: {incident.assignedCrew.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Timeline Card */}
      <StatusTimeline
        currentStatus={incident.status}
        rejectionReason={incident.rejectionReason}
        history={history}
      />

      {/* Dispatch Actions Toolbar (for authorized Crew or Admin) */}
      {canManageCrew && incident.status !== 'Resolved' && incident.status !== 'Rejected' && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest block">
              Field Crew & Ops Control
            </span>
            <p className="text-xs text-slate-300">
              Update operational status, record technical logs, or close this ticket.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {incident.status === 'Reported' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('Acknowledged')}
                disabled={actionLoading}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition disabled:opacity-50"
              >
                Acknowledge Ticket
              </button>
            )}

            {['Acknowledged', 'Assigned'].includes(incident.status) && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('In Progress')}
                disabled={actionLoading}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
              >
                Mark In Progress
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setVerificationMode('verify');
                setVerificationModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Log Verification
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationMode('resolve');
                setVerificationModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolve Incident
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 transition"
              >
                Reject Report
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid: Details, Map & Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Description & Photos (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Observed Hazard Details
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {incident.description}
            </p>
          </div>

          {/* Photo Evidence */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-400" />
              Photo Evidence ({incident.photos?.length || 0})
            </h3>
            {incident.photos && incident.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {incident.photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={photo} alt={`Hazard ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No initial photo evidence was uploaded.</p>
            )}
          </div>

          {/* Verification & Resolution Logs */}
          {incident.verification?.verifiedAt && (
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600" /> On-Site Technical Verification Log
                </span>
                <span className="text-[11px] text-teal-600">
                  {formatDate(incident.verification.verifiedAt)}
                </span>
              </div>
              <p className="text-xs text-teal-950 leading-relaxed font-medium">
                {incident.verification.notes}
              </p>
              {incident.verification.confirmedHazardLevel && (
                <div className="text-[11px] text-teal-800">
                  <strong>Confirmed Hazard Acuity:</strong> {incident.verification.confirmedHazardLevel}
                </div>
              )}
            </div>
          )}

          {incident.resolution?.resolvedAt && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hazard Resolution Documentation
                </span>
                <span className="text-[11px] text-emerald-600">
                  {formatDate(incident.resolution.resolvedAt)}
                </span>
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {incident.resolution.notes}
              </p>
              {incident.resolution.resolutionPhotos?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {incident.resolution.resolutionPhotos.map((p, i) => (
                    <div key={i} className="aspect-video rounded-lg overflow-hidden border border-emerald-200">
                      <img src={p} alt="Resolution proof" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Map & Immutable Audit Trail (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Location details card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-600" />
              Verified Location
            </h3>

            <div className="text-xs text-slate-700 space-y-1">
              <div><strong>Address:</strong> {incident.address}</div>
              {incident.landmark && <div><strong>Landmark:</strong> {incident.landmark}</div>}
              <div><strong>Coordinates:</strong> {formatCoordinates(lat, lng)}</div>
            </div>

            {/* Static Leaflet map centering coordinates */}
            <div className="h-60 rounded-xl overflow-hidden border border-slate-200">
              <LocationPickerMap
                latitude={lat}
                longitude={lng}
                onLocationChange={() => {}}
                height="240px"
              />
            </div>
          </div>

          {/* Immutable Audit Trail */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              Immutable Audit History ({history.length})
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs divide-y divide-slate-100">
              {history.map((h, i) => (
                <div key={h._id || i} className="pt-2.5 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{h.action}</span>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(h.timestamp)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    By <strong>{h.actorName}</strong> ({h.actorRole})
                  </div>
                  {h.notes && (
                    <div className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{h.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification / Resolution Modal */}
      <VerificationFormModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        incident={incident}
        mode={verificationMode}
        onSuccess={fetchIncident}
      />

      {/* Rejection Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Incident Report"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed">
            Rejecting an incident stops further dispatch and archives the ticket. A specific administrative reason is mandatory.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Private property outside public right of way, or duplicate non-actionable notification..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejectLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow disabled:opacity-50"
            >
              {rejectLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

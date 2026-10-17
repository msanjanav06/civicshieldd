import React from 'react';
import { AlertTriangle, MapPin, ArrowRight, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../common/Modal';
import { UrgencyBadge, StatusBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export default function DuplicateWarningModal({
  isOpen,
  onClose,
  duplicates = [],
  onSubmitAnyway,
  submitting = false
}) {
  if (!isOpen || duplicates.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Possible Duplicate Hazard Detected"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>Server Duplicate Prevention:</strong> We detected an active, unresolved incident matching this category within 100 metres of your coordinates. You can review the existing ticket or proceed with a separate report.
          </div>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {duplicates.map((dup) => (
            <div
              key={dup._id || dup.incidentId}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {dup.incidentId}
                </span>
                <div className="flex items-center gap-1.5">
                  <UrgencyBadge urgency={dup.urgency} />
                  <StatusBadge status={dup.status} />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{dup.title}</h4>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 truncate max-w-[240px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {dup.address}
                </span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                  {dup.distanceMeters !== undefined ? `${dup.distanceMeters}m away` : 'Nearby'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Reported: {formatDate(dup.createdAt)}
                </span>
                <Link
                  to={`/incidents/${dup.incidentId}`}
                  target="_blank"
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Inspect Existing Ticket <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel & Edit Coordinates
          </button>
          <button
            type="button"
            onClick={onSubmitAnyway}
            disabled={submitting}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Continue As Separate Report'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

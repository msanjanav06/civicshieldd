import React from 'react';
import { Check, Clock, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { STATUS_STEPS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export default function StatusTimeline({ currentStatus, rejectionReason, history = [] }) {
  const isRejected = currentStatus === 'Rejected';

  const currentStepIndex = isRejected
    ? -1
    : STATUS_STEPS.indexOf(currentStatus);

  // Helper to find history entry for a status
  const getHistoryForStatus = (statusName) => {
    return history.find((h) => h.newStatus === statusName || (statusName === 'Reported' && h.action === 'REPORTED'));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          Lifecycle & Dispatch Progression
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          Current: <strong className="text-slate-900">{currentStatus}</strong>
        </span>
      </div>

      {/* Rejected Callout */}
      {isRejected && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
            <XCircle className="w-4 h-4" /> Incident Rejected / Dismissed
          </div>
          <p className="text-xs leading-relaxed text-rose-800">
            <strong>Reason:</strong> {rejectionReason || 'Does not meet municipal response criteria.'}
          </p>
        </div>
      )}

      {/* Horizontal Steps on desktop, vertical on mobile */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = !isRejected && idx <= currentStepIndex;
            const isCurrent = !isRejected && idx === currentStepIndex;
            const historyItem = getHistoryForStatus(step);

            let circleClass = 'bg-slate-100 text-slate-400 border-slate-200';
            let labelClass = 'text-slate-400 font-medium';

            if (isCurrent) {
              circleClass = 'bg-sky-600 text-white ring-4 ring-sky-100 border-white animate-pulse';
              labelClass = 'text-sky-700 font-bold';
            } else if (isCompleted) {
              circleClass = 'bg-emerald-600 text-white border-emerald-600';
              labelClass = 'text-slate-800 font-semibold';
            }

            return (
              <div key={step} className="flex flex-col items-center text-center space-y-2 relative">
                {/* Connector line (desktop) */}
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors ${
                      idx < currentStepIndex && !isRejected ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs z-10 transition-all ${circleClass}`}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div>
                  <span className={`text-xs block ${labelClass}`}>{step}</span>
                  {historyItem && (
                    <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                      {formatDate(historyItem.timestamp)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

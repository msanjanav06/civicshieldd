import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, User, Phone, Truck } from 'lucide-react';
import Modal from '../common/Modal';
import api from '../../api/client';
import Alert from '../common/Alert';

export default function AssignCrewModal({
  isOpen,
  onClose,
  incident,
  onAssigned
}) {
  const [crews, setCrews] = useState([]);
  const [selectedCrewId, setSelectedCrewId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingCrews, setFetchingCrews] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFetchingCrews(true);
      setError('');
      api.get('/auth/crews')
        .then((res) => {
          setCrews(res.data.crews || []);
          if (res.data.crews?.length > 0) {
            setSelectedCrewId(res.data.crews[0]._id);
          }
        })
        .catch((err) => {
          setError('Failed to fetch available field crews.');
        })
        .finally(() => setFetchingCrews(false));
    }
  }, [isOpen]);

  if (!isOpen || !incident) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCrewId) {
      setError('Please choose a field crew unit.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.patch(`/incidents/${incident._id}/assign`, {
        crewId: selectedCrewId,
        notes: notes.trim()
      });
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch crew.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Incident to Field Crew"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div><strong>Ticket:</strong> {incident.incidentId} - {incident.title}</div>
          <div><strong>Category & Urgency:</strong> {incident.category} ({incident.urgency})</div>
          <div><strong>Address:</strong> {incident.address}</div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Field Response Unit *
          </label>

          {fetchingCrews ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading active crews...</div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {crews.map((crew) => (
                <label
                  key={crew._id}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedCrewId === crew._id
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="crewSelect"
                      value={crew._id}
                      checked={selectedCrewId === crew._id}
                      onChange={() => setSelectedCrewId(crew._id)}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{crew.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{crew.crewDetails?.department || 'General Crew'}</span>
                        {crew.crewDetails?.vehicleId && (
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Truck className="w-3 h-3 text-slate-400" /> {crew.crewDetails.vehicleId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Available
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Dispatch Instructions / Priority Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special equipment needed, gate access codes, or urgent priority directive..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedCrewId}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? 'Dispatching...' : 'Confirm Dispatch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

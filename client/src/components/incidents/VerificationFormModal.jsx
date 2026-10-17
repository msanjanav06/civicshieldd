import React, { useState } from 'react';
import { ShieldCheck, Wrench, X, Camera, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import api from '../../api/client';
import Alert from '../common/Alert';

export default function VerificationFormModal({
  isOpen,
  onClose,
  incident,
  mode = 'verify', // 'verify' or 'resolve'
  onSuccess
}) {
  const [notes, setNotes] = useState('');
  const [confirmedHazardLevel, setConfirmedHazardLevel] = useState(incident?.urgency || 'Medium');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !incident) return null;

  const isResolveMode = mode === 'resolve';

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 3) {
      setError('You can upload up to 3 documentation photos.');
      return;
    }

    const validFiles = [];
    const validPreviews = [];
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setError(`"${f.name}" exceeds 5MB size limit.`);
        return;
      }
      validFiles.push(f);
      validPreviews.push(URL.createObjectURL(f));
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validPreviews]);
    setError('');
  };

  const removePhoto = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Upload photos if attached
      let photoUrls = [];
      if (selectedFiles.length > 0) {
        const uploadData = new FormData();
        selectedFiles.forEach((f) => uploadData.append('photos', f));
        const resUpload = await api.post('/uploads', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrls = resUpload.data.urls || [];
      }

      // 2. Submit verification or resolution
      if (isResolveMode) {
        await api.post(`/incidents/${incident._id}/resolution`, {
          notes,
          resolutionPhotos: photoUrls
        });
      } else {
        await api.post(`/incidents/${incident._id}/verification`, {
          notes,
          confirmedHazardLevel,
          onSitePhotos: photoUrls
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please review your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isResolveMode ? 'Document Final Hazard Resolution' : 'Record On-Site Crew Verification'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div><strong>Incident:</strong> {incident.incidentId} - {incident.title}</div>
          <div><strong>Location:</strong> {incident.address}</div>
        </div>

        {!isResolveMode && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirmed Hazard Level (After On-Site Inspection)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'Critical'].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setConfirmedHazardLevel(level)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    confirmedHazardLevel === level
                      ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            {isResolveMode ? 'Resolution Work Notes & Actions Taken *' : 'On-Site Technical Findings & Notes *'}
          </label>
          <textarea
            required
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isResolveMode
                ? 'Specify replacement parts, structural tests, cleanup actions, and final safety certification...'
                : 'Document measured voltage, pipe diameter, structural displacement, or safety cordons established...'
            }
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Photo attachments */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {isResolveMode ? 'Resolution Proof Photos (After Repair)' : 'On-Site Inspection Photos'}
          </label>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                  <img src={url} alt={`Documentation ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length < 3 && (
            <label className="border border-dashed border-slate-300 hover:border-sky-400 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition text-xs font-medium text-slate-600">
              <Camera className="w-4 h-4 text-slate-400" />
              <span>Attach documentation photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
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
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? 'Submitting Log...' : isResolveMode ? 'Confirm Resolution' : 'Save Verification'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

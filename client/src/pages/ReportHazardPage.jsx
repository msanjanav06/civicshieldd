import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Upload,
  X,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Shield,
  Camera,
  Info
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HAZARD_CATEGORIES, URGENCY_LEVELS } from '../utils/constants';
import LocationPickerMap from '../components/map/LocationPickerMap';
import DuplicateWarningModal from '../components/incidents/DuplicateWarningModal';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';

export default function ReportHazardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical Hazard',
    urgency: 'Medium',
    description: '',
    address: '',
    landmark: '',
    latitude: 37.7749,
    longitude: -122.4194
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Duplicate modal states
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [detectedDuplicates, setDetectedDuplicates] = useState([]);

  // Success modal state
  const [createdIncident, setCreatedIncident] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 4) {
      setErrorMessage('You can upload a maximum of 4 photos per incident.');
      return;
    }

    // Validate size (max 5MB per file) and mime types
    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...validPreviews]);
    setErrorMessage('');
  };

  const removePhoto = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const executeSubmission = async (forceSubmit = false) => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload photos first if any
      let uploadedPhotoUrls = [];
      if (selectedFiles.length > 0) {
        const uploadData = new FormData();
        selectedFiles.forEach((f) => uploadData.append('photos', f));

        const uploadRes = await api.post('/uploads', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedPhotoUrls = uploadRes.data.urls || [];
      }

      // 2. Submit Incident to backend
      const payload = {
        ...formData,
        photos: uploadedPhotoUrls,
        forceSubmit
      };

      const res = await api.post('/incidents', payload);
      setCreatedIncident(res.data.incident);
      setDuplicateModalOpen(false);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.duplicateWarning) {
        // Intercept server-side duplicate warning
        setDetectedDuplicates(err.response.data.duplicates || []);
        setDuplicateModalOpen(true);
      } else {
        setErrorMessage(
          err.response?.data?.message ||
          (err.response?.data?.errors ? err.response.data.errors.join(', ') : 'Failed to submit incident report.')
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSubmission(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
              Citizen Reporting
            </span>
            <span className="text-xs text-slate-400">• Official Intake Form</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Report an Infrastructure Hazard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit physical municipal hazards directly to rapid dispatch and repair teams.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Reporting as guest.{' '}
              <Link to="/login" className="font-bold underline hover:text-amber-950">
                Sign in
              </Link>{' '}
              to track reports directly in your account.
            </span>
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Hazard Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Live electrical cable sagging across pedestrian pathway"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
          />
        </div>

        {/* Category & Urgency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            >
              {HAZARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Urgency Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {URGENCY_LEVELS.map((urg) => (
                <button
                  type="button"
                  key={urg.value}
                  onClick={() => setFormData((p) => ({ ...p, urgency: urg.value }))}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    formData.urgency === urg.value
                      ? `${urg.color} ring-2 ring-offset-1`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${urg.dot}`} />
                  <span>{urg.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Hazard Description & Observed Risks <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the exact physical hazard condition, potential dangers, sparking, flooding depth, or obstructions..."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
          />
        </div>

        {/* Address and Landmark */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Street Address / Cross Streets <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 742 Evergreen Terrace"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Landmark / Specific Location Clue
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              placeholder="e.g. Near North Gate / opposite pharmacy"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
            />
          </div>
        </div>

        {/* Map Location Picker */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Map Location Pinpoint <span className="text-rose-500">*</span>
          </label>
          <LocationPickerMap
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Photo Upload Section */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Photo Evidence (Up to 4 images, max 5MB each)
            </label>
            <span className="text-xs text-slate-400">
              {selectedFiles.length} of 4 photos attached
            </span>
          </div>

          {/* Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedFiles.length < 4 && (
            <label className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-sky-50/50 transition">
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Click to attach photo evidence or drag & drop files
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP accepted (Strict executable rejection active)
              </span>
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

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/incidents"
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-md shadow-sky-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Registering Hazard...' : 'Submit Hazard Report'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      <DuplicateWarningModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        duplicates={detectedDuplicates}
        onSubmitAnyway={() => executeSubmission(true)}
        submitting={submitting}
      />

      {/* Successful Submission Modal */}
      <Modal
        isOpen={!!createdIncident}
        onClose={() => navigate('/incidents')}
        title="Hazard Report Registered"
        maxWidth="max-w-md"
      >
        {createdIncident && (
          <div className="text-center space-y-4 py-2">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium">Unique Tracking Identifier</span>
              <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-wider mt-0.5">
                {createdIncident.incidentId}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your report for "<strong>{createdIncident.title}</strong>" has been queued for municipal crew assignment. Keep your Incident ID to track live dispatch progress.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left text-slate-600 space-y-1">
              <div><strong>Category:</strong> {createdIncident.category}</div>
              <div><strong>Urgency:</strong> {createdIncident.urgency}</div>
              <div><strong>Location:</strong> {createdIncident.address}</div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                to={`/incidents/${createdIncident.incidentId}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow"
              >
                Track Incident Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCreatedIncident(null);
                  setFormData({
                    title: '',
                    category: 'Electrical Hazard',
                    urgency: 'Medium',
                    description: '',
                    address: '',
                    landmark: '',
                    latitude: 37.7749,
                    longitude: -122.4194
                  });
                  setSelectedFiles([]);
                  setPreviewUrls([]);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Submit Another Report
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

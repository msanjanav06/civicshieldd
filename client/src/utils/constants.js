export const HAZARD_CATEGORIES = [
  'Electrical Hazard',
  'Water Leakage',
  'Open Manhole',
  'Road Damage',
  'Sewage Overflow',
  'Other'
];

export const URGENCY_LEVELS = [
  { value: 'Low', label: 'Low Urgency', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500', hex: '#10b981' },
  { value: 'Medium', label: 'Medium Urgency', color: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500', hex: '#f59e0b' },
  { value: 'Critical', label: 'Critical / Immediate Threat', color: 'bg-rose-100 text-rose-800 border-rose-300 font-semibold', dot: 'bg-rose-600', hex: '#dc2626' }
];

export const INCIDENT_STATUSES = [
  { value: 'Reported', label: 'Reported', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { value: 'Acknowledged', label: 'Acknowledged', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { value: 'Assigned', label: 'Assigned', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'Verified', label: 'Verified On-Site', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { value: 'Resolved', label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'Rejected', label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300' }
];

export const STATUS_STEPS = [
  'Reported',
  'Acknowledged',
  'Assigned',
  'In Progress',
  'Verified',
  'Resolved'
];

export const USER_ROLES = {
  CITIZEN: 'citizen',
  CREW: 'crew',
  ADMIN: 'admin'
};

import React from 'react';
import { User, Mail, Shield, Wrench, ShieldAlert, Calendar, LogOut, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export default function ProfilePage() {
  const { user, logout, isAdmin, isCrew } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {user.name}
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-400/20 text-sky-300 border border-sky-400/30">
              Role: {user.role}
            </span>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Credentials</h3>
            
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Account ID</span>
              <span className="text-xs font-mono text-slate-800 font-bold">{user._id || 'Standard'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Registered Since</span>
              <span className="text-xs text-slate-800 font-semibold">{formatDate(user.createdAt)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Security Clearance</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Verified
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Scope</h3>

            {isCrew && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <Wrench className="w-4 h-4" /> Field Crew Profile
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <div><strong>Department:</strong> {user.crewDetails?.department || 'Rapid Response'}</div>
                  <div><strong>Assigned Vehicle:</strong> {user.crewDetails?.vehicleId || 'Standard Fleet'}</div>
                  <div><strong>Direct Line:</strong> {user.crewDetails?.phone || 'Central Dispatch'}</div>
                </div>
                <Link
                  to="/crew"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
                >
                  Go to Crew Assignments <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/60 space-y-2">
                <div className="flex items-center gap-2 text-purple-800 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4" /> Municipal Operations Administrator
                </div>
                <p className="text-xs text-slate-600">
                  Full administrative permissions to dispatch crews, reject non-qualifying reports, and review immutable audit histories.
                </p>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 pt-1"
                >
                  Open Operations Center <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {!isCrew && !isAdmin && (
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/60 space-y-2">
                <div className="flex items-center gap-2 text-sky-800 font-semibold text-xs">
                  <User className="w-4 h-4" /> Citizen Reporter
                </div>
                <p className="text-xs text-slate-600">
                  You are registered to report hazardous municipal conditions, submit photo evidence, track resolutions, and receive direct notifications.
                </p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-800 pt-1"
                >
                  Submit a New Hazard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Link
            to="/incidents"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            ← View Live Incident Feed
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

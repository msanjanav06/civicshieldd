import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, PhoneCall, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      {/* Emergency Advisory Strip */}
      <div className="bg-amber-950/60 border-b border-amber-800/50 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Emergency Notice:</strong> For active life-threatening emergencies, severe injuries, or live electrical lines sparking, dial <strong>911 / 112</strong> immediately.
            </span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
            <span>Municipal Dispatch Hotline: 1-800-CIVIC-OPS</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Platform */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">CivicShield</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering citizens, rapid field crews, and municipal operations managers to identify, coordinate, and resolve urban infrastructure hazards.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Civic Services Online (99.98% SLA)</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Citizens</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/report" className="hover:text-white transition">Report an Infrastructure Hazard</Link>
              </li>
              <li>
                <Link to="/incidents" className="hover:text-white transition">Public Live Map & Feeds</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition">Track Incident Status</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">Register Citizen Account</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Municipal Operations */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Operations</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/crew" className="hover:text-white transition">Field Crew Dispatch</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">Operations Dashboard</Link>
              </li>
              <li>
                <span className="text-slate-500">Spatial Duplicate Detection (Active)</span>
              </li>
              <li>
                <span className="text-slate-500">Tamper-Proof Audit Logging (Active)</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Hazard Categories */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Supported Hazards</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Electrical Hazard</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Water Leakage</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Open Manhole</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Road Damage</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Sewage Overflow</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Other Municipal Risks</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicShield Municipal Civic-Tech Platform. Production-grade municipal infrastructure dispatch.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">OpenStreetMap Data</span>
            <span>•</span>
            <span className="hover:text-slate-400">GDPR & Privacy Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

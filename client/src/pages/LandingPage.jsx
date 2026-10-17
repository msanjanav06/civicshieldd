import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, MapPin, Wrench, BarChart2, Clock, CheckCircle2, ArrowRight, Activity, Users, Layers, Zap } from 'lucide-react';
import { HAZARD_CATEGORIES } from '../utils/constants';

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-sm animate-pulse">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>CivicShield Next-Gen Municipal Hazard Response</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Safeguarding Urban Communities Through{' '}
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Rapid Civic Dispatch
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed">
              CivicShield closes the gap between citizens spotting physical infrastructure dangers and municipal field teams executing rapid on-site repair. With spatial duplicate prevention and verifiable audit trails.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-sky-600/30 transition hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                Report Hazard Now
              </Link>

              <Link
                to="/incidents"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold text-base px-6 py-3.5 rounded-xl border border-slate-700 transition"
              >
                <MapPin className="w-5 h-5 text-sky-400" />
                Explore Live Map & Feed
              </Link>

              <Link
                to="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-medium text-base px-5 py-3.5 rounded-xl border border-slate-800 transition"
              >
                Track by ID
              </Link>
            </div>

            {/* Quick Demo Credentials Pill */}
            <div className="pt-6">
              <div className="inline-block bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-400">
                <span className="font-semibold text-sky-300 mr-2">Demo Accounts Ready:</span>
                Citizen (<code>citizen@civicshield.gov</code> / <code>demo123</code>) • 
                Crew (<code>crew@civicshield.gov</code> / <code>demo123</code>) • 
                Admin (<code>admin@civicshield.gov</code> / <code>demo123</code>)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex items-center gap-4 py-2 md:py-0 md:px-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">&lt; 38 min</div>
              <div className="text-xs text-slate-500 font-medium">Avg Crew Dispatch Time</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 md:py-0 md:px-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">96.4%</div>
              <div className="text-xs text-slate-500 font-medium">Resolution Success Rate</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 md:py-0 md:px-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">100m</div>
              <div className="text-xs text-slate-500 font-medium">Duplicate Radius Detection</div>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2 md:py-0 md:px-4">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-medium">Immutable Audit Trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Supported Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">Hazard Coverage</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            What hazards can you report?
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Every category connects immediately with the designated municipal division.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {HAZARD_CATEGORIES.map((category) => (
            <div
              key={category}
              className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition text-center flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs text-slate-800 leading-tight">
                {category}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 User Roles / Experience Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">Triple Role Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Citizens, Crews, & Operations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Citizens */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Citizens</h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-1">
              Easily capture hazard photos, choose precise map coordinates, track resolution progress with unique incident IDs, and get notifications when work begins.
            </p>
            <Link
              to="/report"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-auto"
            >
              Report an Issue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Field Crews */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 font-bold">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Field Crews</h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-1">
              Review assigned dispatches, update live statuses (Acknowledged → In Progress), document physical on-site verification, and submit resolution photos with work notes.
            </p>
            <Link
              to="/crew"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-auto"
            >
              Go to Crew Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Administrators */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 font-bold">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Municipal Administrators</h4>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-1">
              Monitor real-time operational stats, triage critical unresolved reports, assign incidents to specialized crews, reject non-qualifying reports with reasons, and inspect complete audit histories.
            </p>
            <Link
              to="/admin"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-auto"
            >
              Open Operations Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lifecycle Workflow Banner */}
      <section className="bg-slate-900 text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-bold">Transparent 6-Stage Lifecycle</h3>
            <p className="text-xs text-slate-400 mt-1">Every transition is cryptographically logged with user identity and timestamp.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: '1. Reported', desc: 'Citizen pins coordinates & uploads hazard photo' },
              { step: '2. Acknowledged', desc: 'System checks duplicates & assigns SLA priority' },
              { step: '3. Assigned', desc: 'Dispatch routes to specialized field team' },
              { step: '4. In Progress', desc: 'Field crew mobilizes on-site to inspect' },
              { step: '5. Verified', desc: 'Crews verify condition & record technical log' },
              { step: '6. Resolved', desc: 'Hazard repaired with closing proof & notes' },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-center flex flex-col justify-between">
                <span className="text-xs font-bold text-sky-400">{s.step}</span>
                <p className="text-[11px] text-slate-400 mt-2 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

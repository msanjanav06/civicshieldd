import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  Wrench,
  Shield,
  ArrowRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatCard from '../components/dashboard/StatCard';
import CategoryChart from '../components/dashboard/CategoryChart';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed';
import AssignCrewModal from '../components/dashboard/AssignCrewModal';
import { UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { formatRelativeTime } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [criticalIncidents, setCriticalIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign crew modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetIncident, setTargetIncident] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, criticalRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity'),
        api.get('/incidents', { params: { limit: 6, sortBy: 'newest' } })
      ]);

      setStats(statsRes.data.stats);
      setActivities(activityRes.data.activity || []);
      setCriticalIncidents(criticalRes.data.incidents || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleOpenAssign = (inc) => {
    setTargetIncident(inc);
    setAssignModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Aggregating municipal operational analytics..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">• Command Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Infrastructure Triage & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time performance metrics, crew routing, and hazard resolution management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh metrics"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Link
            to="/report"
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow transition"
          >
            + New Hazard Intake
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Reports"
          value={stats?.total || 0}
          subtext="Cumulative hazard reports"
          icon={<Layers className="w-5 h-5" />}
          color="sky"
        />

        <StatCard
          title="Critical Unresolved"
          value={stats?.criticalUnresolved || 0}
          subtext="Requires immediate dispatch"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
          urgent={(stats?.criticalUnresolved || 0) > 0}
        />

        <StatCard
          title="In Progress"
          value={stats?.inProgress || 0}
          subtext="Field crews on-site"
          icon={<Wrench className="w-5 h-5" />}
          color="amber"
        />

        <StatCard
          title="Resolved"
          value={stats?.resolved || 0}
          subtext="Fully certified & closed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />

        <StatCard
          title="Avg Resolution"
          value={`${stats?.avgResolutionHours || 4.2}h`}
          subtext="Municipal SLA target < 6h"
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Analytics & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category distribution bar chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Hazard Category Distribution
              </h3>
              <p className="text-xs text-slate-500">Live breakdown across municipal operational sectors</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              6 Categories Tracked
            </span>
          </div>

          <CategoryChart data={stats?.categoryDistribution || []} />
        </div>

        {/* Real-time Activity Feed */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Live Operations Activity
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Feed
            </span>
          </div>

          <RecentActivityFeed activities={activities} />
        </div>
      </div>

      {/* Incident Dispatch & Management Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Action Required Queue
            </h3>
            <p className="text-xs text-slate-500">Unassigned, critical, or progressing municipal hazards</p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View Complete Database →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Ticket ID</th>
                <th className="py-3 px-3">Title & Category</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Urgency</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Crew</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criticalIncidents.map((inc) => (
                <tr key={inc._id || inc.incidentId} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-sky-700">
                    <Link to={`/incidents/${inc.incidentId}`} className="hover:underline">
                      {inc.incidentId}
                    </Link>
                  </td>
                  <td className="py-3 px-3 max-w-[220px]">
                    <div className="font-bold text-slate-900 truncate">{inc.title}</div>
                    <div className="text-[10px] text-slate-400">{inc.category}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 truncate max-w-[160px]">
                    {inc.address}
                  </td>
                  <td className="py-3 px-3">
                    <UrgencyBadge urgency={inc.urgency} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {inc.assignedCrew ? (
                      <span className="font-semibold text-indigo-700">
                        {inc.assignedCrew.name || 'Assigned'}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {(!inc.assignedCrew || inc.status === 'Reported' || inc.status === 'Acknowledged') && (
                        <button
                          type="button"
                          onClick={() => handleOpenAssign(inc)}
                          className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                        >
                          Dispatch Crew
                        </button>
                      )}
                      <Link
                        to={`/incidents/${inc.incidentId}`}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                      >
                        Inspect →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crew Assignment Modal */}
      <AssignCrewModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incident={targetIncident}
        onAssigned={fetchDashboardData}
      />
    </div>
  );
}

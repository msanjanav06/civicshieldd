import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, AlertCircle, MapPin, Search, Wrench, BarChart3, User, LogOut, Menu, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isCrew } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const roleBadgeColor = {
    admin: 'bg-purple-900/60 text-purple-200 border-purple-700',
    crew: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
    citizen: 'bg-sky-900/60 text-sky-200 border-sky-700',
  }[user?.role] || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                  CivicShield
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Municipal Hazard Ops
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/incidents"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/incidents') ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Live Map & Feed
              </Link>

              <Link
                to="/track"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/track') ? 'bg-slate-800 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-4 h-4" />
                Track Report
              </Link>

              {/* Crew Dashboard Link */}
              {(isCrew || isAdmin) && (
                <Link
                  to="/crew"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/crew') ? 'bg-slate-800 text-emerald-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Crew Dispatch
                </Link>
              )}

              {/* Admin Operations Center Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isActive('/admin') ? 'bg-slate-800 text-purple-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Operations Center
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-md shadow-sky-600/30 transition hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              Report Hazard
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <NotificationDropdown />

                <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl px-3 py-1.5 border border-slate-700/60">
                  <div className="text-right">
                    <span className="block text-xs font-semibold text-slate-100 max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${roleBadgeColor}`}>
                      {user?.role}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    title="Profile & Settings"
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                  >
                    <User className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-sky-400 hover:text-sky-300 border border-sky-500/40 hover:border-sky-400 px-3 py-1.5 rounded-lg hover:bg-sky-950/40 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow mb-3"
          >
            <PlusCircle className="w-4 h-4" />
            Report Municipal Hazard
          </Link>
          <Link
            to="/incidents"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            Live Map & Feed
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            <Search className="w-4 h-4 text-sky-400" />
            Track Incident by ID
          </Link>
          {(isCrew || isAdmin) && (
            <Link
              to="/crew"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              <Wrench className="w-4 h-4 text-emerald-400" />
              Field Crew Dispatch
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Operations Center
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800 mt-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-800/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold text-white">{user?.name}</span>
                    <span className="text-xs text-slate-400">{user?.email}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleBadgeColor}`}>
                    {user?.role}
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
                >
                  <User className="w-4 h-4" /> Profile & Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-sky-300 border border-sky-600/40 rounded-lg bg-sky-950/40"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

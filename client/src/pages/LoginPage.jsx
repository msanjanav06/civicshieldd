import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Wrench, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'crew') navigate('/crew');
      else navigate(from === '/' ? '/incidents' : from);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/30 mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to CivicShield</h2>
          <p className="text-xs text-slate-500 mt-1">Access municipal reporting, dispatch, or administrative console</p>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            ⚡ Quick Demo Accounts (Click to Auto-Fill)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('citizen@civicshield.gov', 'demo123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-sky-100/80 text-sky-800 hover:bg-sky-200/80 transition flex items-center justify-center gap-1 border border-sky-300/50"
            >
              <UserCheck className="w-3.5 h-3.5" /> Citizen
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('crew@civicshield.gov', 'demo123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200/80 transition flex items-center justify-center gap-1 border border-emerald-300/50"
            >
              <Wrench className="w-3.5 h-3.5" /> Field Crew
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@civicshield.gov', 'demo123')}
              className="px-2 py-1.5 text-xs font-semibold rounded-lg bg-purple-100/80 text-purple-800 hover:bg-purple-200/80 transition flex items-center justify-center gap-1 border border-purple-300/50"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Admin
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. citizen@civicshield.gov"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight, Wrench, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    department: 'General Infrastructure',
    phone: '',
    vehicleId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        crewDetails: formData.role === 'crew' ? {
          department: formData.department,
          phone: formData.phone,
          vehicleId: formData.vehicleId,
          isAvailable: true
        } : undefined
      };

      const user = await register(payload);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'crew') navigate('/crew');
      else navigate('/incidents');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center">
          <div className="h-12 w-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/30 mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create CivicShield Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join the municipal infrastructure safety response network</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Citizen"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="citizen@civicshield.gov"
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
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none"
              />
            </div>
          </div>

          {/* Account Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Account Role</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'citizen', label: 'Citizen', icon: <UserCheck className="w-3.5 h-3.5" /> },
                { value: 'crew', label: 'Field Crew', icon: <Wrench className="w-3.5 h-3.5" /> },
                { value: 'admin', label: 'Admin Ops', icon: <ShieldAlert className="w-3.5 h-3.5" /> }
              ].map((roleOption) => (
                <button
                  type="button"
                  key={roleOption.value}
                  onClick={() => setFormData((p) => ({ ...p, role: roleOption.value }))}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border flex flex-col items-center gap-1 transition ${
                    formData.role === roleOption.value
                      ? 'bg-sky-50 border-sky-500 text-sky-800 ring-2 ring-sky-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {roleOption.icon}
                  <span>{roleOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Field Crew Details */}
          {formData.role === 'crew' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Crew Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Electrical Safety">Electrical Safety & Grid Ops</option>
                  <option value="Roads & Bridges">Roads, Asphalt & Structural</option>
                  <option value="Water & Sewage">Water, Sanitation & Manhole Works</option>
                  <option value="General Rapid Response">General Rapid Response Unit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vehicle / Unit ID</label>
                  <input
                    type="text"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    placeholder="e.g. TRUCK-4"
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dispatch Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 555-0192"
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-sky-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

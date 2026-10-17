import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  color = 'sky',
  urgent = false
}) {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }[color] || 'bg-slate-50 text-slate-600 border-slate-100';

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between ${urgent ? 'ring-2 ring-rose-500/40' : ''}`}>
      {urgent && (
        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {value}
        </div>
        {subtext && (
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtext}</p>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#0284c7', '#0d9488', '#f59e0b', '#dc2626', '#8b5cf6', '#64748b'];

export default function CategoryChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-xs text-slate-400">No category data available</div>;
  }

  // Format short names for XAxis
  const formattedData = data.map((d) => ({
    ...d,
    shortName: d.name.length > 12 ? `${d.name.substring(0, 11)}...` : d.name
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 10, fill: '#64748b' }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700">
                    <span className="font-bold block text-sky-400">{item.name}</span>
                    <span className="text-[11px] text-slate-300">Total Hazards: {item.count}</span>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

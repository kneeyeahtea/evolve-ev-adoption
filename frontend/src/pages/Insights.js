import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-gray-300 text-xs mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-white font-semibold text-sm">{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function f() {
      try { setInsights(await api.getInsights()); } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    f();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-emerald-500" /></div>;
  if (!insights) return <div className="text-center py-20 text-gray-400">Failed to load insights.</div>;

  const barInsights = insights.filter(i => i.type === 'bar');
  const heatmapInsight = insights.find(i => i.type === 'heatmap');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Data Insights</h1>
        <p className="text-gray-400">Data-driven discoveries from the EV adoption behaviour dataset</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {barInsights.map((insight, idx) => (
          <div key={idx} className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-gray-700 transition-all">
            <h3 className="text-base font-semibold text-white mb-1">{insight.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{insight.description}</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={insight.data}>
                <XAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-15} textAnchor="end" height={45} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]} barSize={28}>
                  {insight.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {heatmapInsight && (
        <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6">
          <h3 className="text-base font-semibold text-white mb-1">{heatmapInsight.title}</h3>
          <p className="text-xs text-gray-500 mb-4">{heatmapInsight.description}</p>
          <div className="overflow-x-auto">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {(heatmapInsight.features || []).map(f => (
                    <th key={f} className="p-1 text-gray-500 font-medium" style={{ writingMode: 'vertical-rl', maxWidth: 30, fontSize: 9 }}>
                      {f.replace(/_/g, ' ').substring(0, 18)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(heatmapInsight.features || []).map(row => (
                  <tr key={row}>
                    <td className="p-1 text-gray-400 font-medium text-right pr-2 whitespace-nowrap" style={{ fontSize: 10 }}>
                      {row.replace(/_/g, ' ').substring(0, 22)}
                    </td>
                    {(heatmapInsight.features || []).map(col => {
                      const entry = heatmapInsight.data.find(d => d.x === row && d.y === col);
                      const val = entry?.value || 0;
                      const abs = Math.abs(val);
                      const bg = val > 0 ? `rgba(16,185,129,${abs * 0.8})` : `rgba(239,68,68,${abs * 0.8})`;
                      return <td key={col} className="p-1 text-center font-mono text-white" style={{ backgroundColor: bg, minWidth: 38, fontSize: 10 }} title={`${row} vs ${col}: ${val}`}>{val.toFixed(2)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

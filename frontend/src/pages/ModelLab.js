import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Database, Settings, Wrench, Brain, BarChart3, Trophy, Zap, GitBranch, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

const pipelineSteps = [
  { label: 'Dataset', desc: '50,000 records', Icon: Database },
  { label: 'Preprocessing', desc: 'Scale, encode, impute', Icon: Settings },
  { label: 'Feature Eng.', desc: 'Leakage prevention', Icon: Wrench },
  { label: 'Training', desc: 'Multiple algorithms', Icon: Brain },
  { label: 'Comparison', desc: 'Validation metrics', Icon: BarChart3 },
  { label: 'Best Model', desc: 'Auto-selected', Icon: Trophy },
  { label: 'Prediction', desc: 'Real-time output', Icon: Zap },
];

function ModelComparisonTable({ title, comparison, type }) {
  if (!comparison) return null;
  const models = Object.keys(comparison);
  const isClass = type === 'classification';
  const metrics = isClass ? ['accuracy', 'precision', 'recall', 'f1_score'] : ['mae', 'rmse', 'r2'];
  const labels = isClass ? ['Accuracy', 'Precision', 'Recall', 'F1 Score'] : ['MAE', 'RMSE', 'R²'];
  const best = {};
  metrics.forEach(m => {
    const vals = models.map(model => comparison[model][m]);
    best[m] = (m === 'mae' || m === 'rmse') ? Math.min(...vals) : Math.max(...vals);
  });

  return (
    <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 mb-6">
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Model</th>
              {labels.map(l => <th key={l} className="text-right py-3 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            {models.map(model => (
              <tr key={model} className="border-b border-gray-800/40 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-medium">{model}</td>
                {metrics.map(m => {
                  const val = comparison[model][m];
                  const isBest = val === best[m];
                  return <td key={m} className={`text-right py-3 px-3 font-mono text-sm ${isBest ? 'text-emerald-400 font-bold' : 'text-gray-400'}`}>{val?.toFixed(4)}{isBest ? ' ★' : ''}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RandomForestVisual() {
  return (
    <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Conceptual Random Forest workflow</h3>
          <p className="text-gray-500 text-xs mt-1">
            Do not pretend this is an actual visualization of every trained tree.
          </p>
        </div>
        <span className="mt-2 sm:mt-0 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
          Ensemble Bagging Architecture
        </span>
      </div>

      <div className="flex flex-col items-center py-6 space-y-3">
        <div className="px-8 py-2.5 rounded-xl border font-bold text-sm bg-cyan-500/10 border-cyan-500/30 text-cyan-300 tracking-wider">
          USER DATA
        </div>
        <ArrowDown size={18} className="text-cyan-500 animate-pulse" />

        <div className="px-8 py-2.5 rounded-xl border font-bold text-sm bg-violet-500/10 border-violet-500/30 text-violet-300 tracking-wider">
          PREPROCESSING
        </div>
        <ArrowDown size={18} className="text-violet-500" />

        <div className="w-full max-w-xl p-4 rounded-xl bg-gray-950/80 border border-gray-800">
          <div className="text-center text-xs text-gray-500 mb-3 font-mono">
            Bootstrapped Subsets &amp; Feature Splitting
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[1, 2, 3, 4, '…', 'N'].map((n, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono"
              >
                <GitBranch size={16} className="mb-1 text-emerald-400" />
                <span className="text-xs font-semibold">TREE {n}</span>
              </div>
            ))}
          </div>
        </div>

        <ArrowDown size={18} className="text-amber-500" />
        <div className="px-8 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm tracking-wider">
          AGGREGATION (Majority Voting / Averaging)
        </div>

        <ArrowDown size={18} className="text-emerald-500 animate-pulse" />
        <div className="px-8 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm tracking-wider shadow-lg shadow-emerald-500/20">
          FINAL PREDICTION
        </div>
      </div>
    </div>
  );
}

export default function ModelLab() {
  const [metrics, setMetrics] = useState(null);
  const [importance, setImportance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function f() {
      try {
        const [m, fi] = await Promise.all([api.getModelMetrics(), api.getFeatureImportance()]);
        setMetrics(m); setImportance(fi);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    f();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-emerald-500" /></div>;
  if (!metrics) return <div className="text-center py-20 text-gray-400">Failed to load model data.</div>;

  const models = [
    { key: 'adoption', title: 'EV Adoption Likelihood', type: 'classification' },
    { key: 'range_anxiety', title: 'Range Anxiety Score', type: 'regression' },
    { key: 'energy', title: 'Monthly Energy Consumption', type: 'regression' },
    { key: 'charging_cost', title: 'Monthly Charging Cost', type: 'regression' },
  ];
  const badgeColors = ['text-emerald-400 bg-emerald-500/10','text-cyan-400 bg-cyan-500/10','text-violet-400 bg-violet-500/10','text-amber-400 bg-amber-500/10'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Model Lab</h1>
        <p className="text-gray-400">ML pipeline, model comparisons, and actual performance metrics</p>
      </div>

      {/* Pipeline */}
      <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 mb-10">
        <h2 className="text-lg font-semibold text-white mb-6">ML Pipeline</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          {pipelineSteps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center text-center px-2 py-2 min-w-[90px]">
                <step.Icon size={22} className="text-emerald-400 mb-1.5" />
                <span className="text-xs font-semibold text-white">{step.label}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{step.desc}</span>
              </div>
              {i < pipelineSteps.length - 1 && <ArrowDown size={14} className="text-emerald-600 rotate-0 md:-rotate-90 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {models.map(({ key, title, type }, idx) => {
          const m = metrics[key]; if (!m) return null;
          const best = m.comparison?.[m.best_model] || {};
          return (
            <div key={key} className="rounded-2xl bg-gray-900/60 border border-gray-800 p-5">
              <div className="text-xs text-gray-500 mb-2">{title}</div>
              <div className="text-base font-semibold text-white mb-3">{m.best_model}</div>
              <div className="flex flex-wrap gap-2">
                {type === 'classification' ? (
                  <><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${badgeColors[idx]}`}>F1: {best.f1_score?.toFixed(3)}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${badgeColors[idx]}`}>Acc: {best.accuracy?.toFixed(3)}</span></>
                ) : (
                  <><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${badgeColors[idx]}`}>R²: {best.r2?.toFixed(3)}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${badgeColors[idx]}`}>MAE: {best.mae?.toFixed(2)}</span></>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {models.map(({ key, title, type }) => <ModelComparisonTable key={key} title={`${title} — Model Comparison`} comparison={metrics[key]?.comparison} type={type} />)}
      <RandomForestVisual />

      {importance && Object.entries(importance).map(([key, factors]) => {
        if (!factors?.length) return null;
        const data = factors.slice(0, 10).map(f => ({ name: f.feature.replace(/_/g, ' '), value: Math.round(f.importance * 100) }));
        return (
          <div key={key} className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 mb-6">
            <h3 className="text-base font-semibold text-white mb-4">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Feature Importance</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} formatter={(v) => [`${v}%`, 'Importance']} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={14}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

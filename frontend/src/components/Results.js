import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Battery, BarChart3, DollarSign, ShieldCheck, Search, HelpCircle, AlertTriangle } from 'lucide-react';

const COLORS = { Low: '#ef4444', Medium: '#f59e0b', High: '#10b981' };

function GaugeCircle({ value, max = 10, size = 130 }) {
  const numVal = typeof value === 'number' ? value : parseFloat(value) || 0;
  const pct = (numVal / max) * 100;
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white tabular-nums">{numVal.toFixed(1)}</span>
        <span className="text-xs text-gray-500">/ {max}</span>
      </div>
    </div>
  );
}

function ProbabilityBars({ probabilities }) {
  const data = Object.entries(probabilities || {}).map(([name, value]) => ({ name, value: Math.round(value * 100) }));
  return (
    <div className="space-y-3 mt-4">
      {data.map(item => (
        <div key={item.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">{item.name}</span>
            <span className="text-white font-semibold tabular-nums">{item.value}%</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: COLORS[item.name] || '#10b981', transition: 'width 1s ease' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureImportanceChart({ factors }) {
  if (!factors || factors.length === 0) return null;
  const data = factors.slice(0, 10).map(f => ({
    name: f.feature.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: Math.round(f.importance * 100),
  }));
  const CHART_COLORS = ['#10b981','#10b981','#06b6d4','#06b6d4','#8b5cf6','#8b5cf6','#6366f1','#6366f1','#6366f1','#6366f1'];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={180} tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
          formatter={(v) => [`${v}%`, 'Importance']} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i] || '#6366f1'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const readinessConfig = {
  'EV Ready':       { Icon: ShieldCheck, gradient: 'from-emerald-500 to-green-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  'EV READY':       { Icon: ShieldCheck, gradient: 'from-emerald-500 to-green-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  'EV Explorer':    { Icon: Search,      gradient: 'from-cyan-500 to-blue-500',     border: 'border-cyan-500/30',    bg: 'bg-cyan-500/5' },
  'EV EXPLORER':    { Icon: Search,      gradient: 'from-cyan-500 to-blue-500',     border: 'border-cyan-500/30',    bg: 'bg-cyan-500/5' },
  'EV Considering': { Icon: HelpCircle,  gradient: 'from-amber-500 to-yellow-500',  border: 'border-amber-500/30',   bg: 'bg-amber-500/5' },
  'EV CONSIDERING': { Icon: HelpCircle,  gradient: 'from-amber-500 to-yellow-500',  border: 'border-amber-500/30',   bg: 'bg-amber-500/5' },
  'EV Hesitant':    { Icon: AlertTriangle,gradient: 'from-red-500 to-orange-500',    border: 'border-red-500/30',     bg: 'bg-red-500/5' },
  'EV HESITANT':    { Icon: AlertTriangle,gradient: 'from-red-500 to-orange-500',    border: 'border-red-500/30',     bg: 'bg-red-500/5' },
};

export default function Results({ results }) {
  if (!results) return null;

  const adoptionProb = results.adoption_probabilities || {};
  const predictedClass = results.adoption_prediction || 'Medium';
  const maxProb = Math.round((adoptionProb[predictedClass] || 0) * 100);
  const readiness = results.readiness_profile || {};
  const readinessLabel = readiness.label || 'EV Considering';
  const rc = readinessConfig[readinessLabel] || readinessConfig['EV Considering'];
  const ReadinessIcon = rc.Icon;

  return (
    <div className="mt-16 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Your EV Intelligence Report</h2>
        <p className="text-gray-400">Generated from real trained machine learning models</p>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Adoption */}
        <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-emerald-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-emerald-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">EV Adoption Likelihood</span>
          </div>
          <div className={`text-4xl font-extrabold mb-1 tracking-tight ${predictedClass === 'High' ? 'text-emerald-400' : predictedClass === 'Medium' ? 'text-amber-400' : 'text-red-400'}`}>
            {predictedClass.toUpperCase()}
          </div>
          <div className="text-2xl font-bold text-white mb-2 tabular-nums">{maxProb}%</div>
          <ProbabilityBars probabilities={adoptionProb} />
        </div>

        {/* Range Anxiety */}
        <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-cyan-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Battery size={18} className="text-cyan-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Range Anxiety</span>
          </div>
          <div className="flex justify-center py-2">
            <GaugeCircle value={results.range_anxiety_prediction || 0} max={10} />
          </div>
          <div className="text-center text-sm font-medium text-gray-300 mt-2">
            {results.range_anxiety_prediction <= 3 ? 'Low Anxiety (1–3)' : results.range_anxiety_prediction <= 6 ? 'Moderate Anxiety (4–6)' : 'High Anxiety (7–10)'}
          </div>
        </div>

        {/* Energy */}
        <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-violet-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-violet-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Monthly Energy</span>
          </div>
          <div className="text-4xl font-extrabold text-violet-400 mt-6 mb-2 tracking-tight tabular-nums">
            {results.energy_prediction?.toFixed(1) || '—'}
          </div>
          <div className="text-gray-400 text-sm font-medium">kWh / month</div>
        </div>

        {/* Charging Cost */}
        <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-amber-500/30 transition-all shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-amber-400" />
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Monthly Charging Cost</span>
          </div>
          <div className="text-4xl font-extrabold text-amber-400 mt-6 mb-2 tracking-tight tabular-nums">
            ${results.charging_cost_prediction?.toFixed(2) || '—'}
          </div>
          <div className="text-gray-400 text-sm font-medium">per month</div>
        </div>
      </div>

      {/* Readiness Profile */}
      <div className={`rounded-2xl ${rc.bg} border ${rc.border} p-8`}>
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <ReadinessIcon size={26} className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">EV Readiness Profile</div>
            <h3 className={`text-2xl font-bold mb-3`} style={{ background: `linear-gradient(135deg, var(--tw-gradient-from, #10b981), var(--tw-gradient-to, #06b6d4))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {readinessLabel}
            </h3>
            <p className="text-gray-300 leading-relaxed">{readiness.explanation || ''}</p>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      {results.important_factors && results.important_factors.length > 0 && (
        <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-white mb-1">Key Factors Influencing Your Result</h3>
          <p className="text-gray-500 text-sm mb-6">Based on actual feature importance from the trained model</p>
          <FeatureImportanceChart factors={results.important_factors} />
        </div>
      )}
    </div>
  );
}

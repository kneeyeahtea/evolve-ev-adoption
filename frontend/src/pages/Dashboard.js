import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Database, Calendar, Navigation, BookOpen, Leaf, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

function StatCard({ label, value, unit = '', Icon }) {
  return (
    <div className="rounded-xl bg-gray-900/60 border border-gray-800 p-5 hover:border-gray-700 transition-all">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={14} className="text-gray-500" />}
        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}<span className="text-sm text-gray-500 ml-1 font-normal">{unit}</span></div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-gray-700 transition-all">
      <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-gray-300 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-semibold text-sm">{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  const r = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return <text x={x} y={y} fill="#9ca3af" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>{name} ({(percent*100).toFixed(0)}%)</text>;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [clustering, setClustering] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, c] = await Promise.all([api.getDatasetSummary(), api.getClustering()]);
        setSummary(s); setClustering(c);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={40} className="animate-spin text-emerald-500" />
    </div>
  );

  if (!summary) return <div className="text-center py-20 text-gray-400">Failed to load dashboard data. Is the backend running on port 8000?</div>;

  const adoptionData = Object.entries(summary.adoption_distribution || {}).map(([k, v]) => ({ name: k, value: v }));
  const cityData = Object.entries(summary.city_type_distribution || {}).map(([k, v]) => ({ name: k, value: v }));
  const vehicleData = Object.entries(summary.vehicle_type_distribution || {}).map(([k, v]) => ({ name: k, value: v }));
  const educationData = Object.entries(summary.education_distribution || {}).map(([k, v]) => ({ name: k, value: v }));

  const clusterGradients = ['from-emerald-500 to-green-600','from-cyan-500 to-blue-600','from-violet-500 to-purple-600','from-amber-500 to-orange-600'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Insights from {summary.total_records?.toLocaleString()} behavioural records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <StatCard Icon={Database} label="Dataset Size" value={summary.total_records?.toLocaleString()} unit="records" />
        <StatCard Icon={Calendar} label="Avg Age" value={summary.avg_age} unit="yrs" />
        <StatCard Icon={Navigation} label="Avg Commute" value={summary.avg_commute} unit="km" />
        <StatCard Icon={BookOpen} label="Avg EV Knowledge" value={summary.avg_ev_knowledge} unit="/10" />
        <StatCard Icon={Leaf} label="Avg Env. Awareness" value={summary.avg_environmental_awareness} unit="/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Adoption Likelihood Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={adoptionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={50} label={renderLabel} strokeWidth={0}>
                {adoptionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vehicle Type Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vehicleData}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]} barSize={32}>
                {vehicleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="City Type Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={cityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={50} label={renderLabel} strokeWidth={0}>
                {cityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Education Level Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={educationData}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]} barSize={32}>
                {educationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Histograms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {[
          { key: 'age_distribution', title: 'Age Distribution' },
          { key: 'income_distribution', title: 'Income Distribution' },
          { key: 'range_anxiety_distribution', title: 'Range Anxiety Distribution' },
          { key: 'charging_accessibility_distribution', title: 'Charging Accessibility' },
          { key: 'energy_distribution', title: 'Energy Consumption Distribution' },
          { key: 'charging_cost_distribution', title: 'Charging Cost Distribution' },
        ].map(({ key, title }) => {
          const data = (summary[key] || []).map(d => ({ name: d.range, count: d.count }));
          return (
            <ChartCard key={key} title={title}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} angle={-20} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          );
        })}
      </div>

      {/* Clustering */}
      {clustering && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">EV Behaviour Segments</h2>
          <p className="text-gray-500 text-sm mb-6">K-Means clustering ({clustering.n_clusters} segments) using: {clustering.features_used?.join(', ')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {clustering.clusters?.map((cluster, i) => (
              <div key={i} className="rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-gray-700 transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${clusterGradients[i % 4]} flex items-center justify-center text-white font-bold text-sm mb-3 shadow-lg`}>
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{cluster.label}</h3>
                <p className="text-xs text-gray-500 mb-4">{cluster.size?.toLocaleString()} members</p>
                <div className="space-y-2">
                  {clustering.features_used?.map(feat => (
                    <div key={feat} className="flex justify-between text-xs">
                      <span className="text-gray-500 truncate mr-2">{feat.replace(/_/g, ' ')}</span>
                      <span className="text-gray-300 font-medium tabular-nums">{cluster[feat]?.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

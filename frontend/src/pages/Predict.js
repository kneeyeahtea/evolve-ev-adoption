import React, { useState } from 'react';
import { api } from '../services/api';
import Results from '../components/Results';
import { User, Car, Plug, Leaf, Loader2 } from 'lucide-react';

const defaultValues = {
  age: 35,
  annual_income: 45000,
  education_level: 'Bachelor',
  city_type: 'Urban',
  daily_commute_km: 25,
  weekly_travel_distance_km: 175,
  current_vehicle_type: 'Sedan',
  vehicle_age_years: 5,
  fuel_expense_per_month: 200,
  charging_station_accessibility: 5,
  nearest_charging_station_km: 8,
  home_charging_available: 1,
  electricity_cost_per_kwh: 0.15,
  environmental_awareness_score: 6,
  government_incentive_awareness: 5,
  technology_affinity_score: 6,
  range_anxiety_score: 5,
  battery_replacement_concern: 5,
  ev_knowledge_score: 5,
  previous_ev_experience: 0,
};

const educationOptions = ['High School', 'Bachelor', 'Master', 'PhD'];
const cityOptions = ['Urban', 'Suburban', 'Rural'];
const vehicleOptions = ['Sedan', 'SUV', 'Hatchback', 'Truck'];

function SliderField({ label, name, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-sm font-bold text-emerald-400 tabular-nums">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(name, parseFloat(e.target.value))} className="w-full cursor-pointer" />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberField({ label, name, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={e => onChange(name, parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{unit}</span>}
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <select value={value} onChange={e => onChange(name, e.target.value)}
        className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all appearance-none cursor-pointer pr-10">
        {options.map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt}</option>)}
      </select>
    </div>
  );
}

function ToggleField({ label, name, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <button type="button" onClick={() => onChange(name, value === 1 ? 0 : 1)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value === 1 ? 'bg-emerald-500' : 'bg-gray-700'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${value === 1 ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

const sections = [
  { num: '01', title: 'Personal Profile', Icon: User, color: 'emerald', borderColor: 'border-emerald-500/20' },
  { num: '02', title: 'Travel & Vehicle', Icon: Car, color: 'cyan', borderColor: 'border-cyan-500/20' },
  { num: '03', title: 'Charging Infrastructure', Icon: Plug, color: 'violet', borderColor: 'border-violet-500/20' },
  { num: '04', title: 'EV Behaviour', Icon: Leaf, color: 'amber', borderColor: 'border-amber-500/20' },
];

export default function Predict() {
  const [formData, setFormData] = useState(defaultValues);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const data = await api.predict(formData);
      setResults(data);
      setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Discover Your EV Adoption Profile</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Enter a few details to see how machine learning interprets your EV transition profile.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Section 1 */}
          <div className={`rounded-2xl bg-gray-900/60 border ${sections[0].borderColor} p-6`}>
            <h2 className="text-lg font-semibold text-emerald-400 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><User size={16} className="text-emerald-400" /></div>
              Personal Profile
            </h2>
            <div className="space-y-5">
              <SliderField label="Age" name="age" value={formData.age} onChange={handleChange} min={18} max={80} />
              <NumberField label="Annual Income" name="annual_income" value={formData.annual_income} onChange={handleChange} min={5000} max={200000} step={1000} unit="$" />
              <SelectField label="Education Level" name="education_level" value={formData.education_level} onChange={handleChange} options={educationOptions} />
              <SelectField label="City Type" name="city_type" value={formData.city_type} onChange={handleChange} options={cityOptions} />
            </div>
          </div>

          {/* Section 2 */}
          <div className={`rounded-2xl bg-gray-900/60 border ${sections[1].borderColor} p-6`}>
            <h2 className="text-lg font-semibold text-cyan-400 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center"><Car size={16} className="text-cyan-400" /></div>
              Travel & Vehicle
            </h2>
            <div className="space-y-5">
              <SliderField label="Daily Commute" name="daily_commute_km" value={formData.daily_commute_km} onChange={handleChange} min={0} max={100} step={0.5} unit=" km" />
              <NumberField label="Weekly Travel Distance" name="weekly_travel_distance_km" value={formData.weekly_travel_distance_km} onChange={handleChange} min={0} max={700} step={5} unit=" km" />
              <SelectField label="Current Vehicle Type" name="current_vehicle_type" value={formData.current_vehicle_type} onChange={handleChange} options={vehicleOptions} />
              <SliderField label="Vehicle Age" name="vehicle_age_years" value={formData.vehicle_age_years} onChange={handleChange} min={0} max={20} step={0.5} unit=" yrs" />
              <NumberField label="Monthly Fuel Expense" name="fuel_expense_per_month" value={formData.fuel_expense_per_month} onChange={handleChange} min={0} max={1000} step={10} unit="$" />
            </div>
          </div>

          {/* Section 3 */}
          <div className={`rounded-2xl bg-gray-900/60 border ${sections[2].borderColor} p-6`}>
            <h2 className="text-lg font-semibold text-violet-400 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Plug size={16} className="text-violet-400" /></div>
              Charging Infrastructure
            </h2>
            <div className="space-y-5">
              <SliderField label="Charging Station Accessibility" name="charging_station_accessibility" value={formData.charging_station_accessibility} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <NumberField label="Nearest Charging Station" name="nearest_charging_station_km" value={formData.nearest_charging_station_km} onChange={handleChange} min={0} max={50} step={0.5} unit=" km" />
              <ToggleField label="Home Charging Available" name="home_charging_available" value={formData.home_charging_available} onChange={handleChange} />
              <NumberField label="Electricity Cost" name="electricity_cost_per_kwh" value={formData.electricity_cost_per_kwh} onChange={handleChange} min={0.01} max={0.50} step={0.01} unit="$/kWh" />
            </div>
          </div>

          {/* Section 4 */}
          <div className={`rounded-2xl bg-gray-900/60 border ${sections[3].borderColor} p-6`}>
            <h2 className="text-lg font-semibold text-amber-400 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Leaf size={16} className="text-amber-400" /></div>
              EV Behaviour
            </h2>
            <div className="space-y-5">
              <SliderField label="Environmental Awareness" name="environmental_awareness_score" value={formData.environmental_awareness_score} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <SliderField label="Gov. Incentive Awareness" name="government_incentive_awareness" value={formData.government_incentive_awareness} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <SliderField label="Technology Affinity" name="technology_affinity_score" value={formData.technology_affinity_score} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <SliderField label="Range Anxiety" name="range_anxiety_score" value={formData.range_anxiety_score} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <SliderField label="Battery Replacement Concern" name="battery_replacement_concern" value={formData.battery_replacement_concern} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <SliderField label="EV Knowledge" name="ev_knowledge_score" value={formData.ev_knowledge_score} onChange={handleChange} min={1} max={10} step={0.1} unit="/10" />
              <ToggleField label="Previous EV Experience" name="previous_ev_experience" value={formData.previous_ev_experience} onChange={handleChange} />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-sm">{error}</div>
        )}

        <div className="text-center">
          <button type="submit" disabled={loading}
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-gray-900 font-bold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed min-w-[240px]"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
            {loading ? <><Loader2 size={20} className="animate-spin" /> Analyzing...</> : 'Run EV Analysis'}
          </button>
        </div>
      </form>

      <div id="results">{results && <Results results={results} userInput={formData} />}</div>
    </div>
  );
}

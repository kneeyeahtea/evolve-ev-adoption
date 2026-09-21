import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Code2, Palette, BarChart3, Rocket, Brain, Database, ArrowRight, ShieldCheck } from 'lucide-react';

const techStack = [
  { name: 'React', desc: 'Frontend UI library', Icon: Code2 },
  { name: 'Tailwind CSS', desc: 'Utility-first CSS framework', Icon: Palette },
  { name: 'Recharts', desc: 'React charting library', Icon: BarChart3 },
  { name: 'FastAPI', desc: 'Python web framework', Icon: Rocket },
  { name: 'scikit-learn', desc: 'Machine learning library', Icon: Brain },
  { name: 'pandas & NumPy', desc: 'Data processing', Icon: Database },
];

const modelDetails = [
  { title: 'EV Adoption Likelihood', type: 'Multiclass Classification', target: 'ev_adoption_likelihood', classes: 'Low / Medium / High', models: 'Logistic Regression, Decision Tree, Random Forest, Gradient Boosting', selection: 'Best F1 Score on validation set' },
  { title: 'Range Anxiety Score', type: 'Regression', target: 'range_anxiety_score', classes: '1 – 10 scale', models: 'Linear Regression, Random Forest, Gradient Boosting', selection: 'Best R² on validation set' },
  { title: 'Monthly Energy Consumption', type: 'Regression', target: 'monthly_energy_consumption_kwh', classes: 'kWh / month', models: 'Linear Regression, Random Forest, Gradient Boosting', selection: 'Best R² on validation set' },
  { title: 'Monthly Charging Cost', type: 'Regression', target: 'monthly_charging_cost', classes: '$ / month', models: 'Linear Regression, Random Forest, Gradient Boosting', selection: 'Best R² on validation set' },
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>About EVOLVE</h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">EV Adoption Behaviour Intelligence — a machine learning-powered platform for understanding the electric vehicle transition.</p>
      </div>

      <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-8 mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">What is EVOLVE?</h2>
        <div className="text-gray-300 space-y-4 leading-relaxed text-sm">
          <p>EVOLVE analyses a dataset of 50,000 behavioural records to understand patterns in EV adoption, range anxiety, energy consumption, and charging behaviour. It trains multiple machine learning models, compares their performance, and deploys the best-performing model for each prediction task.</p>
          <p>Users can enter their personal profile, commuting habits, charging infrastructure access, and EV-related attitudes to receive personalised predictions powered by real trained ML models.</p>
          <p>All predictions, metrics, feature importances, and visualisations are derived from actual model outputs — nothing is hard-coded or fabricated.</p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map(t => (
            <div key={t.name} className="rounded-xl bg-gray-900/60 border border-gray-800 p-5 flex items-center gap-4 hover:border-gray-700 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <t.Icon size={20} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">ML Models</h2>
        <div className="space-y-4">
          {modelDetails.map(m => (
            <div key={m.title} className="rounded-xl bg-gray-900/60 border border-gray-800 p-6 hover:border-gray-700 transition-all">
              <h3 className="text-base font-semibold text-emerald-400 mb-3">{m.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-500">Type: </span><span className="text-gray-300">{m.type}</span></div>
                <div><span className="text-gray-500">Target: </span><span className="text-gray-300 font-mono text-xs">{m.target}</span></div>
                <div><span className="text-gray-500">Output: </span><span className="text-gray-300">{m.classes}</span></div>
                <div><span className="text-gray-500">Selection: </span><span className="text-gray-300">{m.selection}</span></div>
                <div className="sm:col-span-2"><span className="text-gray-500">Models: </span><span className="text-gray-300">{m.models}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-8 mb-10">
        <div className="flex items-start gap-4">
          <ShieldCheck size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Target Leakage Prevention</h2>
            <p className="text-gray-300 leading-relaxed text-sm">Each prediction model uses a carefully selected subset of features that excludes the target variable and related variables that could cause data leakage. For example, when predicting adoption likelihood, the model does not use monthly energy consumption or charging cost as inputs.</p>
          </div>
        </div>
      </div>

      <div className="text-center py-10">
        <Link to="/predict"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-gray-900 font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
          Try the Prediction Tool <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Battery, BarChart3, DollarSign, ArrowRight, Users, Brain, LineChart } from 'lucide-react';

const predictionCards = [
  {
    title: 'EV Adoption Likelihood',
    desc: 'Classify adoption potential as Low, Medium, or High using ensemble ML models.',
    Icon: Zap,
    gradient: 'from-emerald-500 to-green-600',
    glow: 'shadow-emerald-500/20',
  },
  {
    title: 'Range Anxiety Score',
    desc: 'Predict range anxiety levels on a 1–10 scale based on behavioural factors.',
    Icon: Battery,
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-cyan-500/20',
  },
  {
    title: 'Energy Consumption',
    desc: 'Estimate monthly energy consumption in kWh based on commute and usage patterns.',
    Icon: BarChart3,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
  },
  {
    title: 'Charging Cost',
    desc: 'Forecast monthly charging expenses based on infrastructure and electricity pricing.',
    Icon: DollarSign,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/20',
  },
];

const pipelineSteps = [
  { label: 'People', Icon: Users },
  { label: 'Behaviour', Icon: LineChart },
  { label: 'ML Models', Icon: Brain },
  { label: 'EV Intelligence', Icon: Zap },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <Zap size={14} /> EV Adoption Behaviour Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <span style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EVOLVE
              </span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-300 leading-relaxed">
              Understand the Behaviour Behind the EV Transition.
            </p>
            <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Machine learning-powered insights into EV adoption, range anxiety, energy demand and charging behaviour.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/predict"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-gray-900 font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
              >
                Run Prediction <ArrowRight size={18} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-lg hover:bg-white/5 hover:border-gray-500 transition-all duration-300"
              >
                Explore Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Visual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3">
          {pipelineSteps.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-2.5 px-6 py-4 rounded-xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-all">
                <step.Icon size={24} className="text-emerald-400" />
                <span className="text-sm font-medium text-gray-300">{step.label}</span>
              </div>
              {i < pipelineSteps.length - 1 && (
                <ArrowRight size={20} className="text-emerald-600 rotate-90 sm:rotate-0 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Prediction Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            One Dataset. Multiple Predictions.
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Our ML pipeline analyzes 50,000 behavioural records to power four distinct prediction models.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {predictionCards.map(card => (
            <div
              key={card.title}
              className={`group relative rounded-2xl bg-gray-900/60 border border-gray-800 p-6 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.glow}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <card.Icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b border-gray-800/60 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '50,000', label: 'Behavioural Records' },
              { val: '4', label: 'ML Models' },
              { val: '13', label: 'Algorithms Compared' },
              { val: 'Real-time', label: 'Predictions' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-emerald-400">{s.val}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-500" />
              <span className="text-gray-500 text-sm">EVOLVE — EV Adoption Behaviour Intelligence</span>
            </div>
            <span className="text-gray-600 text-sm">Built with scikit-learn, FastAPI & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

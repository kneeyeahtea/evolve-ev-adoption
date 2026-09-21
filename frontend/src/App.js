import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';
import ModelLab from './pages/ModelLab';
import Insights from './pages/Insights';
import About from './pages/About';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/predict', label: 'Predict' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/model-lab', label: 'Model Lab' },
  { to: '/insights', label: 'Insights' },
  { to: '/about', label: 'About' },
];

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-900/30" style={{ background: 'rgba(10,14,23,0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              <Zap size={18} className="text-gray-900" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ background: 'linear-gradient(90deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EVOLVE
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white p-1">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-800 pt-3">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen text-white" style={{ backgroundColor: '#0a0e17' }}>
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/model-lab" element={<ModelLab />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

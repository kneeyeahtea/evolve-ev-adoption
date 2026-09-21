const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]'
);

// Support both Create React App (REACT_APP_API_URL) and Vite (VITE_API_URL)
let ENV_API_URL = process.env.REACT_APP_API_URL;
try {
  if (!ENV_API_URL && typeof import.meta !== 'undefined' && import.meta.env) {
    ENV_API_URL = import.meta.env.VITE_API_URL;
  }
} catch (e) {
  // Ignored in environments where import.meta is not transformed
}

// Public production backend URL
const PROD_BACKEND_URL = 'https://situated-bridge-september-pools.trycloudflare.com';

const API_BASE = ENV_API_URL || (isLocalhost ? 'http://localhost:8000' : PROD_BACKEND_URL);

export const api = {
  async predict(userData) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Server error' }));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  async predictAdoption(userData) {
    const res = await fetch(`${API_BASE}/predict/adoption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Adoption prediction failed');
    return res.json();
  },

  async predictRangeAnxiety(userData) {
    const res = await fetch(`${API_BASE}/predict/range-anxiety`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Range anxiety prediction failed');
    return res.json();
  },

  async predictEnergy(userData) {
    const res = await fetch(`${API_BASE}/predict/energy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Energy prediction failed');
    return res.json();
  },

  async predictChargingCost(userData) {
    const res = await fetch(`${API_BASE}/predict/charging-cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error('Charging cost prediction failed');
    return res.json();
  },

  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/model-metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },

  async getFeatureImportance() {
    const res = await fetch(`${API_BASE}/feature-importance`);
    if (!res.ok) throw new Error('Failed to fetch feature importance');
    return res.json();
  },

  async getDatasetSummary() {
    const res = await fetch(`${API_BASE}/dataset-summary`);
    if (!res.ok) throw new Error('Failed to fetch dataset summary');
    return res.json();
  },

  async getInsights() {
    const res = await fetch(`${API_BASE}/insights`);
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  async getClustering() {
    const res = await fetch(`${API_BASE}/clustering`);
    if (!res.ok) throw new Error('Failed to fetch clustering');
    return res.json();
  },
};

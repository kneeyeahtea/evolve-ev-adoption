"""
EVOLVE - EV Adoption Behaviour Intelligence
FastAPI Backend Application
"""
import os
import json
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'saved_models')
DATA_PATH = os.path.join(BASE_DIR, 'data', 'global_ev_adoption_behavior_2026.csv')

app = FastAPI(title="EVOLVE - EV Adoption Behaviour Intelligence API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model storage
models = {}
metadata = {}


def load_models():
    """Load all saved models and metadata at startup."""
    global models, metadata

    model_files = {
        'adoption': 'adoption_model.joblib',
        'adoption_le': 'adoption_label_encoder.joblib',
        'range_anxiety': 'range_anxiety_model.joblib',
        'energy': 'energy_model.joblib',
        'charging_cost': 'charging_cost_model.joblib',
    }

    for key, filename in model_files.items():
        path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(path):
            models[key] = joblib.load(path)
            print(f"Loaded {key} model")

    # Load metadata
    meta_files = {
        'model_metrics': 'model_metrics.json',
        'dataset_summary': 'dataset_summary.json',
        'feature_config': 'feature_config.json',
        'insights': 'insights.json',
        'clustering': 'clustering.json',
    }
    for key, filename in meta_files.items():
        path = os.path.join(MODEL_DIR, filename)
        if os.path.exists(path):
            with open(path, 'r') as f:
                metadata[key] = json.load(f)
            print(f"Loaded {key} metadata")


@app.on_event("startup")
async def startup():
    """On startup, train models if needed, then load them."""
    if not os.path.exists(os.path.join(MODEL_DIR, 'adoption_model.joblib')):
        print("Models not found. Training...")
        from train import train_all
        train_all()
    load_models()


# === Pydantic Models ===

class UserProfile(BaseModel):
    age: float
    annual_income: float
    education_level: str
    city_type: str
    daily_commute_km: float
    weekly_travel_distance_km: float
    current_vehicle_type: str
    vehicle_age_years: float
    fuel_expense_per_month: float
    charging_station_accessibility: float
    nearest_charging_station_km: float
    home_charging_available: int
    electricity_cost_per_kwh: float
    environmental_awareness_score: float
    government_incentive_awareness: float
    technology_affinity_score: float
    range_anxiety_score: float
    battery_replacement_concern: float
    ev_knowledge_score: float
    previous_ev_experience: int


def user_to_df(user: UserProfile) -> pd.DataFrame:
    """Convert user profile to DataFrame."""
    return pd.DataFrame([user.model_dump()])


def derive_readiness_profile(adoption_pred, adoption_probs, range_anxiety, energy, cost, user: UserProfile):
    """Derive EV readiness profile from model outputs and user inputs."""
    # Get the probability of 'High' adoption
    high_prob = adoption_probs.get('High', 0)
    medium_prob = adoption_probs.get('Medium', 0)

    # Derive profile label
    if high_prob > 0.6:
        label = "EV Ready"
        base = "Your profile shows strong EV adoption likelihood."
    elif high_prob > 0.35 or (high_prob + medium_prob > 0.7):
        label = "EV Explorer"
        base = "Your profile shows moderate-to-good adoption likelihood with promising indicators."
    elif medium_prob > 0.4:
        label = "EV Considering"
        base = "Your profile indicates you're weighing the EV transition with some reservations."
    else:
        label = "EV Hesitant"
        base = "Your profile suggests several barriers to EV adoption currently."

    # Build explanation from actual inputs
    factors = []
    if user.ev_knowledge_score >= 7:
        factors.append("strong EV knowledge")
    elif user.ev_knowledge_score <= 3:
        factors.append("limited EV knowledge")

    if user.charging_station_accessibility >= 7:
        factors.append("good charging infrastructure access")
    elif user.charging_station_accessibility <= 3:
        factors.append("limited charging infrastructure access")

    if user.environmental_awareness_score >= 7:
        factors.append("high environmental awareness")

    if user.technology_affinity_score >= 7:
        factors.append("strong technology affinity")

    if range_anxiety > 7:
        factors.append("notable range anxiety concerns")
    elif range_anxiety < 3:
        factors.append("minimal range anxiety")

    if user.home_charging_available == 1:
        factors.append("home charging availability")
    else:
        factors.append("no home charging setup")

    if user.previous_ev_experience == 1:
        factors.append("prior EV experience")

    explanation = base
    if factors:
        explanation += " Key factors include: " + ", ".join(factors) + "."

    return {
        'label': label,
        'explanation': explanation
    }


# === API Endpoints ===

@app.get("/")
async def root():
    return {"message": "EVOLVE - EV Adoption Behaviour Intelligence API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "EVOLVE - EV Adoption Behaviour Intelligence API",
        "models_loaded": {
            "adoption": "adoption" in models,
            "range_anxiety": "range_anxiety" in models,
            "energy": "energy" in models,
            "charging_cost": "charging_cost" in models
        }
    }


@app.post("/predict")
async def predict(user: UserProfile):
    """Combined prediction endpoint."""
    try:
        user_df = user_to_df(user)
        result = {}

        # 1. Adoption prediction
        if 'adoption' in models and 'adoption_le' in models:
            config = metadata.get('feature_config', {})
            adoption_features = config.get('adoption', list(user.model_dump().keys()))

            X_adoption = user_df[adoption_features]
            pred_encoded = models['adoption'].predict(X_adoption)[0]
            proba = models['adoption'].predict_proba(X_adoption)[0]
            le = models['adoption_le']
            pred_label = le.inverse_transform([pred_encoded])[0]
            proba_dict = {le.inverse_transform([i])[0]: round(float(p), 4) for i, p in enumerate(proba)}

            result['adoption_prediction'] = pred_label
            result['adoption_probabilities'] = proba_dict

        # 2. Range anxiety prediction
        if 'range_anxiety' in models:
            config = metadata.get('feature_config', {})
            ra_features = config.get('range_anxiety', [])
            X_ra = user_df[ra_features]
            ra_pred = float(models['range_anxiety'].predict(X_ra)[0])
            ra_pred = max(1, min(10, round(ra_pred, 1)))
            result['range_anxiety_prediction'] = ra_pred

        # 3. Energy prediction
        if 'energy' in models:
            config = metadata.get('feature_config', {})
            energy_features = config.get('energy', [])
            X_energy = user_df[energy_features]
            energy_pred = float(models['energy'].predict(X_energy)[0])
            energy_pred = max(0, round(energy_pred, 1))
            result['energy_prediction'] = energy_pred

        # 4. Charging cost prediction
        if 'charging_cost' in models:
            config = metadata.get('feature_config', {})
            cc_features = config.get('charging_cost', [])
            X_cc = user_df[cc_features]
            cc_pred = float(models['charging_cost'].predict(X_cc)[0])
            cc_pred = max(0, round(cc_pred, 2))
            result['charging_cost_prediction'] = cc_pred

        # 5. Readiness profile
        readiness = derive_readiness_profile(
            result.get('adoption_prediction', 'Medium'),
            result.get('adoption_probabilities', {}),
            result.get('range_anxiety_prediction', 5),
            result.get('energy_prediction', 200),
            result.get('charging_cost_prediction', 30),
            user
        )
        result['readiness_profile'] = readiness

        # 6. Feature importance (from adoption model)
        metrics = metadata.get('model_metrics', {})
        adoption_metrics = metrics.get('adoption', {})
        result['important_factors'] = adoption_metrics.get('feature_importance', [])

        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/adoption")
async def predict_adoption_endpoint(user: UserProfile):
    """Predict only EV adoption likelihood."""
    try:
        user_df = user_to_df(user)
        if 'adoption' not in models or 'adoption_le' not in models:
            raise HTTPException(status_code=503, detail="Adoption model not loaded")
        config = metadata.get('feature_config', {})
        adoption_features = config.get('adoption', list(user.model_dump().keys()))
        X_adoption = user_df[adoption_features]
        pred_encoded = models['adoption'].predict(X_adoption)[0]
        proba = models['adoption'].predict_proba(X_adoption)[0]
        le = models['adoption_le']
        pred_label = le.inverse_transform([pred_encoded])[0]
        proba_dict = {le.inverse_transform([i])[0]: round(float(p), 4) for i, p in enumerate(proba)}
        return {
            "adoption_prediction": pred_label,
            "adoption_probabilities": proba_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/range-anxiety")
async def predict_range_anxiety_endpoint(user: UserProfile):
    """Predict only range anxiety score."""
    try:
        user_df = user_to_df(user)
        if 'range_anxiety' not in models:
            raise HTTPException(status_code=503, detail="Range anxiety model not loaded")
        config = metadata.get('feature_config', {})
        ra_features = config.get('range_anxiety', [])
        X_ra = user_df[ra_features]
        ra_pred = float(models['range_anxiety'].predict(X_ra)[0])
        ra_pred = max(1.0, min(10.0, round(ra_pred, 1)))
        return {"range_anxiety_prediction": ra_pred}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/energy")
async def predict_energy_endpoint(user: UserProfile):
    """Predict only monthly energy consumption."""
    try:
        user_df = user_to_df(user)
        if 'energy' not in models:
            raise HTTPException(status_code=503, detail="Energy model not loaded")
        config = metadata.get('feature_config', {})
        energy_features = config.get('energy', [])
        X_energy = user_df[energy_features]
        energy_pred = float(models['energy'].predict(X_energy)[0])
        energy_pred = max(0.0, round(energy_pred, 1))
        return {"energy_prediction": energy_pred}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/charging-cost")
async def predict_charging_cost_endpoint(user: UserProfile):
    """Predict only monthly charging cost."""
    try:
        user_df = user_to_df(user)
        if 'charging_cost' not in models:
            raise HTTPException(status_code=503, detail="Charging cost model not loaded")
        config = metadata.get('feature_config', {})
        cc_features = config.get('charging_cost', [])
        X_cc = user_df[cc_features]
        cc_pred = float(models['charging_cost'].predict(X_cc)[0])
        cc_pred = max(0.0, round(cc_pred, 2))
        return {"charging_cost_prediction": cc_pred}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model-metrics")
async def get_model_metrics():
    if 'model_metrics' not in metadata:
        raise HTTPException(status_code=404, detail="Model metrics not found")
    return metadata['model_metrics']


@app.get("/feature-importance")
async def get_feature_importance():
    metrics = metadata.get('model_metrics', {})
    result = {}
    for key in ['adoption', 'range_anxiety', 'energy', 'charging_cost']:
        if key in metrics:
            result[key] = metrics[key].get('feature_importance', [])
    return result


@app.get("/dataset-summary")
async def get_dataset_summary():
    if 'dataset_summary' not in metadata:
        raise HTTPException(status_code=404, detail="Dataset summary not found")
    return metadata['dataset_summary']


@app.get("/insights")
async def get_insights():
    if 'insights' not in metadata:
        raise HTTPException(status_code=404, detail="Insights not found")
    return metadata['insights']


@app.get("/clustering")
async def get_clustering():
    if 'clustering' not in metadata:
        raise HTTPException(status_code=404, detail="Clustering data not found")
    return metadata['clustering']


if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

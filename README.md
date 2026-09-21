# EVOLVE — EV Adoption Behaviour Intelligence

A full-stack ML web application that trains real machine learning models on EV adoption behaviour data and provides personalised predictions through an interactive React frontend.

## Features

- **4 ML Predictions**: EV Adoption Likelihood, Range Anxiety, Energy Consumption, Charging Cost
- **Real trained models**: scikit-learn pipelines with proper preprocessing
- **Model comparison**: Multiple algorithms compared, best selected by validation metrics
- **Interactive dashboard**: Dataset analytics with Recharts visualisations
- **Behavioural segmentation**: K-Means clustering of EV behaviour patterns
- **Data-driven insights**: Correlation analysis and feature relationships
- **Model Lab**: Full ML pipeline visualisation with actual metrics
- **EV Readiness Profile**: Derived interpretation of model outputs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS v4, Recharts |
| Backend | Python, FastAPI |
| ML | scikit-learn, pandas, NumPy |
| Persistence | joblib (trained pipelines) |

## Project Structure

```
ev_adoption_app/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── train.py            # ML training script
│   ├── data/               # Dataset CSV
│   ├── saved_models/       # Trained models & metadata
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main app with routing
│   │   ├── pages/          # Home, Predict, Dashboard, ModelLab, Insights, About
│   │   ├── components/     # Results display component
│   │   └── services/       # API client
│   └── package.json
└── README.md
```

## Setup & Run

### 1. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Train models (first time only)

```bash
cd backend
python train.py
```

This will:
- Load the dataset (50,000 records)
- Train 4 sets of ML models
- Compare and select best models
- Save trained pipelines, metrics, and metadata

### 3. Start the backend

```bash
cd backend
python app.py
```

The API will be available at `http://localhost:8000`.

If models are not already trained, they will be trained automatically on first startup.

### 4. Install frontend dependencies

```bash
cd frontend
npm install
```

### 5. Start the frontend

```bash
cd frontend
npm start
```

The app will be available at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Combined prediction (all 4 models + readiness profile + feature importance) |
| POST | `/predict/adoption` | Target A: EV adoption likelihood prediction & class probabilities |
| POST | `/predict/range-anxiety` | Target B: Range anxiety score prediction (1–10) |
| POST | `/predict/energy` | Target C: Monthly energy consumption prediction (kWh/month) |
| POST | `/predict/charging-cost` | Target D: Monthly charging cost prediction ($/month) |
| GET | `/model-metrics` | All model comparison metrics (Accuracy, F1, MAE, RMSE, R²) |
| GET | `/feature-importance` | Feature importance for each trained model |
| GET | `/dataset-summary` | Dataset statistics and distributions (50k records) |
| GET | `/insights` | Data-driven insights & correlation matrix |
| GET | `/clustering` | K-Means behavioural segmentation (4 clusters) |

## Models

### EV Adoption Likelihood (Classification)
- Logistic Regression, Decision Tree, Random Forest, Gradient Boosting
- Selected by best F1 score

### Range Anxiety (Regression)
- Linear Regression, Random Forest, Gradient Boosting
- Selected by best R²

### Energy Consumption (Regression)
- Linear Regression, Random Forest, Gradient Boosting
- Selected by best R²

### Charging Cost (Regression)
- Linear Regression, Random Forest, Gradient Boosting
- Selected by best R²

## Leakage Prevention

Each model uses a carefully curated feature set that excludes:
- The target variable itself
- Other target variables that could leak information

## Dataset

`global_ev_adoption_behavior_2026.csv` — 50,000 synthetic behavioural records with 23 features covering demographics, commuting, charging infrastructure, environmental attitudes, and EV experience.

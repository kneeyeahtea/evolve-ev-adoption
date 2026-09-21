"""
EVOLVE - EV Adoption Behaviour Intelligence
Training script: trains all ML models and saves pipelines + metrics.
"""
import os
import json
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier,
    RandomForestRegressor, GradientBoostingRegressor
)
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_absolute_error, mean_squared_error, r2_score
)

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'global_ev_adoption_behavior_2026.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)


def load_data():
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def get_dataset_summary(df):
    """Generate dataset summary statistics from actual data."""
    summary = {
        'total_records': int(df.shape[0]),
        'total_features': int(df.shape[1]),
        'avg_age': round(float(df['age'].mean()), 1),
        'avg_income': round(float(df['annual_income'].mean()), 0),
        'avg_commute': round(float(df['daily_commute_km'].mean()), 1),
        'avg_ev_knowledge': round(float(df['ev_knowledge_score'].mean()), 1),
        'avg_environmental_awareness': round(float(df['environmental_awareness_score'].mean()), 1),
        'avg_range_anxiety': round(float(df['range_anxiety_score'].mean()), 1),
        'avg_technology_affinity': round(float(df['technology_affinity_score'].mean()), 1),
        'avg_energy_consumption': round(float(df['monthly_energy_consumption_kwh'].mean()), 1),
        'avg_charging_cost': round(float(df['monthly_charging_cost'].mean()), 1),
    }

    # Distributions
    summary['adoption_distribution'] = df['ev_adoption_likelihood'].value_counts().to_dict()
    summary['city_type_distribution'] = df['city_type'].value_counts().to_dict()
    summary['vehicle_type_distribution'] = df['current_vehicle_type'].value_counts().to_dict()
    summary['education_distribution'] = df['education_level'].value_counts().to_dict()
    summary['home_charging_distribution'] = df['home_charging_available'].value_counts().to_dict()

    # Histograms (binned)
    for col, key in [
        ('age', 'age_distribution'),
        ('annual_income', 'income_distribution'),
        ('range_anxiety_score', 'range_anxiety_distribution'),
        ('charging_station_accessibility', 'charging_accessibility_distribution'),
        ('monthly_energy_consumption_kwh', 'energy_distribution'),
        ('monthly_charging_cost', 'charging_cost_distribution'),
        ('daily_commute_km', 'commute_distribution'),
    ]:
        counts, edges = np.histogram(df[col].dropna(), bins=10)
        summary[key] = [
            {'range': f"{edges[i]:.1f}-{edges[i+1]:.1f}", 'count': int(counts[i])}
            for i in range(len(counts))
        ]

    return summary


def compute_insights(df):
    """Generate data-driven insights from dataset correlations."""
    insights = []

    # 1. Charging accessibility vs adoption
    groups = df.groupby('ev_adoption_likelihood')['charging_station_accessibility'].mean()
    insights.append({
        'title': 'Charging Accessibility & Adoption Likelihood',
        'description': 'Average charging station accessibility score by adoption likelihood level.',
        'type': 'bar',
        'data': [{'category': k, 'value': round(v, 2)} for k, v in groups.items()]
    })

    # 2. EV Knowledge vs adoption
    groups = df.groupby('ev_adoption_likelihood')['ev_knowledge_score'].mean()
    insights.append({
        'title': 'EV Knowledge & Adoption Likelihood',
        'description': 'Average EV knowledge score by adoption likelihood level.',
        'type': 'bar',
        'data': [{'category': k, 'value': round(v, 2)} for k, v in groups.items()]
    })

    # 3. Range anxiety vs daily commute (binned)
    df_temp = df.copy()
    df_temp['commute_bin'] = pd.cut(df_temp['daily_commute_km'], bins=5)
    groups = df_temp.groupby('commute_bin', observed=True)['range_anxiety_score'].mean()
    insights.append({
        'title': 'Range Anxiety vs Daily Commute',
        'description': 'Average range anxiety score across commute distance ranges.',
        'type': 'bar',
        'data': [{'category': str(k), 'value': round(v, 2)} for k, v in groups.items()]
    })

    # 4. Home charging vs charging cost
    groups = df.groupby('home_charging_available')['monthly_charging_cost'].mean()
    insights.append({
        'title': 'Home Charging vs Monthly Charging Cost',
        'description': 'Average monthly charging cost for users with and without home charging.',
        'type': 'bar',
        'data': [{'category': 'No Home Charging' if k == 0 else 'Has Home Charging', 'value': round(v, 2)} for k, v in groups.items()]
    })

    # 5. Technology affinity vs adoption
    groups = df.groupby('ev_adoption_likelihood')['technology_affinity_score'].mean()
    insights.append({
        'title': 'Technology Affinity & Adoption Likelihood',
        'description': 'Average technology affinity score by adoption likelihood level.',
        'type': 'bar',
        'data': [{'category': k, 'value': round(v, 2)} for k, v in groups.items()]
    })

    # 6. Environmental awareness vs adoption
    groups = df.groupby('ev_adoption_likelihood')['environmental_awareness_score'].mean()
    insights.append({
        'title': 'Environmental Awareness & Adoption Likelihood',
        'description': 'Average environmental awareness score by adoption likelihood level.',
        'type': 'bar',
        'data': [{'category': k, 'value': round(v, 2)} for k, v in groups.items()]
    })

    # 7. Correlation matrix of key numeric features
    numeric_cols = [
        'age', 'annual_income', 'daily_commute_km', 'charging_station_accessibility',
        'environmental_awareness_score', 'technology_affinity_score',
        'range_anxiety_score', 'ev_knowledge_score', 'monthly_energy_consumption_kwh',
        'monthly_charging_cost'
    ]
    corr = df[numeric_cols].corr()
    corr_data = []
    for c1 in numeric_cols:
        for c2 in numeric_cols:
            corr_data.append({'x': c1, 'y': c2, 'value': round(corr.loc[c1, c2], 3)})
    insights.append({
        'title': 'Feature Correlation Matrix',
        'description': 'Pairwise correlations between key numeric features.',
        'type': 'heatmap',
        'data': corr_data,
        'features': numeric_cols
    })

    return insights


def run_clustering(df):
    """K-Means clustering for behavioural segmentation."""
    cluster_features = [
        'environmental_awareness_score', 'technology_affinity_score',
        'ev_knowledge_score', 'range_anxiety_score',
        'charging_station_accessibility', 'daily_commute_km'
    ]
    # Add previous_ev_experience if it exists as numeric
    if 'previous_ev_experience' in df.columns:
        cluster_features.append('previous_ev_experience')

    X_cluster = df[cluster_features].dropna()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_cluster)

    # Use 4 clusters
    n_clusters = 4
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    # Compute cluster characteristics
    X_cluster_df = X_cluster.copy()
    X_cluster_df['cluster'] = labels

    clusters = []
    for i in range(n_clusters):
        cluster_data = X_cluster_df[X_cluster_df['cluster'] == i]
        profile = {}
        for feat in cluster_features:
            profile[feat] = round(float(cluster_data[feat].mean()), 2)
        profile['size'] = int(len(cluster_data))
        profile['cluster_id'] = i

        # Generate a label based on dominant characteristics
        label = generate_cluster_label(profile, cluster_features)
        profile['label'] = label
        clusters.append(profile)

    return {
        'n_clusters': n_clusters,
        'features_used': cluster_features,
        'clusters': clusters
    }


def generate_cluster_label(profile, features):
    """Generate a descriptive label based on cluster characteristics."""
    # Find the most distinctive traits
    high_env = profile.get('environmental_awareness_score', 5) > 6.5
    high_tech = profile.get('technology_affinity_score', 5) > 6.5
    high_anxiety = profile.get('range_anxiety_score', 5) > 6.5
    low_charging = profile.get('charging_station_accessibility', 5) < 4.5
    high_knowledge = profile.get('ev_knowledge_score', 5) > 6.5
    high_commute = profile.get('daily_commute_km', 25) > 35

    if high_tech and high_knowledge:
        return "Tech-Savvy EV Enthusiast"
    elif high_env and not high_anxiety:
        return "Environmentally Driven"
    elif high_anxiety or low_charging:
        return "Charging-Constrained"
    elif high_commute:
        return "High-Commute Pragmatist"
    else:
        return "EV-Cautious Observer"


# ===== MODEL TRAINING =====

# Define feature sets for each target, carefully avoiding leakage
ALL_FEATURES = [
    'age', 'annual_income', 'education_level', 'city_type',
    'daily_commute_km', 'weekly_travel_distance_km', 'current_vehicle_type',
    'vehicle_age_years', 'fuel_expense_per_month', 'charging_station_accessibility',
    'nearest_charging_station_km', 'home_charging_available', 'electricity_cost_per_kwh',
    'environmental_awareness_score', 'government_incentive_awareness',
    'technology_affinity_score', 'range_anxiety_score', 'battery_replacement_concern',
    'ev_knowledge_score', 'previous_ev_experience'
]

CATEGORICAL_FEATURES = ['education_level', 'city_type', 'current_vehicle_type']
NUMERICAL_FEATURES = [f for f in ALL_FEATURES if f not in CATEGORICAL_FEATURES]

# For each target, exclude the target and related leaky features
ADOPTION_FEATURES = [f for f in ALL_FEATURES if f not in [
    'ev_adoption_likelihood', 'monthly_energy_consumption_kwh', 'monthly_charging_cost'
]]

RANGE_ANXIETY_FEATURES = [f for f in ALL_FEATURES if f not in [
    'range_anxiety_score', 'ev_adoption_likelihood',
    'monthly_energy_consumption_kwh', 'monthly_charging_cost'
]]

ENERGY_FEATURES = [f for f in ALL_FEATURES if f not in [
    'monthly_energy_consumption_kwh', 'monthly_charging_cost'
]]

CHARGING_COST_FEATURES = [f for f in ALL_FEATURES if f not in [
    'monthly_charging_cost', 'monthly_energy_consumption_kwh'
]]


def build_preprocessor(feature_list):
    """Build a ColumnTransformer for the given feature list."""
    num_feats = [f for f in feature_list if f not in CATEGORICAL_FEATURES]
    cat_feats = [f for f in feature_list if f in CATEGORICAL_FEATURES]

    transformers = []
    if num_feats:
        num_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ])
        transformers.append(('num', num_pipeline, num_feats))

    if cat_feats:
        cat_pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
        transformers.append(('cat', cat_pipeline, cat_feats))

    return ColumnTransformer(transformers=transformers)


def get_feature_names(preprocessor, feature_list):
    """Extract feature names after transformation."""
    names = []
    for name, transformer, features in preprocessor.transformers_:
        if name == 'num':
            names.extend(features)
        elif name == 'cat':
            encoder = transformer.named_steps['encoder']
            names.extend(encoder.get_feature_names_out(features).tolist())
    return names


def train_adoption_model(df):
    """Train and compare classification models for EV adoption likelihood."""
    print("\n=== Training EV Adoption Likelihood Models ===")
    features = ADOPTION_FEATURES
    X = df[features].copy()
    y = df['ev_adoption_likelihood'].copy()

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    preprocessor = build_preprocessor(features)

    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Decision Tree': DecisionTreeClassifier(random_state=42, max_depth=10),
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
    }

    results = {}
    best_score = -1
    best_name = None
    best_pipeline = None

    for name, model in models.items():
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('classifier', model)
        ])
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        results[name] = {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4)
        }
        print(f"  {name}: Accuracy={acc:.4f}, F1={f1:.4f}")

        if f1 > best_score:
            best_score = f1
            best_name = name
            best_pipeline = pipeline

    print(f"  Best model: {best_name} (F1={best_score:.4f})")

    # Get feature importance
    importance = get_importance(best_pipeline, features)

    # Save
    joblib.dump(best_pipeline, os.path.join(MODEL_DIR, 'adoption_model.joblib'))
    joblib.dump(le, os.path.join(MODEL_DIR, 'adoption_label_encoder.joblib'))

    return {
        'best_model': best_name,
        'comparison': results,
        'feature_importance': importance,
        'features_used': features,
        'classes': le.classes_.tolist()
    }


def train_regression_model(df, target, feature_list, model_name_prefix):
    """Train and compare regression models for a numeric target."""
    print(f"\n=== Training {model_name_prefix} Models ===")
    X = df[feature_list].copy()
    y = df[target].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    preprocessor = build_preprocessor(feature_list)

    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
    }

    results = {}
    best_score = -999
    best_name = None
    best_pipeline = None

    for name, model in models.items():
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results[name] = {
            'mae': round(mae, 4),
            'rmse': round(rmse, 4),
            'r2': round(r2, 4)
        }
        print(f"  {name}: MAE={mae:.4f}, RMSE={rmse:.4f}, R²={r2:.4f}")

        if r2 > best_score:
            best_score = r2
            best_name = name
            best_pipeline = pipeline

    print(f"  Best model: {best_name} (R²={best_score:.4f})")

    importance = get_importance(best_pipeline, feature_list)

    save_name = model_name_prefix.lower().replace(' ', '_')
    joblib.dump(best_pipeline, os.path.join(MODEL_DIR, f'{save_name}_model.joblib'))

    return {
        'best_model': best_name,
        'comparison': results,
        'feature_importance': importance,
        'features_used': feature_list
    }


def get_importance(pipeline, feature_list):
    """Extract feature importance from a fitted pipeline."""
    model = pipeline.named_steps.get('classifier') or pipeline.named_steps.get('regressor')
    preprocessor = pipeline.named_steps['preprocessor']

    # Get transformed feature names
    try:
        transformed_names = get_feature_names(preprocessor, feature_list)
    except Exception:
        transformed_names = [f"feature_{i}" for i in range(100)]

    importance_dict = {}
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        for name, imp in zip(transformed_names, importances):
            # Map back to original feature name
            original = name.split('_')[0] if '_' in name and any(
                name.startswith(c) for c in CATEGORICAL_FEATURES
            ) else name
            # Aggregate one-hot encoded features
            for orig_feat in feature_list:
                if name == orig_feat or name.startswith(orig_feat + '_'):
                    importance_dict[orig_feat] = importance_dict.get(orig_feat, 0) + imp
                    break
            else:
                importance_dict[name] = importance_dict.get(name, 0) + imp

    elif hasattr(model, 'coef_'):
        coefs = np.abs(model.coef_)
        if coefs.ndim > 1:
            coefs = coefs.mean(axis=0)
        for name, c in zip(transformed_names, coefs):
            for orig_feat in feature_list:
                if name == orig_feat or name.startswith(orig_feat + '_'):
                    importance_dict[orig_feat] = importance_dict.get(orig_feat, 0) + c
                    break
            else:
                importance_dict[name] = importance_dict.get(name, 0) + c

    # Normalize
    total = sum(importance_dict.values()) if importance_dict else 1
    if total > 0:
        importance_dict = {k: round(v / total, 4) for k, v in importance_dict.items()}

    # Sort by importance
    sorted_imp = sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
    return [{'feature': k, 'importance': v} for k, v in sorted_imp[:15]]


def train_all():
    """Train all models and save everything."""
    df = load_data()

    # Dataset summary
    summary = get_dataset_summary(df)
    with open(os.path.join(MODEL_DIR, 'dataset_summary.json'), 'w') as f:
        json.dump(summary, f, indent=2)
    print("Dataset summary saved.")

    # Insights
    insights = compute_insights(df)
    with open(os.path.join(MODEL_DIR, 'insights.json'), 'w') as f:
        json.dump(insights, f, indent=2)
    print("Insights saved.")

    # Clustering
    clustering = run_clustering(df)
    with open(os.path.join(MODEL_DIR, 'clustering.json'), 'w') as f:
        json.dump(clustering, f, indent=2)
    print("Clustering saved.")

    # Train models
    all_metrics = {}

    # 1. Adoption
    adoption_results = train_adoption_model(df)
    all_metrics['adoption'] = adoption_results

    # 2. Range Anxiety
    range_results = train_regression_model(
        df, 'range_anxiety_score', RANGE_ANXIETY_FEATURES, 'range_anxiety'
    )
    all_metrics['range_anxiety'] = range_results

    # 3. Energy Consumption
    energy_results = train_regression_model(
        df, 'monthly_energy_consumption_kwh', ENERGY_FEATURES, 'energy'
    )
    all_metrics['energy'] = energy_results

    # 4. Charging Cost
    charging_results = train_regression_model(
        df, 'monthly_charging_cost', CHARGING_COST_FEATURES, 'charging_cost'
    )
    all_metrics['charging_cost'] = charging_results

    # Save all metrics
    with open(os.path.join(MODEL_DIR, 'model_metrics.json'), 'w') as f:
        json.dump(all_metrics, f, indent=2)
    print("\nAll metrics saved.")

    # Save feature lists for prediction
    feature_config = {
        'adoption': ADOPTION_FEATURES,
        'range_anxiety': RANGE_ANXIETY_FEATURES,
        'energy': ENERGY_FEATURES,
        'charging_cost': CHARGING_COST_FEATURES,
        'all_features': ALL_FEATURES,
        'categorical': CATEGORICAL_FEATURES,
        'numerical': NUMERICAL_FEATURES
    }
    with open(os.path.join(MODEL_DIR, 'feature_config.json'), 'w') as f:
        json.dump(feature_config, f, indent=2)
    print("Feature config saved.")

    print("\nAll training complete!")
    return all_metrics


if __name__ == '__main__':
    train_all()

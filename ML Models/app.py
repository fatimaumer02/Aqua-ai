"""
AquaGuard AI - ML Backend (beginner-friendly, single file)
============================================================

This file loads YOUR real trained model files and serves predictions
over a simple HTTP API. Everything is in one file on purpose, so you
can read it top to bottom without jumping between folders.

WHAT THIS FILE DOES, STEP BY STEP:
  1. Load the 3 model files you trained (from the models/ folder)
  2. Define what a citizen's observation looks like (the input fields)
  3. Turn that raw input into the EXACT feature table your model expects
     (this matches your notebook's feature engineering, cell by cell)
  4. Run the model -> get "At-risk" or "Low-risk"
  5. Turn that into a friendlier 3-level result: Low / Medium / High
     (using your severity_score() + get_risk_label() logic, ported
     directly from your notebook)
  6. Send the result back as JSON

HOW TO RUN THIS (see README.md for full details):
    pip install -r requirements.txt
    uvicorn app:app --reload --port 8000

Then open http://localhost:8000/docs in your browser to test it.
"""

import pickle
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Models were pickled with scikit-learn 1.6.1. Newer sklearn (needed on
# Python 3.14) removed a few private helpers; restore them so pickle.load works.
try:
    import sklearn.compose._column_transformer as _ct

    if not hasattr(_ct, "_RemainderColsList"):
        class _RemainderColsList(list):
            """Compatibility stub for sklearn 1.6 ColumnTransformer pickles."""

        _ct._RemainderColsList = _RemainderColsList
except Exception:
    pass


# ============================================================
# STEP 1: Load your trained model files
# ============================================================
# These 3 files live in the models/ folder next to this file.
# They were saved in your notebook with pickle.dump(...).

MODELS_DIR = Path(__file__).parent / "models"

def load_pickle(filename: str):
    path = MODELS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(
            f"Missing model file: {path}\n"
            f"Make sure '{filename}' is inside the models/ folder."
        )
    with open(path, "rb") as f:
        return pickle.load(f)

print("Loading models...")
xgb_model = load_pickle("xgboost_binary_pipeline.pkl")   # the trained pipeline (preprocessing + XGBoost)
label_encoder = load_pickle("risk_binary_label_encoder.pkl")  # turns 0/1 back into "At-risk"/"Low-risk"
severity_stats = load_pickle("severity_stats.pkl")       # used to split "At-risk" into Medium/High
isolation_forest = load_pickle("isolation_forest.pkl")            # anomaly detector
isolation_forest_scaler = load_pickle("isolation_forest_scaler.pkl")  # scales inputs before the anomaly detector

# shap_explainer.pkl is optional - if you haven't added it yet, the API still
# works, it just skips the "why" explanation. Drop the file in models/ and
# restart the server to turn it on, no code changes needed.
SHAP_MODEL_PATH = MODELS_DIR / "shap_explainer.pkl"
shap_explainer = None
if SHAP_MODEL_PATH.exists():
    try:
        shap_explainer = load_pickle("shap_explainer.pkl")
        print("SHAP explainer loaded - citizen-friendly explanations are ON.")
    except Exception as e:
        print(f"Found shap_explainer.pkl but couldn't load it ({e}). Explanations stay OFF.")
else:
    print("shap_explainer.pkl not found - explanations stay OFF until you add it.")

print("Models loaded successfully.")

# Isolation Forest uses ONLY these 10 raw columns (confirmed from your scaler) -
# a much smaller set than the 33-column XGBoost feature table above.
ISO_FEATURE_COLS = [
    "ph", "turbidity_ntu", "dissolved_oxygen_mg_l", "temperature_c",
    "conductivity_us_cm", "total_dissolved_solids_mg_l", "nitrate_mg_l",
    "phosphate_mg_l", "rainfall_24h_mm", "rainfall_72h_mm",
]


# ============================================================
# STEP 2: Constants ported directly from your notebook
# ============================================================

# Cell 7: how biodiversity_condition (text) becomes a number
BIODIV_MAP = {"Degraded": 0, "Unknown": 1, "Intermediate": 2, "Healthy": 3}

# Cell 8: medians used to build pollution_index, computed from your FULL
# training dataset (observation.csv, 10,000 rows) BEFORE the train/test split.
# These are the real numbers - not a placeholder.
TURBIDITY_MEDIAN = 30.84
CONDUCTIVITY_MEDIAN = 787.8
DISSOLVED_OXYGEN_MEDIAN = 5.41

# Cell 39: the cutoff that decides Medium vs High once binary_pred == "At-risk"
HIGH_THRESHOLD = 0.13

# Cell 9 + 10: the exact column lists your model was trained on.
# The DataFrame we build MUST contain exactly these columns.
NUMERIC_COLS = [
    "ph", "turbidity_ntu", "dissolved_oxygen_mg_l", "temperature_c",
    "conductivity_us_cm", "total_dissolved_solids_mg_l", "nitrate_mg_l",
    "phosphate_mg_l", "rainfall_24h_mm", "rainfall_72h_mm",
    "air_temperature_c", "recent_rainfall_flag",
    "biodiversity_score", "biodiversity_condition_ord",
    "biodiversity_score_missing", "previous_observation_available",
    "previous_turbidity_ntu", "previous_dissolved_oxygen_mg_l",
    "turbidity_change", "oxygen_change", "obs_month", "obs_hour",
    "do_turbidity_ratio", "pollution_index", "ph_deviation",
]

CATEGORICAL_COLS = [
    "weather_condition", "visible_waste", "water_color", "odor_observed",
    "foam_observed", "algae_observed", "surface_condition",
    "biodiversity_observation", "observer_type",
]

ALL_COLS = NUMERIC_COLS + CATEGORICAL_COLS


# ============================================================
# STEP 3: What a citizen's observation looks like coming IN
# ============================================================
# This is simpler than the 33 model columns - a lot of those columns
# are CALCULATED from these raw inputs (see build_features() below).

class ObservationInput(BaseModel):
    # --- Core sensor readings (required) ---
    ph: float
    turbidity_ntu: float
    dissolved_oxygen_mg_l: float
    temperature_c: float
    conductivity_us_cm: float
    total_dissolved_solids_mg_l: float
    nitrate_mg_l: float
    phosphate_mg_l: float
    rainfall_24h_mm: float
    rainfall_72h_mm: float

    # --- Optional extras ---
    air_temperature_c: Optional[float] = None       # defaults to temperature_c if not given
    recent_rainfall_flag: Optional[bool] = False     # citizen/sensor says "it rained recently"

    # --- Biodiversity (Section 6.1 of the project doc) ---
    biodiversity_condition: Optional[str] = None     # "Degraded" | "Unknown" | "Intermediate" | "Healthy"
    biodiversity_score: Optional[float] = None        # 0.0 - 1.0, leave blank if not measured
    biodiversity_observation: Optional[str] = "Unknown"  # e.g. "Mayfly_Stonefly", "Worms_Leeches", etc.

    # --- Previous reading for this stream (the Node backend fills this in
    #     from MongoDB history - leave blank for a stream's first-ever reading) ---
    previous_observation_available: Optional[bool] = False
    previous_turbidity_ntu: Optional[float] = None
    previous_dissolved_oxygen_mg_l: Optional[float] = None

    # --- Other citizen observations (dropdown-style fields) ---
    weather_condition: Optional[str] = "Unknown"
    visible_waste: Optional[str] = "Not_Observed"
    water_color: Optional[str] = "Clear"
    odor_observed: Optional[str] = "Not_Observed"
    foam_observed: Optional[str] = "Not_Observed"
    algae_observed: Optional[str] = "Not_Observed"
    surface_condition: Optional[str] = "Clean"
    observer_type: Optional[str] = "Citizen"

    # --- When was this observed? (defaults to right now) ---
    observation_timestamp: Optional[str] = None  # ISO format, e.g. "2026-09-20T14:30:00"


class PredictionOutput(BaseModel):
    risk_binary: str          # "At-risk" or "Low-risk" - the raw model output
    risk_level: str            # "Low" / "Medium" / "High" - the friendlier 3-tier version
    severity_score: float       # the raw severity number used to split Medium vs High
    is_anomaly: bool           # Isolation Forest: is this reading unusual?
    anomaly_score: float        # lower = more unusual
    citizen_explanation: Optional[str] = None  # plain-language reason (needs shap_explainer.pkl)
    alert_triggered: bool
    recommended_action: str


# ============================================================
# STEP 4: Turn raw input into the exact feature table the model expects
# ============================================================
# This function mirrors your notebook cells 7, 8 and the raw CSV columns,
# one piece at a time.

def build_features(obs: ObservationInput) -> pd.DataFrame:
    # --- timestamp -> obs_month, obs_hour (cell 6) ---
    if obs.observation_timestamp:
        ts = datetime.fromisoformat(obs.observation_timestamp)
    else:
        ts = datetime.now()
    obs_month = ts.month
    obs_hour = ts.hour

    # --- biodiversity_condition -> biodiversity_condition_ord (cell 7) ---
    biodiversity_condition_ord = BIODIV_MAP.get(obs.biodiversity_condition, 1)  # fillna(1) = "Unknown"

    # --- biodiversity_score_missing (cell 7) ---
    biodiversity_score_missing = 1 if obs.biodiversity_score is None else 0

    # --- previous reading -> turbidity_change / oxygen_change ---
    # (confirmed from your raw data: turbidity_change = turbidity_ntu - previous_turbidity_ntu)
    if obs.previous_observation_available and obs.previous_turbidity_ntu is not None:
        turbidity_change = obs.turbidity_ntu - obs.previous_turbidity_ntu
    else:
        turbidity_change = np.nan  # the model's imputer fills this in automatically

    if obs.previous_observation_available and obs.previous_dissolved_oxygen_mg_l is not None:
        oxygen_change = obs.dissolved_oxygen_mg_l - obs.previous_dissolved_oxygen_mg_l
    else:
        oxygen_change = np.nan

    # --- engineered features (cell 8) ---
    do_turbidity_ratio = obs.dissolved_oxygen_mg_l / (obs.turbidity_ntu + 1)
    pollution_index = (
        obs.turbidity_ntu / TURBIDITY_MEDIAN
        + obs.conductivity_us_cm / CONDUCTIVITY_MEDIAN
        - obs.dissolved_oxygen_mg_l / DISSOLVED_OXYGEN_MEDIAN
    )
    ph_deviation = abs(obs.ph - 7.0)

    row = {
        "ph": obs.ph,
        "turbidity_ntu": obs.turbidity_ntu,
        "dissolved_oxygen_mg_l": obs.dissolved_oxygen_mg_l,
        "temperature_c": obs.temperature_c,
        "conductivity_us_cm": obs.conductivity_us_cm,
        "total_dissolved_solids_mg_l": obs.total_dissolved_solids_mg_l,
        "nitrate_mg_l": obs.nitrate_mg_l,
        "phosphate_mg_l": obs.phosphate_mg_l,
        "rainfall_24h_mm": obs.rainfall_24h_mm,
        "rainfall_72h_mm": obs.rainfall_72h_mm,
        "air_temperature_c": obs.air_temperature_c if obs.air_temperature_c is not None else obs.temperature_c,
        "recent_rainfall_flag": int(obs.recent_rainfall_flag),
        "biodiversity_score": obs.biodiversity_score if obs.biodiversity_score is not None else np.nan,
        "biodiversity_condition_ord": biodiversity_condition_ord,
        "biodiversity_score_missing": biodiversity_score_missing,
        "previous_observation_available": int(obs.previous_observation_available),
        "previous_turbidity_ntu": obs.previous_turbidity_ntu if obs.previous_turbidity_ntu is not None else np.nan,
        "previous_dissolved_oxygen_mg_l": obs.previous_dissolved_oxygen_mg_l if obs.previous_dissolved_oxygen_mg_l is not None else np.nan,
        "turbidity_change": turbidity_change,
        "oxygen_change": oxygen_change,
        "obs_month": obs_month,
        "obs_hour": obs_hour,
        "do_turbidity_ratio": do_turbidity_ratio,
        "pollution_index": pollution_index,
        "ph_deviation": ph_deviation,

        "weather_condition": obs.weather_condition,
        "visible_waste": obs.visible_waste,
        "water_color": obs.water_color,
        "odor_observed": obs.odor_observed,
        "foam_observed": obs.foam_observed,
        "algae_observed": obs.algae_observed,
        "surface_condition": obs.surface_condition,
        "biodiversity_observation": obs.biodiversity_observation,
        "observer_type": obs.observer_type,
    }

    # Build a one-row DataFrame with columns in the exact order the model expects.
    df = pd.DataFrame([row])[ALL_COLS]
    return df


# ============================================================
# STEP 5: Your severity_score() and get_risk_label(), ported exactly
# ============================================================
# This is copy-pasted logic from your notebook cell 39 - only the
# input shape changed (a dict instead of a pandas row).

def severity_score(row: dict) -> float:
    zs = []
    for col, (mean, std, invert) in severity_stats.items():
        z = (row[col] - mean) / std
        zs.append(-z if invert else z)
    return float(np.mean(zs))


def get_risk_label(row: dict, binary_pred: str) -> str:
    """binary_pred is 'Low-risk' or 'At-risk' (already decoded from the model)."""
    if binary_pred == "Low-risk":
        return "Low"
    return "High" if severity_score(row) >= HIGH_THRESHOLD else "Medium"


# ============================================================
# STEP 5b: Anomaly detection (Isolation Forest)
# ============================================================

def detect_anomaly(features_df: pd.DataFrame) -> tuple[bool, float]:
    iso_input = features_df[ISO_FEATURE_COLS]
    scaled = isolation_forest_scaler.transform(iso_input)
    prediction = isolation_forest.predict(scaled)[0]     # -1 = anomaly, 1 = normal
    score = float(isolation_forest.decision_function(scaled)[0])  # lower = more unusual
    return (prediction == -1), score


# ============================================================
# STEP 5c: Citizen-friendly explanation (SHAP) - ported from notebook cell 57
# ============================================================

def clean_feature_name(name: str) -> str:
    name = name.split("__")[-1]
    return name.replace("_ntu", "").replace("_mg_l", "").replace("_", " ")


def explain_prediction(features_df: pd.DataFrame, top_n: int = 3) -> Optional[str]:
    if shap_explainer is None:
        return None
    try:
        # SHAP needs the ALREADY-PREPROCESSED data, same as in your notebook -
        # xgb_model bundles the preprocessor as its 'prep' step.
        preprocessor = xgb_model.named_steps["prep"]
        transformed = preprocessor.transform(features_df)
        feature_names = preprocessor.get_feature_names_out()

        shap_values = shap_explainer.shap_values(transformed)
        if isinstance(shap_values, list):
            shap_values = shap_values[-1]  # positive/at-risk class

        row_shap = shap_values[0]
        ranked = sorted(zip(feature_names, row_shap), key=lambda x: abs(x[1]), reverse=True)
        top_features = ranked[:top_n]

        parts = []
        for name, value in top_features:
            direction = "high" if value > 0 else "low"
            parts.append(f"{clean_feature_name(name)} is {direction}")

        sentence = "Risk is concerning mainly because " + ", ".join(parts[:-1])
        if len(parts) > 1:
            sentence += f", with {parts[-1]} also contributing."
        else:
            sentence += "."
        return sentence
    except Exception as e:
        print(f"SHAP explanation failed (non-fatal): {e}")
        return None


# ============================================================
# STEP 6: The actual API
# ============================================================

app = FastAPI(title="AquaGuard AI - ML Backend (beginner version)")

# Allow your Next.js frontend to call this API from the browser.
# For local dev, "*" (allow everything) keeps things simple.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Quick check that the server is running and which models are loaded."""
    return {
        "status": "ok",
        "models_loaded": {
            "xgboost_risk_model": True,
            "isolation_forest": True,
            "shap_explainer": shap_explainer is not None,
        },
    }


@app.post("/predict", response_model=PredictionOutput)
def predict(obs: ObservationInput):
    try:
        features_df = build_features(obs)

        # --- Run the model ---
        # xgb_model is a full sklearn Pipeline (preprocessing + XGBoost bundled
        # together), so we just call .predict() with the raw feature table -
        # no manual scaling/encoding needed, the pipeline does it internally.
        prediction_encoded = xgb_model.predict(features_df)[0]   # 0 or 1
        risk_binary = label_encoder.inverse_transform([prediction_encoded])[0]  # "At-risk" / "Low-risk"

        # --- Turn binary result into Low / Medium / High ---
        row_dict = features_df.iloc[0].to_dict()
        risk_level = get_risk_label(row_dict, risk_binary)
        sev_score = severity_score(row_dict)

        # --- Anomaly detection ---
        is_anomaly, anomaly_score = detect_anomaly(features_df)

        # --- Citizen-friendly explanation (only if shap_explainer.pkl was provided) ---
        citizen_explanation = explain_prediction(features_df)

        alert_triggered = risk_level in ("Medium", "High") or is_anomaly
        recommended_action = "Expert verification recommended" if alert_triggered else "No action needed"

        return PredictionOutput(
            risk_binary=risk_binary,
            risk_level=risk_level,
            severity_score=round(sev_score, 4),
            is_anomaly=is_anomaly,
            anomaly_score=round(anomaly_score, 4),
            citizen_explanation=citizen_explanation,
            alert_triggered=alert_triggered,
            recommended_action=recommended_action,
        )

    except Exception as e:
        # Beginner-friendly: return a clear error message instead of a crash.
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ============================================================
# Lets you also run this with:  python app.py
# (instead of typing the uvicorn command every time)
# ============================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

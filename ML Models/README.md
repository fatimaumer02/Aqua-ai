# AquaGuard AI — ML Backend (Beginner Version)

This is a simple, single-file backend that loads YOUR real trained
models and serves risk predictions. Everything lives in `app.py` so
there's nothing to hunt through - just read it top to bottom.

## What's in this folder

```
aquaguard-simple-backend/
├── app.py               <- the whole backend, one file
├── requirements.txt
├── README.md             <- you are here
└── models/
    ├── xgboost_binary_pipeline.pkl     <- risk model (At-risk / Low-risk)
    ├── risk_binary_label_encoder.pkl   <- decodes 0/1 into text
    ├── severity_stats.pkl               <- for the Low/Medium/High split
    ├── isolation_forest.pkl             <- anomaly detector
    ├── isolation_forest_scaler.pkl      <- scales inputs before anomaly detection
    └── shap_explainer.pkl               <- powers the citizen_explanation field
```

All 6 of your model files are wired in and active.

## IMPORTANT: Python version matters here

Your models were trained with **scikit-learn 1.6.1**. If you install a
newer scikit-learn, loading the pipeline file can fail or behave oddly.
`requirements.txt` already pins the correct version - just follow the
steps below and you won't need to think about this again.

## How to run it locally (step by step)

### 1. Open a terminal in this folder
```cmd
cd aquaguard-simple-backend
```

### 2. Create a virtual environment
```cmd
python -m venv venv
```

If that errors with "python not recognized," try `py` instead:
```cmd
py -m venv venv
```

### 3. Activate it

**Windows CMD:**
```cmd
venv\Scripts\activate
```
**Windows PowerShell:**
```powershell
venv\Scripts\Activate.ps1
```
**Mac/Linux/Git Bash:**
```bash
source venv/bin/activate
```

You'll know it worked when you see `(venv)` at the start of your terminal line.

### 4. Install the required packages
```cmd
pip install -r requirements.txt
```

This installs FastAPI, pandas, scikit-learn (the exact version your
model needs), and XGBoost. It may take a minute or two.

### 5. Start the server
```cmd
uvicorn app:app --reload --port 8000
```

Or, just as easily:
```cmd
python app.py
```

If it worked, you'll see something like:
```
Loading models...
Models loaded successfully.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## How to test it

Open your browser to: **http://localhost:8000/docs**

This is an interactive test page - no extra tools needed.

1. Click `GET /health` → **Try it out** → **Execute**
   You should see `{"status": "ok", "models_loaded": true}`

2. Click `POST /predict` → **Try it out**
   It pre-fills an example JSON body - edit the numbers if you like, then **Execute**.

   Example input:
   ```json
   {
     "ph": 6.2,
     "turbidity_ntu": 85,
     "dissolved_oxygen_mg_l": 2.5,
     "temperature_c": 29,
     "conductivity_us_cm": 1300,
     "total_dissolved_solids_mg_l": 600,
     "nitrate_mg_l": 12,
     "phosphate_mg_l": 3,
     "rainfall_24h_mm": 20,
     "rainfall_72h_mm": 40,
     "biodiversity_condition": "Degraded",
     "water_color": "Brown",
     "surface_condition": "Heavy_Waste"
   }
   ```

   Expected-style response:
   ```json
   {
     "risk_binary": "At-risk",
     "risk_level": "High",
     "severity_score": 1.32,
     "is_anomaly": true,
     "anomaly_score": -0.11,
     "citizen_explanation": "Risk is concerning mainly because turbidity is high, dissolved oxygen is low, with conductivity also contributing.",
     "alert_triggered": true,
     "recommended_action": "Expert verification recommended"
   }
   ```

## What each field means

Only these fields are **required** — everything else has a sensible default:
`ph`, `turbidity_ntu`, `dissolved_oxygen_mg_l`, `temperature_c`,
`conductivity_us_cm`, `total_dissolved_solids_mg_l`, `nitrate_mg_l`,
`phosphate_mg_l`, `rainfall_24h_mm`, `rainfall_72h_mm`.

Everything else (weather, water color, biodiversity, previous readings
for trend, etc.) is optional — leave it out and the backend fills in a
safe default, exactly like your model was trained to handle missing
values.

## Connecting from your Node.js backend or Next.js frontend

Point requests at `http://localhost:8000/predict`. Example from Node:
```js
const res = await fetch("http://localhost:8000/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(observationData),
});
const result = await res.json();
```

## What this version does NOT include yet

- **Database / stream history** — that's the Node.js backend's job.
  This service only does one thing: take an observation, return a
  prediction. `previous_turbidity_ntu` / `previous_dissolved_oxygen_mg_l`
  should be filled in by whatever calls this API (looked up from
  MongoDB by the Node backend), not computed here.

## If something goes wrong

**"Missing model file" error on startup** — double check the 3 `.pkl`
files are actually inside the `models/` folder, not the project root.

**Pipeline fails to load / weird errors** — almost always a
scikit-learn version mismatch. Run `pip show scikit-learn` and confirm
it says `1.6.1`. If not: `pip install scikit-learn==1.6.1 --force-reinstall`.

**"No module named xgboost"** — run `pip install xgboost` again, ideally
inside the activated `venv`.

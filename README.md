# 🌊 AquaGuard AI

### AI-Powered Urban Water Quality Monitoring & Early-Warning System

AquaGuard AI is an AI-supported water monitoring and early-warning platform designed to assess urban freshwater ecosystem health. It combines environmental measurements, citizen-science observations, and machine learning to identify potential water-quality risks, detect unusual patterns, and provide understandable insights.

The project aims to complement the **IEEE OneAquaHealth** ecosystem by adding an explainable AI assessment and early-warning layer to environmental and citizen-generated data.

---

## 🎯 Problem Statement

Urban freshwater ecosystems face increasing pressure from pollution, environmental changes, and human activities. Traditional water-quality monitoring can be limited by delayed reporting, fragmented observations, and difficulties in identifying emerging risks.

AquaGuard AI aims to make environmental monitoring more accessible through AI-supported assessment, anomaly detection, and citizen-friendly insights.

## 💡 Key Features

- **Water Quality Assessment:** Evaluates environmental measurements to estimate potential water-quality risk.
- **AI-Based Risk Prediction:** Uses XGBoost to classify environmental risk levels.
- **Anomaly Detection:** Uses Isolation Forest to identify unusual environmental observations.
- **Explainable AI:** Uses SHAP to highlight the factors influencing model predictions.
- **Biodiversity Indicators:** Incorporates citizen-reported biodiversity observations as an additional environmental signal.
- **Early-Warning Insights:** Uses recent observations and trends to highlight potentially worsening conditions.
- **Citizen Science:** Enables users to submit environmental observations and contribute to monitoring.
- **Interactive Dashboard:** Presents risk levels, alerts, trends, and AI-generated insights.

## 🤖 Machine Learning Models

| Model / Technique | Purpose |
|---|---|
| XGBoost | Environmental risk prediction |
| Random Forest | Baseline model for comparison |
| Isolation Forest | Environmental anomaly detection |
| SHAP | Explainability of model predictions |
| Trend Analysis | Identifies changes in environmental conditions |

### How It Works

1. Collect environmental measurements and citizen observations.
2. Clean and preprocess the collected data.
3. Extract relevant environmental and biodiversity features.
4. Use XGBoost to estimate environmental risk.
5. Apply Isolation Forest to detect unusual observations.
6. Use SHAP to explain important prediction factors.
7. Analyze recent trends to identify potentially worsening conditions.
8. Display results and recommendations through the dashboard.

## 🛠️ Technology Stack

**Frontend**
- Next.js
- React.js
- Tailwind CSS

**Backend**
- Python
- FastAPI
- MongoDB

**Machine Learning & Data Science**
- Python
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- SHAP
- Joblib

## 📂 Project Structure

```text
AquaGuard-AI/
│
├── frontend/
│   └── Next.js Application
│
└── backend/
    ├── api/
    ├── models/
    ├── ml/
    │   ├── training/
    │   │   ├── train_xgboost.py
    │   │   └── train_anomaly.py
    │   │
    │   ├── models/
    │   ├── prediction.py
    │   ├── anomaly.py
    │   └── explanation.py
    │
    ├── database/
    ├── main.py
    └── requirements.txt
```

## 📊 Expected AI Insights

AquaGuard AI is designed to provide insights such as:

- Estimated environmental risk: Low, Medium, or High.
- Anomaly status: Normal or Unusual.
- Important factors influencing the prediction.
- Environmental trend: Improving, Stable, or Worsening.
- Suggested actions and expert-verification recommendations.

*Predictions are intended as decision-support information, not definitive proof of pollution or a replacement for laboratory testing and expert assessment.*

## 🚀 Project Goals

- Support urban freshwater ecosystem monitoring.
- Encourage citizen participation in environmental observation.
- Identify unusual environmental patterns.
- Make machine learning predictions more understandable.
- Support timely environmental awareness and decision-making.

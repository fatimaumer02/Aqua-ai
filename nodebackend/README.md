# AquaGuard AI — Node.js Backend

This is your **main backend**: streams, observations, alerts, and the
expert-review workflow, all stored in MongoDB. It calls the **Python ML
service** for every prediction — it does not run any ML itself.

```
Next.js frontend  →  Node/Express (THIS - your real backend)  →  Python FastAPI ML service (just runs the model)
                          ↓
                       MongoDB
```

Field names in `Observation.js` match the Python service's input fields
**exactly** (e.g. `turbidity_ntu`, `dissolved_oxygen_mg_l`) — this is on
purpose, so there's no error-prone renaming between the two services.

## Project structure

```
aquaguard-node-backend/
├── server.js                 # entry point
├── package.json
├── .env.example
└── src/
    ├── app.js                 # Express app, routes, CORS, error handling
    ├── config/db.js            # MongoDB connection
    ├── models/                 # Mongoose schemas
    │   ├── Stream.js
    │   ├── Observation.js       # fields match Python's ObservationInput exactly
    │   ├── Alert.js
    │   └── Review.js
    ├── services/mlClient.js    # calls the Python /predict endpoint
    ├── controllers/
    │   ├── streamController.js
    │   ├── observationController.js  # <- main flow: save + call ML + create alert
    │   ├── trendController.js         # rolling-average trend (Node-only, no ML)
    │   ├── alertController.js         # includes FHIR export (Node-only, no ML)
    │   └── reviewController.js        # expert confirm/reject workflow
    └── routes/
        ├── streamRoutes.js
        ├── observationRoutes.js
        └── alertRoutes.js
```

## Prerequisites

- **Node.js** 18+ (`node --version`)
- **MongoDB** running locally, or a free Atlas cluster: https://www.mongodb.com/cloud/atlas
- **The Python ML service already running on port 8000** (see `aquaguard-simple-backend`)

## How to run it

```bash
cd aquaguard-node-backend
npm install
copy .env.example .env        # Windows CMD; use "cp" on Mac/Linux/Git Bash
```

Edit `.env` — set `MONGO_URI` to your local or Atlas connection string.

```bash
npm run dev
```

You should see:
```
MongoDB connected: aquaguard
AquaGuard Node backend running on http://localhost:4001
Expecting ML service at http://localhost:8000
```

## Running the full stack (2 terminals)

| Terminal | What | Command | Port |
|----------|------|---------|------|
| 1 | Python ML service | `venv\Scripts\activate` then `uvicorn app:app --reload --port 8000` (from `aquaguard-simple-backend`) | 8000 |
| 2 | Node backend | `npm run dev` (from `aquaguard-node-backend`) | 5000 |

Start Python first — Node calls it, not the other way around. Your
frontend (once connected) only ever talks to port 5000.

## Test it

`http://localhost:5000/api/health` — confirms Node AND the Python service
(and which of its models are loaded) are both reachable.

### Step-by-step test with Postman

**1. Create a stream:**
`POST http://localhost:5000/api/streams`
```json
{ "name": "Willow Creek", "region": "Downtown", "latitude": 31.5, "longitude": 74.3 }
```
Copy the `_id` from the response.

**2. Submit an observation** (triggers the full prediction: risk + anomaly + explanation):
`POST http://localhost:5000/api/observations`
```json
{
  "streamId": "PASTE_STREAM_ID_HERE",
  "ph": 6.2,
  "turbidity_ntu": 90,
  "dissolved_oxygen_mg_l": 2.0,
  "temperature_c": 30,
  "conductivity_us_cm": 1400,
  "total_dissolved_solids_mg_l": 800,
  "nitrate_mg_l": 15,
  "phosphate_mg_l": 4,
  "rainfall_24h_mm": 25,
  "rainfall_72h_mm": 50,
  "biodiversity_condition": "Degraded",
  "water_color": "Brown",
  "surface_condition": "Heavy_Waste"
}
```
Response includes `risk_level`, `severity_score`, `is_anomaly`,
`citizen_explanation`, and an `alert` object since this data is deliberately bad.

**3. List alerts:** `GET http://localhost:5000/api/alerts`

**4. Expert reviews an alert:**
`POST http://localhost:5000/api/alerts/<alertId>/review`
```json
{ "expertName": "Dr. Malik", "decision": "confirmed", "notes": "Matches field report" }
```

**5. Export FHIR record:** `POST http://localhost:5000/api/alerts/<alertId>/fhir-export`

**6. Get trend for a stream** (submit 2-3 observations for the same stream first):
`GET http://localhost:5000/api/streams/<streamId>/trend`

## API summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Node + Python ML service health check |
| GET/POST | `/api/streams` | List / create streams |
| GET | `/api/streams/:id` | One stream |
| GET | `/api/streams/:id/trend` | Rolling-average trend (Node-only) |
| GET/POST | `/api/observations` | List / submit observations (submit → calls Python `/predict`) |
| GET | `/api/alerts` | List alerts (`?status=pending` etc.) |
| GET | `/api/alerts/:id` | One alert, populated with observation + stream |
| POST | `/api/alerts/:id/fhir-export` | Generate FHIR-style export (Node-only) |
| POST | `/api/alerts/:id/review` | Expert confirms/rejects/requests more info |
| GET | `/api/alerts/:id/reviews` | Review history for an alert |

## What happens if the Python service is down?

`POST /api/observations` still saves the raw reading (so no citizen data
is lost) but returns `202` instead of `201`, with a warning and empty
prediction fields.

## Connecting the Next.js frontend

Point every API call at `http://localhost:5000` (never port 8000 directly
— the frontend should never talk to Python). Example:
```js
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/observations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(observationData),
});
```
Set `NEXT_PUBLIC_API_URL=http://localhost:5000` in the frontend's `.env.local`.

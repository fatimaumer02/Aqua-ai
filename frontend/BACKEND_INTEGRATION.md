# Backend Integration Notes

This frontend is now wired to your real Node.js + Python backend instead
of the mock data it shipped with.

## How to run the full stack (3 terminals)

**1. Python ML service:**
```cmd
cd aquaguard-simple-backend
venv\Scripts\activate
uvicorn app:app --reload --port 8000
```

**2. Node.js backend:**
```cmd
cd aquaguard-node-backend
npm run dev
```

**3. This frontend:**
```cmd
cd frontend
npm install
npm run dev
```
Open http://localhost:3000

`.env.local` is already set to `NEXT_PUBLIC_API_URL=http://localhost:5000`
(your Node backend). The frontend never calls Python (port 8000) directly.

## What's wired to real data

- **Authentication (NEW)** — real signup/signin against MongoDB, bcrypt-hashed
  passwords, JWT tokens. Every dashboard page is protected: if you're not
  logged in, you're redirected to `/sign-in`. Sign-out lives in the
  top-right user menu (Topbar). New endpoints: `POST /api/auth/signup`,
  `POST /api/auth/signin`, `GET /api/auth/me`. `role` is `"citizen"` or
  `"expert"`. Set `JWT_SECRET` in the Node backend's `.env` before
  deploying anywhere real.
- **`lib/api.js`** — new file, the only place that talks to the backend.
  Contains fetch wrappers + adapter functions that convert real backend
  responses into the shape the existing UI components already expect.
- **Add Observation** (`app/observations/add`) — loads real streams,
  submits real observations through the full ML pipeline (risk, anomaly,
  SHAP explanation), shows a real error if the backend is unreachable.
- **Add Stream** (`app/streams/add`) — creates real streams in MongoDB.
- **Streams / Alerts / Observations / Dashboard / AI Insights / Map View
  / Analytics** — all fetch real data from the backend on load.
- **Notification bell (Topbar)** — real alerts, not mock.

## What's still mock/illustrative (by design, not a bug)

- **`TREND_DATA`** (Dashboard, Analytics charts) — no aggregate trend
  endpoint exists on the backend yet; per-stream trend does work via
  `GET /api/streams/:id/trend`, just not wired into these two charts yet.
- **`SHAP_FACTORS`** (AI Insights bar chart) — the backend's
  `citizen_explanation` is a plain-language sentence, not per-feature
  percentages, so this bar chart stays illustrative. The real sentence
  IS shown in the "AI Explanation" box below it.
- **Analytics summary stats** (Avg pH, Avg DO, etc.) — no aggregate-stats
  endpoint yet.
- **Observation edit/delete** — the backend has no PATCH/DELETE endpoint
  for observations yet, so edits/deletes stay local-only (browser
  storage) and don't affect the real database.
- **`app/reports/*`** — untouched, still fully mock.

## If you want the "still mock" pieces wired up too

Each one needs a small new backend endpoint first (e.g. an aggregate
`/api/analytics/summary` route, or `PATCH /api/observations/:id`) — say
the word and I'll add those endpoints to the Node backend, then wire the
matching frontend piece the same way as everything else above.

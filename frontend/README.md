# AquaGuard AI - Frontend

Next.js (App Router) frontend for AquaGuard AI, an explainable stream-health
risk assessment platform.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

**Public / marketing**
- `/` - Landing page
- `/how-it-works`, `/models`, `/solutions`
- `/sign-in`, `/sign-up`

**Authenticated app (sidebar layout)**
- `/dashboard` - Overview, risk breakdown, recent observations & alerts, AI insight
- `/map-view` - Interactive-style stream map with detail panel
- `/streams` - Searchable stream table
- `/observations` - Citizen observation log with status tabs
- `/alerts` - Filterable alert feed
- `/analytics` - Parameter trends chart + risk distribution
- `/ai-insights` - Per-stream prediction summary + SHAP explanation
- `/reports` - Report types + download history
- `/community` - Discussion feed
- `/settings` - Profile, notifications, **appearance (dark/light + accent color)**, account, security

## Folder structure

```
app/                      Routes (App Router)
  layout.jsx               Root layout - fonts, ThemeProvider
  globals.css                Global styles + responsive helpers

components/
  layout/
    Navbar.jsx               Public-site navbar
    Sidebar.jsx               Authenticated-app sidebar (responsive, off-canvas on mobile)
    Topbar.jsx                 Authenticated-app topbar (search, notifications, theme toggle)
    DashboardShell.jsx      Combines Sidebar + Topbar + WaterBackground - every dashboard page uses this
    Footer.jsx
  three/
    WaterBackground.jsx    Animated 3D wireframe water background (Three.js)
  ui/
    Flowline.jsx              Animated SVG signature line under public navbars
    StatCard.jsx               Dashboard metric card
    RiskBadge.jsx             Risk pill (High/Medium/Low), used across every table
    Field.jsx                    Form input used on sign in / sign up / settings

context/
  ThemeContext.jsx          Dark/light mode + accent color - persists via localStorage

lib/
  theme.js                    Color tokens (dark/light) x 4 accent options (Teal, Ocean, Violet, Amber)
  mockData.js                Shared mock streams/alerts/observations/reports - swap for real API calls
```

## Theming

Dark/light mode and accent color are both controlled from `/settings` ->
Preferences, and apply instantly across every page via `ThemeContext`. Four
accents are available out of the box (`lib/theme.js` -> `ACCENTS`) - add more
by extending that object with a `dark`/`light` hex pair.

## Responsive behavior

- Sidebar collapses to an off-canvas drawer (hamburger in the topbar) below
  1024px - see `.sidebar-desktop` / `.sidebar-open` rules in `globals.css`.
- Grids using the `grid-2col` / `grid-3col` / `grid-4col` classes collapse
  progressively at 900px / 700px / 480px.
- Tables wrap in `.table-scroll` for horizontal scroll on narrow screens
  instead of breaking layout.

## Notes

- Every interactive page is a client component (`"use client"`).
- `WaterBackground` dynamically imports `three` inside `useEffect`, so it
  never runs during server-side rendering.
- Forms validate input and show inline state but are not yet wired to a real
  backend - connect them to your Node/Express API when ready.
- All dashboard data (streams, alerts, observations, reports, community
  posts) is mock data in `lib/mockData.js` - swap in real API calls once the
  backend is ready.

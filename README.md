# BI Analytics System (BIA)

A Business Intelligence and Analytics platform with real-time dashboards, KPIs, reporting, and export capabilities. The project is organized as a two-app workspace:

- `bi-backend`: Node.js/Express API with PostgreSQL, logging, validation, and export/report tooling.
- `bia-frontend`: React (Vite) SPA with Tailwind-ready setup and charting libraries.

## Architecture

- **Backend** (`bi-backend`)
  - Express server with security middlewares: `helmet`, CORS, compression, and request logging via `morgan` + `winston`.
  - PostgreSQL via `pg` with pooled connections and health checks.
  - Modular routes for dashboards, data sources, KPIs, widgets, reports, and export flows.
  - Centralized error handling and structured logs written to `bi-backend/logs`.
  - Environment-driven configuration via `.env`.

- **Frontend** (`bia-frontend`)
  - React 18 + Vite dev server.
  - Tailwind CSS configured via `tailwind.config.js` (content scanning `index.html` and `src/**/*`).
  - Common charting and UI libs: `react-chartjs-2`, `chart.js`, `recharts`, `react-hook-form`, `react-toastify`.

## Prerequisites

- Node.js 18+
- pnpm or npm
- PostgreSQL 13+

## Quick Start

```bash
# 1) Install dependencies
cd bi-backend && npm install
cd ../bia-frontend && npm install

# 2) Configure environment (backend)
cd ../bi-backend
cp .env.example .env  # If provided; otherwise create .env as per below

# 3) Start services (in two terminals)
# Terminal A - backend
npm run dev

# Terminal B - frontend
cd ../bia-frontend
npm run dev
```

- Backend will default to `http://localhost:3000`
- Frontend Vite dev server defaults to `http://localhost:5173`

Ensure CORS origin matches the frontend URL. Backend allows `http://localhost:5173` and `http://localhost:3000` by default.

## Backend Setup (`bi-backend`)

### Environment Variables
Create `bi-backend/.env` with at least:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT or other secrets as needed
JWT_SECRET=please_change_me
```

- `DATABASE_URL` is required; the server will fail fast if missing.
- SSL is auto-enabled when `NODE_ENV=production`.

### Scripts

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest",
  "lint": "eslint .",
  "migrate": "node scripts/migrate.js",
  "seed": "node scripts/seed.js",
  "setup-reports": "node scripts/setupReportsAndExports.js"
}
```

> Note: migration/seed/setup scripts assume corresponding files in `bi-backend/scripts/`.

### Key Middleware
- `helmet` CSP configured for self-hosted scripts, styles, images (data/https).
- CORS whitelists `http://localhost:5173` and `http://localhost:3000`.
- `compression`, `express.json/urlencoded` with 10mb limits.
- HTTP access logs via `morgan` streamed to `winston`.

### Health & Meta Endpoints
- `GET /` – API root with status and version.
- `GET /health` – health check including DB status, uptime, memory.
- `GET /api/docs` – basic API index + route hints.

### API Routes
All prefixed under `/api`:

- `/api/dashboards` – dashboards operations
- `/api/data-source` – integration/data source operations
- `/api/kpis` – KPI operations
- `/api/widgets` – widget operations
- `/api/reports` – reporting operations
- `/api/export` – export operations
- `/api/public/dashboards` – public dashboards sample endpoint

> Additional commented routes exist (users, analytics, predictive) and can be enabled as needed.

### Logging
- Console logs in development; file logs in `bi-backend/logs/`:
  - `error.log` – error level
  - `combined.log` – all levels

## Frontend Setup (`bia-frontend`)

### Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview"
}
```

### Tooling
- Vite with React plugin and esbuild configured to treat `.js` as JSX.
- ESLint with React, React Hooks, and React Refresh plugins.
- Tailwind CSS (scan `index.html` and `src/**/*.{js,ts,jsx,tsx}`).

### Running
```bash
cd bia-frontend
npm run dev
# Open the printed local URL (typically http://localhost:5173)
```

## Local Development Workflow

1. Start the backend: `cd bi-backend && npm run dev` (logs show health/docs URLs).
2. Start the frontend: `cd ../bia-frontend && npm run dev`.
3. Confirm backend health at `http://localhost:3000/health`.
4. Confirm CORS origin matches Vite dev server.

## Security & Performance Notes
- Use strong secrets for any tokens (e.g., `JWT_SECRET`).
- In production, ensure `CORS_ORIGIN` is set to your deployed frontend domain.
- `helmet` CSP is restrictive; when integrating third-party assets, update CSP directives.
- DB SSL is enabled automatically in production (`rejectUnauthorized: false`).

## Troubleshooting
- Backend cannot start / DB errors:
  - Verify `DATABASE_URL` in `.env`.
  - Ensure PostgreSQL is reachable and credentials are correct.
- CORS errors in browser:
  - Set `CORS_ORIGIN` to the exact frontend URL.
  - Restart backend after changing `.env`.
- Health check shows `unhealthy`:
  - Check DB connectivity and logs in `bi-backend/logs/error.log`.
- Vite port conflicts:
  - Stop other dev servers or run `vite --port 5174`.

## Project Structure

```
bi-backend/
  config/
  controllers/
  middlewares/
  models/
  routes/
  server.js
  logs/

bia-frontend/
  src/
  index.html
  vite.config.js
  tailwind.config.js
```

## License
Proprietary – for internal use within your organization unless otherwise specified.

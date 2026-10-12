# Karya Setu

**Karya Setu** (कार्य सेतु — "a bridge to work") is a bilingual job platform that connects India's skilled and daily-wage workers with employers, local governance, and the full employment lifecycle — from finding a job to attendance, payments, and grievance redressal.

The project is a monorepo with two parts:

| Directory | Stack | Status |
| --- | --- | --- |
| [`client/`](client/) | React 19 · Vite · Tailwind CSS v4 · React Router 7 | Working UI, runs on mock data |
| [`backend/`](backend/) | Express API (planned) | Placeholder |

The frontend is fully usable today: it ships with realistic mock data and demo accounts, so the whole product can be explored without a backend. When the Express API is ready, set `VITE_API_URL` and the UI switches from mock mode to live calls.

---

## Features

### Four role-based portals

- **Worker** — dashboard, job search (text + voice, Hindi/Hinglish), applications, profile, verifiable Worker ID with QR, AI resume builder, skill training, attendance, payments, messages, and complaints.
- **Employer** — dashboard, post/edit jobs, my jobs, candidate shortlisting, nearby worker map, team & workforce management, attendance, payments, company profile, and complaints.
- **Admin** — platform dashboard, user management, AI fraud detection, dispute resolution, and analytics.
- **Panchayat** — village-level dashboard, local worker registry, and government scheme tracking.

### AI tools (`client/src/features/ai`)

All AI features are transparent, rule-based engines today, each written so it can later be swapped for an ML/LLM endpoint without changing the UI:

- **Setu AI chatbot** — bilingual (EN/HI) assistant with intent matching over live data.
- **Wage predictor** — estimates daily wage from skill × region × experience.
- **Job recommendations** — weighted scoring on skill fit, distance, pay, and trust.
- **Fraud detection** — explainable red-flag rules for suspicious job posts.
- **Voice & multilingual search** — turns spoken/typed Hindi, English, or Hinglish into search tokens.
- **OCR scanner** — document scanning for verification.

### Platform-wide

- **Bilingual** English / हिन्दी, toggled live (`LanguageContext`).
- **Light & dark themes**.
- **Mobile-first** responsive layout with a phone bottom nav.
- **Maps** via Leaflet / React-Leaflet (keyless OpenStreetMap tiles in dev).
- **PDF generation** for resumes and payslips (jsPDF).

---

## Getting started

### Prerequisites

- Node.js 18+ and npm

### Run the frontend

```bash
cd client
npm install
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`). The app runs on mock data out of the box — **any credentials work at the login screen**; pick a role to enter that portal.

### Demo accounts

Mock-mode login accepts any identifier/password. The role you choose determines the portal and the demo user:

| Role | Demo user |
| --- | --- |
| Worker | Ramesh Kumar (Mason, Jaipur) |
| Employer | Anil Sharma (Sharma Constructions) |
| Admin | Priya Nair (Platform administrator) |
| Panchayat | Mohan Lal Meena (Sarpanch) |

### Scripts (in `client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint with oxlint |
| `npm run format` | Format `src` with Prettier |

---

## Configuration

Copy [`client/.env.example`](client/.env.example) to `client/.env` and set as needed:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the Express API. **Leave unset to run on mock data.** |
| `VITE_MAP_TILES` | Map tile URL template (defaults to keyless OpenStreetMap). |
| `VITE_MAP_ATTRIBUTION` | Attribution string for the map tiles. |

Until `VITE_API_URL` is set, the UI uses the mock data in `client/src/data`. To wire a screen to the backend, replace its mock import with an `api()` call (see [`client/src/lib/api.js`](client/src/lib/api.js)).

---

## Project structure

```
Karya-Setu/
├── client/                     # React frontend
│   └── src/
│       ├── app/                # Providers, role guards, navigation config
│       ├── components/         # Reusable UI, layout, charts, brand, map
│       ├── context/            # Auth, Language, Theme, Toast providers
│       ├── data/               # Mock data (jobs, workers, admin, …)
│       ├── features/           # Pages grouped by role & domain
│       │   ├── worker/         # Worker portal
│       │   ├── employer/       # Employer portal
│       │   ├── admin/          # Admin portal
│       │   ├── panchayat/      # Panchayat portal
│       │   ├── lifecycle/      # Attendance, payments, messages, complaints
│       │   ├── ai/             # AI tools + engines
│       │   ├── auth/           # Login & register
│       │   └── landing/        # Public landing page
│       └── lib/                # API client, i18n, utilities
└── backend/                    # Express API (planned)
```

Routing lives in [`client/src/App.jsx`](client/src/App.jsx); per-role navigation in [`client/src/app/navigation.js`](client/src/app/navigation.js).

---

## Roadmap

- **Backend**: Express API for auth, jobs, applications, attendance, payments, and complaints.
- **AI upgrades**: replace the rule-based engines (wage, recommendations, fraud, chatbot) with trained models / an LLM endpoint, keeping the same response shapes.
- **Production maps**: swap the keyless OpenStreetMap tiles for a keyed provider.

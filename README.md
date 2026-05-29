# Motorcycle Specification Comparison System

A web application to search, view, and compare motorcycle specifications side-by-side (2-4 bikes), with an admin back-office for CRUD operations.

## Tech Stack

- **Backend** (`server/`): Node.js + Express + Prisma ORM + PostgreSQL (Supabase) + JWT
- **Frontend** (`client/`): React + Vite + TailwindCSS + shadcn/ui + React Router + i18n (TH/EN) + PWA
- **Language**: JavaScript (ESM)

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier) — no local database required

## Setup & Run

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New Project** (pick a nearby region, e.g. Singapore)
2. Set a database password (save it)
3. Wait ~2 minutes for the database to provision
4. Open **Project Settings → Database → Connection string** — copy from the **pooler** (hostname ends with `.pooler.supabase.com`):
   - **Transaction pooler** URI (port 6543) → use as `DATABASE_URL`
   - **Session pooler** URI (port 5432) → use as `DIRECT_URL`
   - Replace `[YOUR-PASSWORD]` with the password you set
   - ⚠️ Do **not** use "Direct connection" (`db.[ref].supabase.co:5432`) — it is IPv6-only on the free tier and will not work on IPv4-only hosts like Render

### 2. Backend (Server)

```bash
cd server

# Install dependencies (first time only)
npm install

# Create .env from the template
cp .env.example .env
# Edit DATABASE_URL and DIRECT_URL in .env to match your Supabase project

# Run Prisma migrations (creates tables in Supabase)
npx prisma migrate dev --name init

# Seed data (admin user + 18 motorcycles)
npm run seed

# Start the dev server
npm run dev
```

Server runs at http://localhost:3000

### 3. Frontend (Client)

In a separate terminal:

```bash
cd client

# Install dependencies (first time only)
npm install

# Create .env (optional — defaults to http://localhost:3000/api)
cp .env.example .env

# Start the dev server
npm run dev
```

Frontend runs at http://localhost:5173

## Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Supported Use Cases

### User
| UC | Page | URL |
|---|---|---|
| UC1 — Search + filter | HomePage | `/` |
| UC2 — Motorcycle details | MotorcycleDetailPage | `/motorcycle/:id` |
| UC3 — Compare 2-4 bikes | ComparePage | `/compare` |

### Admin
| UC | Page | URL |
|---|---|---|
| UC4 — Login | LoginPage | `/admin/login` |
| UC5 — Manage data | DashboardPage / Form | `/admin/dashboard`, `/admin/motorcycles/new`, `/admin/motorcycles/:id/edit` |
| UC6 — Logout | Button on Navbar | — |

## API Endpoints

| Method | Path | Auth | Use Case |
|---|---|---|---|
| POST | `/api/auth/login` | - | UC4 |
| POST | `/api/auth/logout` | JWT | UC6 |
| GET | `/api/motorcycles` | - | UC1 |
| GET | `/api/motorcycles/:id` | - | UC2 |
| POST | `/api/motorcycles/compare` | - | UC3 |
| GET | `/api/motorcycles/meta/filters` | - | UC1 |
| POST | `/api/motorcycles` | JWT | UC5 |
| PUT | `/api/motorcycles/:id` | JWT | UC5 |
| DELETE | `/api/motorcycles/:id` | JWT | UC5 |

## Project Structure

```
.
├── server/                  # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma    # Data model
│   │   └── seed.js          # Mock data
│   └── src/
│       ├── config/          # PrismaClient singleton
│       ├── controllers/     # auth + motorcycle controllers
│       ├── middleware/      # JWT + error handler
│       ├── routes/          # /auth, /motorcycles
│       ├── utils/           # JWT helpers, Zod validators
│       └── server.js        # Express entry
└── client/                  # React + Vite frontend
    ├── src/
    │   ├── components/      # MotorcycleCard, FilterPanel, CompareBar, ...
    │   │   └── ui/          # shadcn/ui primitives
    │   ├── contexts/        # AuthContext, CompareContext, FavoritesContext, ThemeContext
    │   ├── lib/             # api.js (axios), utils.js (cn, formatters), i18n, similar, csv
    │   ├── locales/         # th.json, en.json
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── MotorcycleDetailPage.jsx
    │   │   ├── ComparePage.jsx
    │   │   ├── FavoritesPage.jsx
    │   │   └── admin/
    │   │       ├── LoginPage.jsx
    │   │       ├── DashboardPage.jsx
    │   │       └── MotorcycleFormPage.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html
```

## Deployment

For production deployment using **Vercel (frontend) + Render (backend) + Supabase (database)**, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Useful Commands

### Backend
- `npm run dev` — start dev server (nodemon)
- `npm run seed` — run the seed script
- `npm run prisma:studio` — open Prisma Studio (GUI to view/edit data)
- `npm run prisma:migrate` — create a new migration after schema changes
- `npm run lint` — lint with ESLint
- `npm run format` — format with Prettier

### Frontend
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview the production build
- `npm test` — run unit tests (Vitest)
- `npm run lint` — lint with ESLint
- `npm run format` — format with Prettier

# Deployment Guide — Vercel + Render + Supabase

This guide walks through deploying the project to production for free:

- **Frontend** → Vercel (static Vite build)
- **Backend** → Render (Node.js Web Service)
- **Database** → Supabase (managed PostgreSQL)

## Architecture

```
[Browser]
   │ HTTPS
   ▼
[Vercel: client/  (Vite static)]
   │ HTTPS (CORS)
   ▼
[Render: server/  (Express API)]
   │ TLS
   ▼
[Supabase: PostgreSQL]
```

---

## Prerequisites

- A GitHub repository containing this project (push your local code first)
- A [Supabase](https://supabase.com) account
- A [Render](https://render.com) account
- A [Vercel](https://vercel.com) account

> **Tip:** Sign up to Render and Vercel with your GitHub account — they need GitHub access to auto-deploy on push.

---

## Step 0 — Push code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create an empty repo on GitHub, then:
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Verify `.env` files are **not** committed (they should be ignored by `.gitignore`).

---

## Step 1 — Supabase (Database)

> If you already followed the README and have a Supabase project, you can reuse it.
> For a clean production setup, create a separate project.

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Pick a region close to your backend (e.g. **Singapore** if your Render service is in Singapore)
3. Set a strong database password — **save it** (you cannot recover it)
4. Wait ~2 minutes for the database to provision
5. Go to **Project Settings → Database → Connection string**
6. Copy two URIs — **both must come from the pooler** (hostname ends with `.pooler.supabase.com`):
   - **Transaction pooler** (port **6543**) → this is `DATABASE_URL`
   - **Session pooler** (port **5432**) → this is `DIRECT_URL`
   - Replace `[YOUR-PASSWORD]` in both with the password from step 3

> ⚠️ **Do NOT use "Direct connection"** (`db.[ref].supabase.co:5432`).
> On Supabase free tier that endpoint is IPv6-only, and Render free tier cannot reach IPv6
> hosts — your build will fail with `P1001: Can't reach database server`.
> Always use the Session pooler URL for `DIRECT_URL` when deploying to Render / Railway / Fly.io.

Keep these two strings ready — you will paste them into Render in the next step.

---

## Step 2 — Render (Backend)

### 2.1 Create the service

1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| Name | `motospec-server` (or any name) |
| Region | Pick close to Supabase (e.g. Singapore) |
| Branch | `main` |
| **Root Directory** | `server` |
| Runtime | `Node` |
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy` |
| **Start Command** | `node src/server.js` |
| Instance Type | `Free` (or paid for no cold start) |

### 2.2 Set environment variables

Click **Advanced** → **Add Environment Variable** for each:

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase **pooler** URI from Step 1 (port 6543, with `?pgbouncer=true&connection_limit=1`) |
| `DIRECT_URL` | Supabase **direct** URI from Step 1 (port 5432) |
| `JWT_SECRET` | A long random string (generate: `openssl rand -base64 48`) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `http://localhost:5173` for now — will update to Vercel URL in Step 4 |
| `NODE_ENV` | `production` |

> Render automatically provides `PORT` — do not set it manually.

### 2.3 Deploy

Click **Create Web Service**. Render will:
1. Clone your repo
2. Run the build command (installs deps, runs Prisma migrations against Supabase)
3. Start the server

Wait until the dashboard shows **Live**. Your backend URL will be something like:
```
https://motospec-server.onrender.com
```

### 2.4 Smoke test

Visit `https://<your-app>.onrender.com/api/health` — you should see:
```json
{ "status": "ok" }
```

If you see an error, check **Logs** in the Render dashboard. Common causes:
- Wrong `DATABASE_URL` or `DIRECT_URL` (typo, missing password)
- Migrations failed (check `prisma migrate deploy` output)

### 2.5 Seed admin user + initial bikes

The seed script (`prisma/seed.js`) **deletes all motorcycles** before inserting — never run it from the build command. Run it **once** manually:

**Option A — from your local machine:**
```bash
cd server
# Temporarily set the prod DATABASE_URL
DATABASE_URL="<your-supabase-pooler-uri>" DIRECT_URL="<your-direct-uri>" npm run seed
```

**Option B — using Render Shell** (paid plans only; free tier has no shell):
```bash
npm run seed
```

After seeding, you should have an `admin` user (password `admin123`) and 18 motorcycles. **Change the admin password** via the Supabase Table Editor or via a custom SQL update if this is a public deployment.

---

## Step 3 — Vercel (Frontend)

### 3.1 Import the repo

1. Go to [Vercel Dashboard](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo
3. Configure:

| Setting | Value |
|---|---|
| Framework Preset | **Vite** (Vercel should auto-detect) |
| **Root Directory** | `client` |
| Build Command | `npm run build` (default) |
| Output Directory | `dist` (default) |
| Install Command | `npm install` (default) |

### 3.2 Set environment variable

Add one environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://<your-render-app>.onrender.com/api` |

> Vite env vars must start with `VITE_` to be exposed to the browser.

### 3.3 Deploy

Click **Deploy**. Vercel will build and deploy in ~1-2 minutes. Your frontend URL will be:
```
https://<your-app>.vercel.app
```

---

## Step 4 — Connect them with CORS

Right now the frontend can talk to the backend, but the backend rejects requests from the Vercel domain (CORS).

1. Go back to **Render Dashboard** → your service → **Environment**
2. Edit `CORS_ORIGIN`:
   - From: `http://localhost:5173`
   - To: `https://<your-app>.vercel.app` (your Vercel production URL, no trailing slash)
3. Click **Save Changes** → Render will redeploy automatically (~1 minute)

---

## Step 5 — Verification (smoke test)

Open `https://<your-app>.vercel.app` and verify:

- [ ] Homepage loads with 12 motorcycle cards
- [ ] Click a card → detail page shows specs + radar chart
- [ ] Click "+ Compare" on 2 bikes → CompareBar appears → click "Compare" → table shows
- [ ] Search "Honda" → results filter
- [ ] Toggle TH/EN in navbar → UI language changes
- [ ] Go to `/admin/login` → login with `admin/admin123` → see dashboard
- [ ] Edit a motorcycle → save → see the change in the public list
- [ ] Open DevTools Console → no CORS errors

If anything fails, check:
- **Network tab** for the failing request URL and status code
- **Render Logs** for backend errors
- **Vercel Deployment Logs** for build errors

---

## Common issues

### "P1001: Can't reach database server at db.xxx.supabase.co:5432" during Render build
You copied the **Direct connection** URL into `DIRECT_URL`. That endpoint is IPv6-only on Supabase free tier, and Render free tier does not have IPv6 outbound.

**Fix:** Use the **Session pooler** URL instead (port 5432, host ends with `.pooler.supabase.com`). Both `DATABASE_URL` and `DIRECT_URL` should now use `*.pooler.supabase.com`:

| Env var | Source | Port |
|---|---|---|
| `DATABASE_URL` | Transaction pooler | 6543 |
| `DIRECT_URL` | Session pooler | 5432 |

Update `DIRECT_URL` in **Render → Environment → Save Changes** → Render redeploys automatically.

### "CORS policy: No 'Access-Control-Allow-Origin' header"
- `CORS_ORIGIN` on Render does not match your Vercel URL exactly (check `https://` vs `http://`, no trailing `/`)

### "Internal Server Error" on first API call after a while
- Render free tier sleeps after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.
- **Workaround:** Set up a free uptime monitor (e.g. [UptimeRobot](https://uptimerobot.com)) to ping `https://<your-app>.onrender.com/api/health` every 14 minutes.

### "Can't reach database server" in Render logs
- `DATABASE_URL` is wrong, or you used the direct URL where the pooler URL is required
- Supabase may have hit the free-tier limit (check Supabase dashboard)

### Prisma migration fails on first deploy
- `DIRECT_URL` must be the direct connection (port 5432), not the pooler. Supabase pooler does not support schema changes.

### Frontend shows old data after backend updates
- Vercel caches static assets aggressively. Trigger a redeploy from the Vercel dashboard.
- The PWA service worker also caches API responses for 24h — use Incognito mode for fresh testing.

---

## Cost summary (as of 2026)

| Service | Free tier limits | Cost to upgrade |
|---|---|---|
| Vercel | 100 GB bandwidth/month, unlimited static | $20/month Pro |
| Render | 750 hours/month (1 service always-on), sleeps after 15 min idle | $7/month Starter (no sleep) |
| Supabase | 500 MB DB, 50K monthly active users | $25/month Pro |

For this project (light traffic, demo), the free tier of all three is sufficient.

---

## Continuous deployment

Both Render and Vercel auto-deploy when you push to `main`:

```bash
# Make changes locally
git add .
git commit -m "Update something"
git push origin main
# → Render redeploys backend (with prisma migrate deploy)
# → Vercel rebuilds frontend
```

Schema changes flow: edit `server/prisma/schema.prisma` locally → `npx prisma migrate dev --name <change>` → commit the new migration folder → push → Render runs `migrate deploy` automatically.

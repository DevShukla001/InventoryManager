# Deployment Guide

Step-by-step instructions to deploy the **Inventory & Order Management System** for the technical assessment submission.

## Architecture (production)

```
[Browser] → [Vercel / Netlify — React SPA]
                ↓  HTTPS (VITE_API_URL)
[Render / Railway / Fly.io — FastAPI]
                ↓
[Managed PostgreSQL]
```

| Component | Recommended platform | Root directory |
|-----------|---------------------|----------------|
| Frontend | Vercel or Netlify | `frontend/` |
| Backend API | Render, Railway, or Fly.io | `backend/` |
| Database | Platform-managed PostgreSQL | — |
| Docker image (submission) | Docker Hub | `backend/Dockerfile` |

---

## Prerequisites

1. [Git](https://git-scm.com/) and a [GitHub](https://github.com/) account  
2. [Docker](https://www.docker.com/) (local runs + Docker Hub push)  
3. Accounts on your chosen hosting providers (all have free tiers)

---

## Step 1 — Push code to GitHub

```bash
cd inventory-order-management
git init
git add .
git commit -m "Inventory & order management system — technical assessment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-order-management.git
git push -u origin main
```

---

## Step 2 — Deploy PostgreSQL + backend

### Option A: Render (recommended)

1. Open [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint** (or create services manually).
2. Connect your GitHub repo. You may use the included `render.yaml` at the repo root.
3. Create a **PostgreSQL** instance (free tier). Copy the **Internal Database URL** or **External Database URL**.
4. Create a **Web Service**:
   - **Root directory:** leave blank or repo root  
   - **Runtime:** Docker  
   - **Dockerfile path:** `backend/Dockerfile`  
   - **Docker context:** `backend`  
5. Set **Environment variables**:

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/dbname` | Yes |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Yes |
| `LOW_STOCK_THRESHOLD` | `10` | No |

6. Deploy and note the public URL, e.g. `https://inventory-api.onrender.com`.
7. Verify: open `https://YOUR-API-URL/health` — should return `{"status":"ok"}`.
8. API docs: `https://YOUR-API-URL/docs`

### Option B: Railway

1. [railway.app](https://railway.app/) → **New Project** → **Deploy from GitHub repo**.
2. Add **PostgreSQL** plugin; Railway injects `DATABASE_URL` into services.
3. Add a service for the backend:
   - Set root to `backend` or configure **Dockerfile path** = `backend/Dockerfile`.
4. Variables:

```
DATABASE_URL=<from Railway Postgres>
CORS_ORIGINS=https://your-frontend.vercel.app
```

5. Generate a public domain under **Settings → Networking**.

### Option C: Fly.io

```bash
cd backend
fly launch
# Follow prompts; attach Postgres when asked
fly secrets set CORS_ORIGINS=https://your-frontend.vercel.app
fly deploy
```

---

## Step 3 — Deploy frontend (Vercel)

1. [vercel.com](https://vercel.com/) → **Add New Project** → import GitHub repo.
2. **Root Directory:** `frontend`
3. **Framework Preset:** Vite  
4. **Build Command:** `npm run build`  
5. **Output Directory:** `dist`  
6. **Environment variables:**

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL` (no trailing slash) |

7. Deploy. Note the URL, e.g. `https://inventory-app.vercel.app`.

### Frontend on Netlify

1. [netlify.com](https://www.netlify.com/) → **Add new site** → **Import from Git**.
2. **Base directory:** `frontend`  
3. **Build command:** `npm run build`  
4. **Publish directory:** `frontend/dist`  
5. Add env var `VITE_API_URL` = your backend URL.  
6. `netlify.toml` in `frontend/` already configures SPA redirects.

---

## Step 4 — Connect frontend and backend

1. In **Render/Railway/Fly**, set `CORS_ORIGINS` to your **exact** frontend URL (comma-separated if multiple):

   ```
   https://inventory-app.vercel.app,https://inventory-app.netlify.app
   ```

2. Redeploy the **backend** after changing `CORS_ORIGINS`.

3. Redeploy the **frontend** whenever `VITE_API_URL` changes (Vite embeds it at build time).

4. Smoke test in the browser:
   - Dashboard loads counts  
   - Create a product, customer, and order  
   - Stock decreases after order  

---

## Step 5 — Publish backend image to Docker Hub

Required for assessment submission.

```bash
cd backend
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest .
docker login
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

Docker Hub link format:

`https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-backend`

---

## Step 6 — Local Docker (optional)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

---

## Environment variables reference

### Backend

| Variable | Description | Default (local Docker) |
|----------|-------------|------------------------|
| `DATABASE_URL` | PostgreSQL connection string | Set by Compose |
| `CORS_ORIGINS` | Allowed browser origins | `http://localhost:3000` |
| `LOW_STOCK_THRESHOLD` | Dashboard low-stock cutoff | `10` |

Pydantic maps `DATABASE_URL` → `database_url` automatically.

### Frontend (build-time)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Public backend base URL |

### Docker Compose (root `.env`)

Copy from `.env.example`:

```
POSTGRES_USER=inventory
POSTGRES_PASSWORD=change_me
POSTGRES_DB=inventory_db
VITE_API_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000
```

---

## Linting (before submit)

### Python (Ruff)

```bash
cd backend
pip install ruff
ruff check app
```

Config: `backend/pyproject.toml`

### JavaScript (ESLint)

```bash
cd frontend
npm install
npm run lint
```

Config: `frontend/eslint.config.js`

---

## Assessment submission checklist

| Deliverable | Where to get it |
|-------------|-----------------|
| GitHub repository | Your repo URL |
| Docker Hub backend image | `docker push` output / Docker Hub repo page |
| Live frontend URL | Vercel or Netlify dashboard |
| Live backend API URL | Render / Railway / Fly dashboard |

Example submission block:

```
GitHub:     https://github.com/YOUR_USERNAME/inventory-order-management
Docker Hub: https://hub.docker.com/r/YOUR_USERNAME/inventory-backend
Frontend:   https://inventory-app.vercel.app
Backend:    https://inventory-api.onrender.com
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Set `CORS_ORIGINS` on backend to exact frontend URL; redeploy backend |
| Frontend calls wrong API | Set `VITE_API_URL` and **rebuild** frontend |
| `502` / DB connection failed | Check `DATABASE_URL`; use SSL params if provider requires (`?sslmode=require`) |
| Tables missing | Backend runs `create_all` on startup; check logs for DB errors |
| Render free tier sleeps | First request may be slow; upgrade or use Railway/Fly |

---

## Security notes (production)

- Use strong `POSTGRES_PASSWORD` and secrets in hosting dashboards — never commit `.env`.
- Restrict `CORS_ORIGINS` to known frontend URLs only.
- Enable HTTPS (default on Vercel, Render, Netlify).

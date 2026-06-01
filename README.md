# Inventory & Order Management System

Full-stack application for the **Software Engineer Technical Assessment**: products, customers, orders, inventory tracking, Docker, and cloud deployment.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (JavaScript), Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Containers | Docker, Docker Compose |

## Features

- **Products** — full CRUD, unique SKU, non-negative stock  
- **Customers** — create, list, view, delete, unique email  
- **Orders** — multi-line orders, auto total, stock deduction / restore on cancel  
- **Dashboard** — totals + low-stock alerts  

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

## Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Render, Railway, Fly.io, Vercel, Netlify, Docker Hub, env vars, submission checklist  

## API summary

| Resource | Endpoints |
|----------|-----------|
| Products | `POST/GET/PUT/DELETE /products`, `GET /products/{id}` |
| Customers | `POST/GET/DELETE /customers`, `GET /customers/{id}` |
| Orders | `POST/GET/DELETE /orders`, `GET /orders/{id}` |
| Dashboard | `GET /dashboard/stats` |
| Query | `GET /query?entity=product\|customer\|order&id={id}` |

List endpoints also accept optional `?id=` filter: `/products?id=1`, `/customers?id=1`, `/orders?id=1`.

**Create order body:**

```json
{
  "customer_id": 1,
  "items": [{ "product_id": 1, "quantity": 2 }]
}
```

## Linting

```bash
# Python
cd backend && pip install ruff && ruff check app

# JavaScript
cd frontend && npm install && npm run lint
```

## Project structure

```
inventory-order-management/
├── backend/           # FastAPI + SQLAlchemy
├── frontend/          # React SPA
├── docker-compose.yml
├── render.yaml        # Optional Render blueprint
├── DEPLOYMENT.md      # Full deployment guide
└── .env.example
```

## Business rules

- Unique product SKU and customer email  
- Stock cannot go negative  
- Orders blocked when inventory is insufficient  
- Stock reduced on order create; restored on order delete  
- Order total computed by the backend  

## License

MIT — technical assessment submission.

# Dual Project: Admin (FastAPI + React/MUI) & User (Flask + React/Tailwind)

Two separate projects sharing one MongoDB Atlas database via MongoEngine.
- **Admin**: FastAPI backend, React + TypeScript + Material UI frontend
- **User**: Flask backend, React + TypeScript + Tailwind frontend

Collections: `admins`, `users`, `templates`, `scores` (admins/users stored separately).  
`Template` has fields only (no `is_active`), `created_by` no reverse delete rule.  
`Score` stores: rater (User ref), target (User ref), template ref, values[], rated_at, note.

Auth: JWT (HS256).

## Structure
```
Project
|_Admin
| |_backend  (FastAPI)
| |_frontend (React TS + MUI)
|_User
  |_backend  (Flask)
  |_frontend (React TS + Tailwind)
|_seeds      (shared seed script)
```

## Quick Start (Dev)

### 0) Mongo & JWT
Create a free MongoDB Atlas cluster and get a connection string. Then copy `.env.sample` to `.env` in **both** backends and set values.

### 1) Admin Backend (FastAPI)
```
cd Admin/backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

### 2) User Backend (Flask)
```
cd User/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
flask --app app.main:app run -p 8002 --debug
```

### 3) Admin Frontend
```
cd Admin/frontend
npm i
npm run dev
```

### 4) User Frontend
```
cd User/frontend
npm i
npm run dev
```

### 5) Seed Data (idempotent)
```
cd seeds
python seed.py
```

## Notes
- Frontends show the logged-in user's name in the header (from `/auth/me`).
- Users cannot rate themselves. Backends enforce this.
- "Totals table" = simple leaderboard endpoint: average weighted score per target.
- All list endpoints accept basic filtering via query params (?q=, ?page=, ?limit=).
- CORS enabled for local dev.

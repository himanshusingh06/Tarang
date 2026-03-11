# DHUN AI - Sound That Heals, Focuses, Restores

Production-grade wellness platform combining sound therapy, Ayurveda, neuroscience, binaural beats, and AI personalization.

## Stack
- Backend: FastAPI + PostgreSQL + LangChain + Gemini
- Frontend: React + Tailwind
- Vector Search: in-memory with embeddings (optional Chroma support if installed)

## Quick Start

1. Backend
```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
```

3. URLs
- `http://localhost:8000/docs`
- `http://localhost:5173`

## Environment
Copy `backend/.env.example` to `backend/.env` and set `GOOGLE_API_KEY` for Gemini.
Ensure PostgreSQL is running and matches `DATABASE_URL` in `backend/.env`.
Optional: `pip install -U chromadb` to enable persistent or cloud vector search.
If your database password includes special characters (like `@`), URL-encode it in `DATABASE_URL`.

## Chroma Cloud
Set the following in `backend/.env`:
- `CHROMA_API_KEY`
- `CHROMA_TENANT`
- `CHROMA_DATABASE`
Optional:
- `CHROMA_COLLECTION` (default `dhun_ai`)
- `CHROMA_CLOUD_HOST` (default `api.trychroma.com`)
- `CHROMA_CLOUD_PORT` (default `443`)
- `CHROMA_RESET` (default `false`)

## Core Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/programs/`
- `GET /api/v1/chakras/`
- `POST /api/v1/diagnostics/submit`
- `POST /api/v1/ai-agent/recommend`
- `POST /api/v1/search/`
- `GET /api/v1/profile/`
- `GET /api/v1/listening-history/`
- `GET /api/v1/ai-recommendations/`

## Auth Quickstart
Register:
```bash
curl -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" -d "{\"email\":\"you@example.com\",\"password\":\"secret\"}"
```

Login:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" -d "username=you@example.com&password=secret"
```

## Audio Files
Place WAV files in `backend/audio` matching seed filenames.

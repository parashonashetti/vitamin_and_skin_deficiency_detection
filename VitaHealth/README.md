# VitaHealth — Phase 1: Project Setup

AI-Based Vitamin Deficiency Detection & Diet Recommendation System.

This is **Phase 1 only**: a minimal, working React ↔ FastAPI connection.
No database, AI model, or authentication yet — those come in later phases.

## Requirements

- Python 3.11
- Node.js 20 LTS
- Git

## Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Verify:
- http://localhost:8000/health → `{"status": "ok", "service": "VitaHealth API"}`
- http://localhost:8000/docs → Swagger UI

## Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — you should see a green
"ok — VitaHealth API" message, confirming the frontend is
successfully talking to the backend.

## Project Structure

```
VitaHealth/
├── backend/
│   └── app/
│       ├── main.py         # FastAPI app + /health endpoint
│       └── core/config.py  # App settings
├── frontend/
│   └── src/
│       ├── App.jsx         # Calls backend /health on load
│       ├── main.jsx
│       └── api/client.js   # Fetch wrapper for backend calls
├── .gitignore
└── README.md
```

## Next

Phase 2 will cover dataset research and selection for the
vitamin-deficiency image classifier. Do not proceed until
Phase 1 is confirmed working on your machine.

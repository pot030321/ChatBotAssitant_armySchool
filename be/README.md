# Backend (FastAPI)

Run locally:

1) Install deps
   pip install -r requirements.txt

2) Start API
   uvicorn app.main:app --reload --port 8000

Endpoints:
- POST /threads {title?, student_name?, department?, topic?, issue?}
- GET /threads
- GET /threads/{id}/messages
- POST /threads/{id}/messages {text, sender}

Gemini (optional)
- Copy .env.example to .env and put your key: GEMINI_API_KEY=...
- Or set in PowerShell before starting:
   $env:GEMINI_API_KEY = "your_api_key_here"
   $env:PYTHONUTF8 = "1"
   python -m uvicorn app.main:app --reload --port 8000

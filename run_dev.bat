@echo off
echo ===================================================
echo Starting Vendo AI Backend & Frontend Development Servers
echo ===================================================

echo [1/2] Launching FastAPI Backend (Port 8000)...
start "Vendo AI API (Port 8000)" cmd /k ".venv\Scripts\python.exe -m uvicorn apps.api.main:app --reload --port 8000"

echo [2/2] Launching Next.js Frontend (Port 3000)...
start "Vendo AI Web (Port 3000)" cmd /k "npm run dev:web"

echo.
echo Both servers are launching in separate windows!
echo Backend API:  http://localhost:8000/docs
echo Frontend Web: http://localhost:3000
echo ===================================================

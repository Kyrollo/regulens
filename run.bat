@echo off
title ReguLens - Compliance Radar
cls
echo ========================================================
echo       ReguLens - AI Regulatory Compliance Radar
echo ========================================================
echo.
echo [1/3] Checking dependencies...
python -c "import uvicorn, fastapi" 2>nul || pip install fastapi uvicorn
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo [2/3] Starting Backend API (Port 8007)...
start "ReguLens API (Port 8007)" cmd /k "cd /d %~dp0backend && python -m uvicorn src.regulens.main:app --port 8007 --reload"

echo [3/3] Starting Frontend UI (Port 3007)...
start "ReguLens UI (Port 3007)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:3007
echo.
echo ReguLens is running!
echo   Frontend : http://localhost:3007
echo   Backend  : http://localhost:8007/docs
echo.
echo Press any key to stop all ReguLens processes...
pause >nul
taskkill /fi "WINDOWTITLE eq ReguLens API*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq ReguLens UI*" /f >nul 2>&1
echo Done.

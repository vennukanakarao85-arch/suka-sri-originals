@echo off
echo ========================================================
echo   STOPPING SUKA SRI ORIGINALS BACKGROUND PROCESSES
echo ========================================================
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
echo Vite dev processes stopped.
timeout /t 2 >nul

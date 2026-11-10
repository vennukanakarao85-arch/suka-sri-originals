@echo off
echo ========================================================
echo   STARTING SUKA SRI ORIGINALS (BACKGROUND DAEMON)
echo ========================================================
echo Starting Vite server in silent background mode...
powershell -WindowStyle Hidden -Command "Start-Process powershell -WindowStyle Hidden -ArgumentList '-NoProfile -Command cd \"\"\"%~dp0\"\"\"; npm run dev'"
echo.
echo Application is now running in the background!
echo URL: http://localhost:5173/
echo.
echo You can safely close this window now.
echo To stop, run 'stop-background.bat' or restart your machine.
timeout /t 4 >nul

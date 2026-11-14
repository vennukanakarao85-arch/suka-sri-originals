@echo off
setlocal
title SUKA SRI ORIGINALS - 1-Click Live Website Update
color 0B

echo ========================================================
echo     SUKA SRI ORIGINALS - 1-CLICK LIVE WEBSITE UPDATE
echo ========================================================
echo.
echo Step 1: Checking and staging all changes...
git add -A

echo.
set /p MSG="What did you update? (Press Enter for default): "
if "%MSG%"=="" set MSG=Update website content and assets

echo.
echo Step 2: Saving your changes...
git commit -m "%MSG%"

echo.
echo Step 3: Pushing live to GitHub and Cloudflare...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! PUSH COMPLETED!
    echo ========================================================
    echo Cloudflare is now automatically building your updates.
    echo Your live website will be updated in about 45 seconds!
    echo.
    echo Live URL: https://suka-sri-originals.vennukanakarao85.workers.dev
) else (
    echo.
    echo [ERROR] Push failed. Please check your internet connection.
)

echo.
pause

@echo off
echo ========================================================
echo   SUKA SRI ORIGINALS - NETLIFY LIVE PRODUCTION DEPLOY
echo ========================================================
echo.
echo Step 1: Building production bundle (HTML, CSS, JS, Assets)...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Production build failed. Aborting deploy.
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Netlify...
echo (Netlify will open a browser window to authenticate with your Netlify account)
echo.
npx netlify-cli deploy --prod --dir=dist

echo.
echo ========================================================
echo   NETLIFY DEPLOY COMPLETE!
echo ========================================================
pause

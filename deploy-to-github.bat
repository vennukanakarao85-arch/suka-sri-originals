@echo off
setlocal
echo ========================================================
echo   SUKA SRI ORIGINALS - GITHUB REPOSITORY PUSH
echo ========================================================
echo.
echo Current branch: main
echo Status: Committed and ready to push (692 files)
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/USERNAME/suka-sri-originals.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No repository URL entered. Exiting.
    pause
    exit /b 1
)

echo.
echo Setting remote origin to: %REPO_URL%
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo.
echo Pushing branch 'main' to GitHub...
echo (If prompted, log in with your GitHub account via Git Credential Manager)
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! PUSH TO GITHUB COMPLETE!
    echo ========================================================
    echo Repository: %REPO_URL%
) else (
    echo.
    echo [ERROR] Git push encountered an error. Please check your URL and account permissions.
)

echo.
pause

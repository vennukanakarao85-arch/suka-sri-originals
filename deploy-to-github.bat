@echo off
setlocal enabledelayedexpansion
title SUKA SRI ORIGINALS - GitHub Push
color 0A

echo ========================================================
echo        SUKA SRI ORIGINALS - GITHUB PUSH SYSTEM
echo ========================================================
echo.
echo Target Repository:
echo   https://github.com/vennukanakarao85-arch/suka-sri-originals
echo.
echo Branch: main
echo Ready to push: 694 files (Complete Saga, Canon Art, Posters)
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/vennukanakarao85-arch/suka-sri-originals.git

echo Choose your preferred sign-in method:
echo.
echo   [1] Push with Browser Sign-in (Git Credential Manager)
echo   [2] Push with GitHub Personal Access Token (PAT)
echo.
set /p CHOICE="Enter choice (1 or 2, default is 1): "

if "%CHOICE%"=="2" (
    echo.
    set /p PAT="Paste your GitHub Personal Access Token: "
    if "!PAT!"=="" (
        echo [ERROR] Token cannot be empty.
        pause
        exit /b 1
    )
    echo.
    echo Pushing using Token authentication...
    git push -u https://!PAT!@github.com/vennukanakarao85-arch/suka-sri-originals.git main
) else (
    echo.
    echo Pushing with Git Credential Manager...
    echo (A browser window or sign-in prompt will open. Click 'Sign in with your browser' to authorize)
    echo.
    git push -u origin main
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! PUSH TO GITHUB COMPLETED!
    echo ========================================================
    echo View your repository live at:
    echo   https://github.com/vennukanakarao85-arch/suka-sri-originals
) else (
    echo.
    echo [NOTE] If sign-in was not completed, you can re-run this file anytime.
)

echo.
pause

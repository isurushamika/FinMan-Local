@echo off
title FinMan - Personal Finance Manager

echo.
echo ========================================
echo    FinMan - Personal Finance Manager
echo ========================================
echo.
echo Starting FinMan Desktop App...
echo.

cd /d "%~dp0\apps\finman\frontend"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies... This may take a few minutes.
    echo.
    call npm install
    echo.
)

:: Start the Electron app
echo Launching FinMan...
echo.
echo Close the app window to exit
echo.

npm run electron:dev

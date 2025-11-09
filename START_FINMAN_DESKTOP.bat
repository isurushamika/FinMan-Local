@echo off
title FinMan - Desktop App

echo.
echo ==========================================
echo    Starting FinMan Desktop Application
echo ==========================================
echo.

cd /d "%~dp0\apps\finman\frontend"

:: Kill any existing Electron processes
taskkill /F /IM electron.exe 2>nul

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting Vite dev server...
start "Vite Server" /B cmd /c "npm run dev"

:: Wait for server to be ready
echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo.
echo Launching FinMan...
start "" "%~dp0\apps\finman\frontend\node_modules\.bin\electron.cmd" "%~dp0\apps\finman\frontend"

echo.
echo FinMan is starting...
echo Close the FinMan window to exit.
echo.
pause

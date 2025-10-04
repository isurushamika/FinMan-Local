@echo off
REM Local Production Build Test Script
REM This script builds both frontend and backend and runs them locally

echo ========================================
echo FinMan - Local Production Build Test
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "apps\finman" (
    echo Error: apps\finman directory not found
    echo Please run this from the project root
    exit /b 1
)

echo [Step 1/4] Building Frontend...
echo ========================================
cd apps\finman\frontend
if exist "dist\" rmdir /s /q dist
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Frontend build failed!
    cd ..\..\..
    exit /b 1
)
echo Frontend build complete!
echo.

echo [Step 2/4] Building Backend...
echo ========================================
cd ..\backend
if exist "dist\" rmdir /s /q dist
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Backend build failed!
    cd ..\..\..
    exit /b 1
)
echo Backend build complete!
echo.

echo [Step 3/4] Starting Backend (Production Mode)...
echo ========================================
echo Backend will run on: http://localhost:3000
echo API endpoints: http://localhost:3000/api
echo Health check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the backend when done testing
echo.
start /b node dist\server.js
timeout /t 3 /nobreak > nul

echo.
echo [Step 4/4] Starting Frontend Preview...
echo ========================================
cd ..\frontend
echo Frontend will run on: http://localhost:4173
echo.
echo Press Ctrl+C to stop the frontend when done testing
echo.
call npm run preview

REM Cleanup will happen when user presses Ctrl+C
cd ..\..\..

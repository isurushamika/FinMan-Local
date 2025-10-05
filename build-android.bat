@echo off
echo ========================================
echo FinMan Android Build Script
echo ========================================
echo.

REM Get current directory
set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%apps\finman\frontend"

echo Current directory: %CD%
echo.

REM Check if .env.android exists
if not exist ".env.android" (
    echo ERROR: .env.android file not found!
    echo Please create .env.android with your local IP address
    echo Example: VITE_API_URL=http://192.168.1.199:3000
    pause
    exit /b 1
)

echo Step 1: Copying .env.android to .env
echo ----------------------------------------
copy /Y ".env.android" ".env"
echo ✓ Environment configured for Android
echo.

echo Step 2: Building frontend
echo ----------------------------------------
call npm run build
if %errorlevel% neq 0 (
    echo ✗ Build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo Step 3: Syncing with Capacitor
echo ----------------------------------------
call npx cap sync
if %errorlevel% neq 0 (
    echo ✗ Capacitor sync failed!
    pause
    exit /b 1
)
echo ✓ Capacitor synced successfully
echo.

echo Step 4: Opening Android Studio
echo ----------------------------------------
echo Opening Android Studio...
echo You can now build and run the app from Android Studio
call npx cap open android

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure your Android device is connected
echo 2. In Android Studio, click Run (green play button)
echo 3. Test the app on your device
echo.
echo API URL: http://192.168.1.199:3000
echo.
echo To restore development environment:
echo   copy .env.development .env
echo.
pause

@echo off
echo ========================================
echo FinMan Project Cleanup Script
echo ========================================
echo.

echo [1/5] Cleaning frontend build artifacts...
cd apps\finman\frontend
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✓ Frontend build artifacts cleaned

echo.
echo [2/5] Cleaning backend build artifacts...
cd ..\backend
if exist dist rmdir /s /q dist
echo ✓ Backend build artifacts cleaned

echo.
echo [3/5] Cleaning Android build artifacts...
cd ..\frontend\android
if exist build rmdir /s /q build
if exist app\build rmdir /s /q app\build
if exist .gradle rmdir /s /q .gradle
if exist capacitor-android\build rmdir /s /q capacitor-android\build
if exist capacitor-cordova-android-plugins\build rmdir /s /q capacitor-cordova-android-plugins\build
echo ✓ Android build artifacts cleaned

echo.
echo [4/5] Cleaning empty directories...
cd ..\..\..\..\
if exist apps\finman\backend\uploads\receipts (
    dir /b /a apps\finman\backend\uploads\receipts | findstr "^" >nul || echo ✓ Receipts folder is empty
)
echo ✓ Empty directories checked

echo.
echo [5/5] Cleaning temporary files...
del /s /q *.log 2>nul
del /s /q .DS_Store 2>nul
del /s /q Thumbs.db 2>nul
echo ✓ Temporary files cleaned

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo To rebuild the project:
echo   1. Frontend: cd apps\finman\frontend ^&^& npm run build
echo   2. Backend: cd apps\finman\backend ^&^& npm run build
echo   3. Android APK: cd apps\finman\frontend\android ^&^& gradlew assembleDebug
echo.
pause

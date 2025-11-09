@echo off
title Build FinMan Executable

echo.
echo ========================================
echo    Building FinMan Executable
echo ========================================
echo.

cd /d "%~dp0\apps\finman\frontend"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm install
    echo.
)

echo Building Windows executable...
echo This will take a few minutes...
echo.

npm run electron:build:win

echo.
echo ========================================
echo Build complete!
echo.
echo Your executable is in:
echo apps\finman\frontend\release\
echo.
echo Look for: FinMan Setup 1.0.0.exe
echo ========================================
echo.

pause

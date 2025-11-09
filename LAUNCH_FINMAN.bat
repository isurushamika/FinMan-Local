@echo off
title Launch FinMan

echo.
echo ==========================================
echo         FinMan - Finance Manager
echo ==========================================
echo.
echo Launching FinMan Desktop App...
echo.

cd /d "%~dp0"
start "" "apps\finman\frontend\release\win-unpacked\FinMan.exe"

echo.
echo FinMan is starting...
echo You can close this window.
echo.
timeout /t 3 /nobreak >nul
exit

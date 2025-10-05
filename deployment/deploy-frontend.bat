@echo off
REM FinMan Frontend Deployment Script (Windows)

echo ========================================
echo 🚀 FinMan Frontend Deployment
echo ========================================
echo.

REM Configuration
set VPS_USER=root
set VPS_HOST=198.23.228.126
set DOMAIN=app.gearsandai.me

echo [Step 1] Building frontend...
cd apps\finman\frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)
cd ..\..\..
echo ✅ Build complete
echo.

echo [Step 2] The build is ready in: apps\finman\frontend\dist
echo.
echo ========================================
echo 📋 Manual Deployment Steps:
echo ========================================
echo.
echo 1. Upload the 'dist' folder to your VPS:
echo    scp -r apps\finman\frontend\dist\* %VPS_USER%@%VPS_HOST%:/var/www/finman-app/
echo.
echo 2. Upload Nginx configuration:
echo    scp deployment\nginx\finman-app.conf %VPS_USER%@%VPS_HOST%:/tmp/
echo.
echo 3. SSH into your VPS:
echo    ssh %VPS_USER%@%VPS_HOST%
echo.
echo 4. On the VPS, run these commands:
echo    sudo mv /tmp/finman-app.conf /etc/nginx/sites-available/
echo    sudo ln -sf /etc/nginx/sites-available/finman-app.conf /etc/nginx/sites-enabled/
echo    sudo chown -R www-data:www-data /var/www/finman-app
echo    sudo chmod -R 755 /var/www/finman-app
echo    sudo nginx -t
echo    sudo systemctl reload nginx
echo.
echo 5. Install SSL certificate:
echo    sudo certbot --nginx -d %DOMAIN%
echo.
echo 6. Access your app at: https://%DOMAIN%
echo.
echo ========================================
echo.
pause

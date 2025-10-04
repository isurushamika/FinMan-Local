@echo off
REM Deploy Script for Windows Development
REM Usage: deploy.bat finman

setlocal

set APP_NAME=%1

if "%APP_NAME%"=="" (
    echo Error: Please specify app name
    echo Usage: deploy.bat app-name
    echo Example: deploy.bat finman
    exit /b 1
)

echo Deploying %APP_NAME%...

REM Navigate to app directory
cd apps\%APP_NAME%

REM Build Frontend
if exist "frontend" (
    echo Building frontend...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

REM Build Backend
if exist "backend" (
    echo Building backend...
    cd backend
    call npm install
    call npm run build
    
    REM Run database migrations
    if exist "prisma" (
        echo Running database migrations...
        call npx prisma migrate deploy
        call npx prisma generate
    )
    cd ..
)

cd ..\..

echo Deployment complete!
echo To start: pm2 start ecosystem.config.js

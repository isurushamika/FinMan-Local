@echo off
echo ========================================
echo FinMan API Testing Guide
echo ========================================
echo.

echo STEP 1: Start PostgreSQL
echo ----------------------------------------
echo Please start PostgreSQL service:
echo   - Windows: Services -^> postgresql -^> Start
echo   - Or run: pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"
echo.
pause

echo.
echo STEP 2: Create Database (if not exists)
echo ----------------------------------------
cd apps\finman\backend
echo Running database migration...
call npx prisma migrate dev --name add_items_and_purchases
if %errorlevel% neq 0 (
    echo.
    echo Note: If migration fails, it might already exist or DB is not ready
    echo You can manually create the database with: createdb finman
    pause
)

echo.
echo STEP 3: Start Backend Server
echo ----------------------------------------
echo Starting backend API server on http://localhost:3000
echo Press Ctrl+C to stop when done testing
echo.
start cmd /k "cd /d %~dp0apps\finman\backend && npm run dev"

timeout /t 3 /nobreak

echo.
echo STEP 4: Test API Endpoints
echo ========================================
echo Backend server should be running now!
echo.
echo You can test the API with:
echo   1. Browser: http://localhost:3000/health
echo   2. Postman/Insomnia (see API_TESTING_GUIDE.md)
echo   3. Frontend app (run in another terminal)
echo.
echo ========================================
echo Press any key to open API testing guide...
pause
notepad apps\finman\backend\docs\API.md

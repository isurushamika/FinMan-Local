# 🧪 API Integration Testing - Quick Start

## What We've Built

✅ **Backend API** - Complete REST API with JWT authentication
✅ **Frontend API Layer** - Type-safe API clients for all endpoints  
✅ **Authentication** - Login/Register with token management
✅ **Database Schema** - Items and Purchases models added

## Testing Options

### Option 1: Automated PowerShell Test (Recommended)

This will test all API endpoints automatically:

```powershell
# 1. Make sure PostgreSQL is running
# 2. Start the backend server in a new terminal:
cd apps\finman\backend
npm run dev

# 3. In another terminal, run the test script:
.\test-api.ps1
```

The script will test:
- ✓ Health check
- ✓ User registration/login
- ✓ Items CRUD
- ✓ Purchases CRUD
- ✓ Transactions CRUD
- ✓ Budgets CRUD

### Option 2: Manual Browser Testing

1. **Start Backend:**
   ```bash
   cd apps\finman\backend
   npm run dev
   ```

2. **Test Health:**
   - Open browser: http://localhost:3000/health
   - Should see: `{"status":"ok","timestamp":"..."}`

3. **Use Postman/Insomnia** to test other endpoints
   - See `API_TESTING_GUIDE.md` for detailed examples

### Option 3: Frontend Integration Test

Test the frontend connecting to the backend:

```bash
# Terminal 1: Start backend
cd apps\finman\backend
npm run dev

# Terminal 2: Start frontend
cd apps\finman\frontend
npm run dev
```

Then open http://localhost:5173 and test the Login/Register screens.

## Prerequisites Checklist

Before running tests, ensure:

- [ ] PostgreSQL is installed and running
- [ ] Database `finman` exists (or will be created by migration)
- [ ] Backend dependencies installed (`npm install` in apps/finman/backend)
- [ ] Frontend dependencies installed (`npm install` in apps/finman/frontend)
- [ ] `.env` file exists in `apps/finman/backend/`
- [ ] No port conflicts on 3000 (backend) or 5173 (frontend)

## Quick PostgreSQL Check

```powershell
# Check if PostgreSQL is running
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# If not running, start it
Start-Service postgresql-x64-XX  # Replace XX with your version
```

## Running the Migration

**First time only:**

```bash
cd apps\finman\backend
npx prisma migrate dev --name add_items_and_purchases
```

This creates the database tables. You'll see:
- ✓ users
- ✓ transactions
- ✓ budgets
- ✓ recurring_transactions
- ✓ **items** (NEW)
- ✓ **item_purchases** (NEW)

## Test Results

After running `.\test-api.ps1`, you should see:

```
==================================
FinMan API Integration Test
==================================

1. Testing Health Endpoint...
✓ Health check passed: ok

2. Registering Test User...
✓ User registered: test@example.com
  Token: eyJhbGciOiJIUzI1NiI...

3. Creating Test Item...
✓ Item created: Test Tomatoes (ID: cm2x...)

4. Fetching All Items...
✓ Retrieved 1 items
  - Test Tomatoes: 2.5

5. Creating Test Purchase...
✓ Purchase created: 2 units @ $2.75

6. Fetching All Purchases...
✓ Retrieved 1 purchases
  - Test Market: 2 units @ $2.75

7. Creating Test Transaction...
✓ Transaction created: Groceries - $50

8. Fetching All Transactions...
✓ Retrieved 1 transactions

9. Creating Test Budget...
✓ Budget created: Groceries - $500/monthly

==================================
✓ All tests passed!
==================================

Summary:
  ✓ Backend API is running
  ✓ Database connection working
  ✓ Authentication working
  ✓ Items API working
  ✓ Purchases API working
  ✓ Transactions API working
  ✓ Budgets API working
```

## Troubleshooting

### "Can't reach database server"
```bash
# Start PostgreSQL
Start-Service postgresql-x64-XX
# Or manually
pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"
```

### "Database does not exist"
```bash
# Create database
createdb finman
# Or use pgAdmin
```

### "Port 3000 already in use"
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### "npx: command not found"
```bash
# Ensure Node.js and npm are installed
node --version
npm --version
# Reinstall if needed
```

## What's Next?

After successful testing:

1. **✅ Backend API verified** - All endpoints working
2. **→ Frontend Integration** - Connect React app to backend
3. **→ Replace localStorage** - Use API instead of local storage
4. **→ Authentication Flow** - Integrate login/register into App.tsx
5. **→ Android Testing** - Test API from Android device
6. **→ VPS Deployment** - Deploy to production server

## Files Created for Testing

- ✅ `test-api.ps1` - Automated PowerShell test script
- ✅ `test-api.bat` - Windows batch file for guided setup
- ✅ `API_TESTING_GUIDE.md` - Detailed manual testing guide
- ✅ `TESTING_QUICKSTART.md` - This file

## Ready to Test?

Run this command to start testing:

```powershell
# Step 1: Start backend (in one terminal)
cd apps\finman\backend
npm run dev

# Step 2: Run tests (in another terminal)
.\test-api.ps1
```

Good luck! 🚀

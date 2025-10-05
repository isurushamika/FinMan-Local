# API Integration Testing Guide

## Prerequisites

1. **PostgreSQL Running**
   - Windows: Start PostgreSQL service from Services
   - Or manually: `pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"`

2. **Database Created**
   - Run: `createdb finman` (or use pgAdmin)
   - Or the migration will create it automatically

3. **Backend Server Running**
   - Navigate to: `apps/finman/backend`
   - Run: `npm run dev`
   - Should see: "🚀 FinMan API Server running on http://0.0.0.0:3000"

## Quick Start

### Option 1: Automated Testing (Recommended)
```bash
# Run the test script
.\test-api.bat
```

### Option 2: Manual Testing

#### Start Backend:
```bash
cd apps/finman/backend

# Run migration (first time only)
npx prisma migrate dev --name add_items_and_purchases

# Start server
npm run dev
```

## API Testing Steps

### 1. Health Check
**URL:** `http://localhost:3000/health`
**Method:** GET
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T..."
}
```

**Test with:**
- Browser: Navigate to http://localhost:3000/health
- PowerShell:
  ```powershell
  Invoke-RestMethod -Uri http://localhost:3000/health
  ```

---

### 2. User Registration
**URL:** `http://localhost:3000/api/auth/register`
**Method:** POST
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm2x...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Test with PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

**Save the token for next requests!**

---

### 3. User Login
**URL:** `http://localhost:3000/api/auth/login`
**Method:** POST
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Test with PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

---

### 4. Create Item
**URL:** `http://localhost:3000/api/items`
**Method:** POST
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Body:**
```json
{
  "name": "Tomatoes",
  "category": "Vegetables",
  "quantity": 0,
  "unitPrice": 2.50,
  "notes": "Roma tomatoes"
}
```

**Test with PowerShell:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Tomatoes"
    category = "Vegetables"
    quantity = 0
    unitPrice = 2.50
    notes = "Roma tomatoes"
} | ConvertTo-Json

$item = Invoke-RestMethod -Uri http://localhost:3000/api/items -Method POST -Headers $headers -Body $body
Write-Host "Created Item ID: $($item.id)"
$itemId = $item.id
```

---

### 5. Get All Items
**URL:** `http://localhost:3000/api/items`
**Method:** GET
**Headers:** `Authorization: Bearer YOUR_TOKEN_HERE`

**Test with PowerShell:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$items = Invoke-RestMethod -Uri http://localhost:3000/api/items -Method GET -Headers $headers
$items | ConvertTo-Json
```

---

### 6. Create Purchase
**URL:** `http://localhost:3000/api/purchases`
**Method:** POST
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Body:**
```json
{
  "itemId": "YOUR_ITEM_ID",
  "quantity": 2,
  "unitPrice": 2.75,
  "totalCost": 5.50,
  "purchaseDate": "2025-10-04",
  "store": "Local Market",
  "notes": "Fresh produce"
}
```

**Test with PowerShell:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    itemId = $itemId
    quantity = 2
    unitPrice = 2.75
    totalCost = 5.50
    purchaseDate = "2025-10-04"
    store = "Local Market"
    notes = "Fresh produce"
} | ConvertTo-Json

$purchase = Invoke-RestMethod -Uri http://localhost:3000/api/purchases -Method POST -Headers $headers -Body $body
Write-Host "Created Purchase ID: $($purchase.id)"
```

---

### 7. Get All Purchases
**URL:** `http://localhost:3000/api/purchases`
**Method:** GET
**Headers:** `Authorization: Bearer YOUR_TOKEN_HERE`

**Test with PowerShell:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$purchases = Invoke-RestMethod -Uri http://localhost:3000/api/purchases -Method GET -Headers $headers
$purchases | ConvertTo-Json
```

---

### 8. Create Transaction
**URL:** `http://localhost:3000/api/transactions`
**Method:** POST
**Headers:** 
- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Body:**
```json
{
  "type": "expense",
  "amount": 50.00,
  "category": "Groceries",
  "description": "Weekly shopping",
  "date": "2025-10-04",
  "account": "Cash"
}
```

**Test with PowerShell:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    type = "expense"
    amount = 50.00
    category = "Groceries"
    description = "Weekly shopping"
    date = "2025-10-04"
    account = "Cash"
} | ConvertTo-Json

$transaction = Invoke-RestMethod -Uri http://localhost:3000/api/transactions -Method POST -Headers $headers -Body $body
Write-Host "Created Transaction ID: $($transaction.id)"
```

---

## Complete PowerShell Test Script

Save this as `test-api.ps1`:

```powershell
# FinMan API Integration Test Script

$baseUrl = "http://localhost:3000"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FinMan API Integration Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health"
    Write-Host "✓ Health check passed: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Register User
Write-Host "2. Registering Test User..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $token = $registerResponse.token
    Write-Host "✓ User registered: $($registerResponse.user.email)" -ForegroundColor Green
    Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    # Try login if user already exists
    Write-Host "  User might exist, trying login..." -ForegroundColor Yellow
    $loginBody = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        $token = $loginResponse.token
        Write-Host "✓ User logged in: $($loginResponse.user.email)" -ForegroundColor Green
    } catch {
        Write-Host "✗ Authentication failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 3. Create Item
Write-Host "3. Creating Test Item..." -ForegroundColor Yellow
$itemBody = @{
    name = "Test Tomatoes"
    category = "Vegetables"
    quantity = 0
    unitPrice = 2.50
    notes = "Test item"
} | ConvertTo-Json

try {
    $item = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method POST -Headers $headers -Body $itemBody
    $itemId = $item.id
    Write-Host "✓ Item created: $($item.name) (ID: $itemId)" -ForegroundColor Green
} catch {
    Write-Host "✗ Item creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Get All Items
Write-Host "4. Fetching All Items..." -ForegroundColor Yellow
try {
    $items = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method GET -Headers @{ Authorization = "Bearer $token" }
    Write-Host "✓ Retrieved $($items.Count) items" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to fetch items: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 5. Create Purchase
Write-Host "5. Creating Test Purchase..." -ForegroundColor Yellow
$purchaseBody = @{
    itemId = $itemId
    quantity = 2
    unitPrice = 2.75
    totalCost = 5.50
    purchaseDate = "2025-10-04"
    store = "Test Market"
    notes = "Test purchase"
} | ConvertTo-Json

try {
    $purchase = Invoke-RestMethod -Uri "$baseUrl/api/purchases" -Method POST -Headers $headers -Body $purchaseBody
    Write-Host "✓ Purchase created: $($purchase.quantity) units @ $($purchase.unitPrice)" -ForegroundColor Green
} catch {
    Write-Host "✗ Purchase creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Create Transaction
Write-Host "6. Creating Test Transaction..." -ForegroundColor Yellow
$transactionBody = @{
    type = "expense"
    amount = 50.00
    category = "Groceries"
    description = "Test transaction"
    date = "2025-10-04"
    account = "Cash"
} | ConvertTo-Json

try {
    $transaction = Invoke-RestMethod -Uri "$baseUrl/api/transactions" -Method POST -Headers $headers -Body $transactionBody
    Write-Host "✓ Transaction created: $($transaction.category) - $($transaction.amount)" -ForegroundColor Green
} catch {
    Write-Host "✗ Transaction creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ All tests passed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
```

Run with: `.\test-api.ps1`

---

## Common Issues

### 1. "Can't reach database server"
**Solution:** Start PostgreSQL service
```bash
# Windows Services
services.msc → postgresql → Start

# Or command line
pg_ctl start -D "C:\Program Files\PostgreSQL\XX\data"
```

### 2. "Database does not exist"
**Solution:** Create the database
```bash
createdb finman
# Or use pgAdmin
```

### 3. "Port 3000 already in use"
**Solution:** Kill existing process
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### 4. "401 Unauthorized"
**Solution:** Check your token is included in Authorization header
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. "Module not found"
**Solution:** Install dependencies
```bash
cd apps/finman/backend
npm install
```

---

## Success Criteria

✅ Health endpoint returns `{ "status": "ok" }`
✅ User registration creates user and returns token
✅ User login returns valid JWT token
✅ Create item with auth token succeeds
✅ Get items returns array with created item
✅ Create purchase linked to item succeeds
✅ Create transaction succeeds
✅ All endpoints return proper error messages for unauthorized requests

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Backend API is working correctly
2. → Test frontend connection to backend
3. → Integrate authentication into App.tsx
4. → Replace localStorage with API calls
5. → Test on Android device
6. → Deploy to VPS


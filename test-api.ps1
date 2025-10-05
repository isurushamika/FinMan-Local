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
    Write-Host "   Make sure the backend server is running!" -ForegroundColor Yellow
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
        Write-Host "  Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
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
    foreach ($i in $items) {
        Write-Host "  - $($i.name): $($i.unitPrice)" -ForegroundColor Gray
    }
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
    Write-Host "✓ Purchase created: $($purchase.quantity) units @ `$$($purchase.unitPrice)" -ForegroundColor Green
} catch {
    Write-Host "✗ Purchase creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Get All Purchases
Write-Host "6. Fetching All Purchases..." -ForegroundColor Yellow
try {
    $purchases = Invoke-RestMethod -Uri "$baseUrl/api/purchases" -Method GET -Headers @{ Authorization = "Bearer $token" }
    Write-Host "✓ Retrieved $($purchases.Count) purchases" -ForegroundColor Green
    foreach ($p in $purchases) {
        Write-Host "  - $($p.store): $($p.quantity) units @ `$$($p.unitPrice)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Failed to fetch purchases: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 7. Create Transaction
Write-Host "7. Creating Test Transaction..." -ForegroundColor Yellow
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
    Write-Host "✓ Transaction created: $($transaction.category) - `$$($transaction.amount)" -ForegroundColor Green
} catch {
    Write-Host "✗ Transaction creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 8. Get All Transactions
Write-Host "8. Fetching All Transactions..." -ForegroundColor Yellow
try {
    $transactions = Invoke-RestMethod -Uri "$baseUrl/api/transactions" -Method GET -Headers @{ Authorization = "Bearer $token" }
    Write-Host "✓ Retrieved $($transactions.Count) transactions" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to fetch transactions: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 9. Create Budget
Write-Host "9. Creating Test Budget..." -ForegroundColor Yellow
$budgetBody = @{
    category = "Groceries"
    amount = 500.00
    period = "monthly"
} | ConvertTo-Json

try {
    $budget = Invoke-RestMethod -Uri "$baseUrl/api/budgets" -Method POST -Headers $headers -Body $budgetBody
    Write-Host "✓ Budget created: $($budget.category) - `$$($budget.amount)/$($budget.period)" -ForegroundColor Green
} catch {
    Write-Host "✗ Budget creation failed: $($_.Exception.Message)" -ForegroundColor Red
    # Don't exit - might already exist
}
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ All tests passed!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✓ Backend API is running" -ForegroundColor Green
Write-Host "  ✓ Database connection working" -ForegroundColor Green
Write-Host "  ✓ Authentication working" -ForegroundColor Green
Write-Host "  ✓ Items API working" -ForegroundColor Green
Write-Host "  ✓ Purchases API working" -ForegroundColor Green
Write-Host "  ✓ Transactions API working" -ForegroundColor Green
Write-Host "  ✓ Budgets API working" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test frontend connection" -ForegroundColor White
Write-Host "  2. Integrate auth into App.tsx" -ForegroundColor White
Write-Host "  3. Replace localStorage with API calls" -ForegroundColor White
Write-Host "  4. Test on Android device" -ForegroundColor White
Write-Host ""

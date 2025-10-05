# FinMan Production API Testing Script
# Run this from your local machine to test production deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "FinMan Production Testing Script" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$ApiUrl = "https://api.$Domain"
$WebUrl = "https://$Domain"

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Host "[✓] Health check passed" -ForegroundColor Green
    } else {
        Write-Host "[✗] Health check failed: Unexpected status" -ForegroundColor Red
    }
} catch {
    Write-Host "[✗] Health check failed: $_" -ForegroundColor Red
}

# Test 2: HTTPS Certificate
Write-Host "`nTest 2: SSL Certificate" -ForegroundColor Cyan
try {
    $request = [System.Net.WebRequest]::Create($ApiUrl)
    $request.GetResponse() | Out-Null
    Write-Host "[✓] SSL certificate valid" -ForegroundColor Green
} catch {
    Write-Host "[✗] SSL certificate error: $_" -ForegroundColor Red
}

# Test 3: User Registration
Write-Host "`nTest 3: User Registration" -ForegroundColor Cyan
$testEmail = "test_$(Get-Random)@example.com"
$testPassword = "Test123!@#"

$registerBody = @{
    email = $testEmail
    password = $testPassword
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody
    
    if ($response.token) {
        Write-Host "[✓] User registration successful" -ForegroundColor Green
        $token = $response.token
    } else {
        Write-Host "[✗] Registration failed: No token received" -ForegroundColor Red
    }
} catch {
    Write-Host "[✗] Registration failed: $_" -ForegroundColor Red
}

# Test 4: User Login
Write-Host "`nTest 4: User Login" -ForegroundColor Cyan
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$ApiUrl/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    
    if ($response.token) {
        Write-Host "[✓] User login successful" -ForegroundColor Green
        $token = $response.token
    } else {
        Write-Host "[✗] Login failed: No token received" -ForegroundColor Red
    }
} catch {
    Write-Host "[✗] Login failed: $_" -ForegroundColor Red
}

if ($token) {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Test 5: Create Transaction
    Write-Host "`nTest 5: Create Transaction" -ForegroundColor Cyan
    $transactionBody = @{
        amount = 100.50
        category = "Food"
        description = "Test transaction"
        date = (Get-Date).ToString("yyyy-MM-dd")
        type = "expense"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/transactions" `
            -Method Post `
            -Headers $headers `
            -Body $transactionBody
        
        Write-Host "[✓] Transaction created: ID $($response.id)" -ForegroundColor Green
        $transactionId = $response.id
    } catch {
        Write-Host "[✗] Transaction creation failed: $_" -ForegroundColor Red
    }

    # Test 6: Get Transactions
    Write-Host "`nTest 6: Get Transactions" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/transactions" `
            -Method Get `
            -Headers $headers
        
        Write-Host "[✓] Retrieved $($response.Count) transactions" -ForegroundColor Green
    } catch {
        Write-Host "[✗] Failed to retrieve transactions: $_" -ForegroundColor Red
    }

    # Test 7: Create Item
    Write-Host "`nTest 7: Create Item" -ForegroundColor Cyan
    $itemBody = @{
        name = "Test Item"
        category = "Electronics"
        targetQuantity = 5
        currentQuantity = 0
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/items" `
            -Method Post `
            -Headers $headers `
            -Body $itemBody
        
        Write-Host "[✓] Item created: ID $($response.id)" -ForegroundColor Green
        $itemId = $response.id
    } catch {
        Write-Host "[✗] Item creation failed: $_" -ForegroundColor Red
    }

    # Test 8: Create Budget
    Write-Host "`nTest 8: Create Budget" -ForegroundColor Cyan
    $budgetBody = @{
        category = "Food"
        amount = 500.00
        period = "monthly"
        startDate = (Get-Date).ToString("yyyy-MM-dd")
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/budgets" `
            -Method Post `
            -Headers $headers `
            -Body $budgetBody
        
        Write-Host "[✓] Budget created: ID $($response.id)" -ForegroundColor Green
    } catch {
        Write-Host "[✗] Budget creation failed: $_" -ForegroundColor Red
    }

    # Test 9: Delete Transaction
    if ($transactionId) {
        Write-Host "`nTest 9: Delete Transaction" -ForegroundColor Cyan
        try {
            Invoke-RestMethod -Uri "$ApiUrl/api/transactions/$transactionId" `
                -Method Delete `
                -Headers $headers | Out-Null
            
            Write-Host "[✓] Transaction deleted successfully" -ForegroundColor Green
        } catch {
            Write-Host "[✗] Transaction deletion failed: $_" -ForegroundColor Red
        }
    }
}

# Test 10: Frontend Accessibility
Write-Host "`nTest 10: Frontend Accessibility" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $WebUrl -Method Get
    if ($response.StatusCode -eq 200) {
        Write-Host "[✓] Frontend accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "[✗] Frontend not accessible: $_" -ForegroundColor Red
}

# Test 11: CORS Headers
Write-Host "`nTest 11: CORS Configuration" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health" `
        -Method Options `
        -Headers @{"Origin" = $WebUrl}
    
    if ($response.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "[✓] CORS headers configured" -ForegroundColor Green
    } else {
        Write-Host "[!] CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[✗] CORS test failed: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  API:  $ApiUrl" -ForegroundColor White
Write-Host "  Web:  $WebUrl`n" -ForegroundColor White

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the web application in your browser" -ForegroundColor White
Write-Host "  2. Update Android app with production URL" -ForegroundColor White
Write-Host "  3. Test multi-device synchronization`n" -ForegroundColor White

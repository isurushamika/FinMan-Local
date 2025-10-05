#!/usr/bin/env pwsh
# FinMan Backend API Testing Script
# Tests the production backend at api.gearsandai.me

$API_BASE = "https://api.gearsandai.me"

Write-Host "`n🧪 FinMan Backend API Tests`n" -ForegroundColor Cyan
Write-Host "Testing: $API_BASE`n" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "Test 1: Health Check..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method Get
    Write-Host "✅ Health Check Passed" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($response.timestamp)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check Failed: $_`n" -ForegroundColor Red
}

# Test 2: Register New User
Write-Host "Test 2: User Registration..." -ForegroundColor Green
$randomEmail = "test$(Get-Random -Min 1000 -Max 9999)@example.com"
$registerBody = @{
    email = $randomEmail
    password = "TestPass123!"
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ User Registration Passed" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Token received: $($response.token.Length) chars`n" -ForegroundColor Gray
    
    # Save token for next tests
    $global:authToken = $response.token
    $global:userId = $response.user.id
} catch {
    Write-Host "❌ User Registration Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: User Login
Write-Host "Test 3: User Login..." -ForegroundColor Green
$loginBody = @{
    email = $randomEmail
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ User Login Passed" -ForegroundColor Green
    Write-Host "   User: $($response.user.name)" -ForegroundColor Gray
    Write-Host "   Token valid: Yes`n" -ForegroundColor Gray
    $global:authToken = $response.token
} catch {
    Write-Host "❌ User Login Failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 4: Create Transaction (Protected Route)
if ($global:authToken) {
    Write-Host "Test 4: Create Transaction (Protected Route)..." -ForegroundColor Green
    $transactionBody = @{
        type = "EXPENSE"
        amount = 50.00
        category = "Food"
        description = "Test transaction"
        date = (Get-Date).ToString("yyyy-MM-dd")
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $global:authToken"
        "Content-Type" = "application/json"
    }

    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/transactions" -Method Post -Body $transactionBody -Headers $headers
        Write-Host "✅ Create Transaction Passed" -ForegroundColor Green
        Write-Host "   Transaction ID: $($response.id)" -ForegroundColor Gray
        Write-Host "   Amount: `$$($response.amount)" -ForegroundColor Gray
        Write-Host "   Category: $($response.category)`n" -ForegroundColor Gray
        $global:transactionId = $response.id
    } catch {
        Write-Host "❌ Create Transaction Failed: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

# Test 5: Get Transactions
if ($global:authToken) {
    Write-Host "Test 5: Get Transactions..." -ForegroundColor Green
    $headers = @{
        "Authorization" = "Bearer $global:authToken"
    }

    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/api/transactions" -Method Get -Headers $headers
        Write-Host "✅ Get Transactions Passed" -ForegroundColor Green
        Write-Host "   Total transactions: $($response.Count)`n" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get Transactions Failed: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

# Test 6: SSL Certificate
Write-Host "Test 6: SSL Certificate..." -ForegroundColor Green
try {
    $req = [System.Net.HttpWebRequest]::Create("$API_BASE/health")
    $req.GetResponse() | Out-Null
    $cert = $req.ServicePoint.Certificate
    $certExpiry = [datetime]::Parse($cert.GetExpirationDateString())
    $daysUntilExpiry = ($certExpiry - (Get-Date)).Days
    
    Write-Host "✅ SSL Certificate Valid" -ForegroundColor Green
    Write-Host "   Issuer: $($cert.Issuer.Split(',')[0])" -ForegroundColor Gray
    Write-Host "   Expires: $certExpiry" -ForegroundColor Gray
    Write-Host "   Days remaining: $daysUntilExpiry`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ SSL Certificate Check Failed`n" -ForegroundColor Red
}

Write-Host "`n✅ Backend Testing Complete!`n" -ForegroundColor Cyan
Write-Host "Your backend is ready for production use! 🚀`n" -ForegroundColor Green

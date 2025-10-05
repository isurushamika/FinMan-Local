# Android Network Test Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Android Network Configuration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP
Write-Host "1. Checking Local IP Address..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -like "192.168.*"}).IPAddress
if ($ipAddress) {
    Write-Host "✓ Local IP: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "✗ Could not find local IP" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Check if backend is running
Write-Host "2. Checking Backend Server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 3
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is not running" -ForegroundColor Red
    Write-Host "  Please start backend: cd apps\finman\backend && npm run dev" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue anyway..."
}
Write-Host ""

# Check firewall
Write-Host "3. Checking Firewall Rules..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "Node.js Backend" -ErrorAction SilentlyContinue
if ($firewallRule) {
    Write-Host "✓ Firewall rule exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Firewall rule not found" -ForegroundColor Yellow
    Write-Host "  Creating firewall rule..." -ForegroundColor Gray
    try {
        New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 -ErrorAction Stop
        Write-Host "✓ Firewall rule created" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to create firewall rule (run as Administrator)" -ForegroundColor Red
    }
}
Write-Host ""

# Check .env.android
Write-Host "4. Checking Android Environment..." -ForegroundColor Yellow
$envFile = "apps\finman\frontend\.env.android"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    Write-Host "✓ .env.android exists" -ForegroundColor Green
    Write-Host "  Content:" -ForegroundColor Gray
    $envContent | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    
    # Check if IP matches
    if ($envContent -like "*$ipAddress*") {
        Write-Host "✓ IP address matches" -ForegroundColor Green
    } else {
        Write-Host "⚠ IP address in .env.android doesn't match current IP" -ForegroundColor Yellow
        Write-Host "  Updating .env.android..." -ForegroundColor Gray
        "VITE_API_URL=http://${ipAddress}:3000" | Out-File -FilePath $envFile -Encoding UTF8
        Write-Host "✓ Updated .env.android" -ForegroundColor Green
    }
} else {
    Write-Host "✗ .env.android not found" -ForegroundColor Red
    Write-Host "  Creating .env.android..." -ForegroundColor Gray
    "VITE_API_URL=http://${ipAddress}:3000" | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✓ Created .env.android" -ForegroundColor Green
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL (local):   http://localhost:3000" -ForegroundColor White
Write-Host "Backend URL (network): http://${ipAddress}:3000" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure backend is running: cd apps\finman\backend && npm run dev" -ForegroundColor White
Write-Host "2. Build Android app: .\build-android.bat" -ForegroundColor White
Write-Host "3. Test on device: http://${ipAddress}:3000/health in phone browser" -ForegroundColor White
Write-Host ""
Write-Host "To test backend accessibility from your phone:" -ForegroundColor Yellow
Write-Host "  Open phone browser and visit: http://${ipAddress}:3000/health" -ForegroundColor White
Write-Host "  Should see: {\"status\":\"ok\",\"timestamp\":\"...\"}" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"

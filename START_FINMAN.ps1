# FinMan - Personal Finance Manager
# One-click launcher script

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  FinMan - Personal Finance Manager" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = Join-Path $PSScriptRoot "apps\finman\frontend"

Set-Location $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies... This may take a few minutes." -ForegroundColor Yellow
    Write-Host ""
    npm install
    Write-Host ""
}

Write-Host "Launching FinMan Desktop App..." -ForegroundColor Green
Write-Host ""
Write-Host "Close the app window to exit" -ForegroundColor Yellow
Write-Host ""

# Start the Electron app
npm run electron:dev

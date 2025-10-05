# Restart Backend API on VPS
# This script will SSH into the VPS and restart the backend

Write-Host "🔄 Restarting backend API on VPS..." -ForegroundColor Cyan

ssh root@172.245.138.228 @"
cd /root/FinMan
echo '📥 Pulling latest code...'
git pull
cd apps/finman/backend
echo '🔄 Restarting PM2 process...'
pm2 restart finman-api
echo '✅ Backend restarted!'
pm2 status finman-api
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend successfully restarted!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now test the app at: https://app.gearsandai.me" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to restart backend" -ForegroundColor Red
}

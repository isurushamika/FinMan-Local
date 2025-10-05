# VPS Update Script for Windows
# Updates the FinMan backend on VPS after local changes are pushed

$VPS_HOST = "198.23.228.126"
$VPS_USER = "root"
$PROJECT_PATH = "~/FinMan"
$BACKEND_PATH = "$PROJECT_PATH/apps/finman/backend"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔄 FinMan VPS Update Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if git changes are committed
Write-Host "🔍 Checking local git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Warning: You have uncommitted changes!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Uncommitted files:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $response = Read-Host "Do you want to commit them now? (y/n)"
    
    if ($response -eq 'y') {
        Write-Host ""
        $commitMsg = Read-Host "Enter commit message"
        git add .
        git commit -m "$commitMsg"
        git push origin main
        Write-Host "✅ Changes committed and pushed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Proceeding without committing local changes..." -ForegroundColor Yellow
    }
}

# Check if local is pushed to GitHub
Write-Host ""
Write-Host "🔍 Checking if local changes are pushed..." -ForegroundColor Yellow
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main

if ($localCommit -ne $remoteCommit) {
    Write-Host "⚠️  Local commits not pushed to GitHub!" -ForegroundColor Red
    Write-Host ""
    $response = Read-Host "Push to GitHub now? (y/n)"
    
    if ($response -eq 'y') {
        git push origin main
        Write-Host "✅ Pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ VPS will not receive your latest changes!" -ForegroundColor Red
        Write-Host "Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 Updating VPS..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# SSH and update
Write-Host "📡 Connecting to VPS: $VPS_USER@$VPS_HOST" -ForegroundColor Yellow
Write-Host ""

$updateScript = @"
cd $PROJECT_PATH || exit 1
echo '📥 Pulling latest code from GitHub...'
git pull origin main
if [ \$? -ne 0 ]; then
    echo '❌ Git pull failed!'
    exit 1
fi
cd $BACKEND_PATH || exit 1
echo '📦 Installing dependencies...'
npm install --production
echo '🔄 Restarting API service...'
pm2 restart finman-api
echo ''
echo '✅ Update Complete!'
echo '================================'
pm2 status
echo ''
echo '📊 Recent logs:'
pm2 logs finman-api --lines 20 --nostream
echo ''
echo '🔗 Testing API...'
curl -s https://api.gearsandai.me/health
"@

ssh "$VPS_USER@$VPS_HOST" $updateScript

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "✅ VPS Updated Successfully!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Backend API: https://api.gearsandai.me" -ForegroundColor Cyan
    Write-Host ""
    
    # Test the API
    Write-Host "🧪 Testing API from your machine..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "https://api.gearsandai.me/health" -Method Get
        Write-Host "✅ API Health Check: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not reach API from your location" -ForegroundColor Yellow
        Write-Host "   (This might be normal if your IP is blocked or SSL issue)" -ForegroundColor Gray
    }
    
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "❌ Update Failed!" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. SSH into VPS manually: ssh $VPS_USER@$VPS_HOST" -ForegroundColor Gray
    Write-Host "2. Check PM2 status: pm2 status" -ForegroundColor Gray
    Write-Host "3. Check logs: pm2 logs finman-api" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

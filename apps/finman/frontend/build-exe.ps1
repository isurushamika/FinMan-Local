# Build FinMan Desktop App with Timestamped Output
param(
    [string]$Platform = "win"
)

Write-Host "Building FinMan for $Platform..." -ForegroundColor Green

# Get timestamp for folder name
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$version = (Get-Content package.json | ConvertFrom-Json).version
$buildFolder = "release/v$version-$timestamp"

Write-Host "Build output: $buildFolder" -ForegroundColor Cyan

# Build frontend
Write-Host "`nStep 1: Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

# Build electron app
Write-Host "`nStep 2: Packaging Electron app..." -ForegroundColor Yellow

switch ($Platform) {
    "win" {
        npx electron-builder --win --config.directories.output=$buildFolder
    }
    "mac" {
        npx electron-builder --mac --config.directories.output=$buildFolder
    }
    "linux" {
        npx electron-builder --linux --config.directories.output=$buildFolder
    }
    default {
        Write-Host "Unknown platform: $Platform" -ForegroundColor Red
        Write-Host "Use: win, mac, or linux" -ForegroundColor Yellow
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Build successful!" -ForegroundColor Green
    Write-Host "Output: $buildFolder" -ForegroundColor Cyan
    
    # Show the executable location
    if ($Platform -eq "win") {
        $exePath = "$buildFolder\win-unpacked\FinMan.exe"
        if (Test-Path $exePath) {
            Write-Host "`nExecutable: $exePath" -ForegroundColor Green
            $fileSize = (Get-Item $exePath).Length / 1MB
            Write-Host "Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "`n[FAILED] Build failed!" -ForegroundColor Red
    exit 1
}

#!/bin/bash
# Deploy Script for Multi-App Server
# Usage: ./deploy.sh finman

set -e  # Exit on error

APP_NAME=$1
PROJECT_ROOT="/var/www/apps"
APP_DIR="$PROJECT_ROOT/$APP_NAME"

if [ -z "$APP_NAME" ]; then
    echo "❌ Error: Please specify app name"
    echo "Usage: ./deploy.sh <app-name>"
    echo "Example: ./deploy.sh finman"
    exit 1
fi

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: App directory not found: $APP_DIR"
    exit 1
fi

echo "🚀 Deploying $APP_NAME..."

# Navigate to app directory
cd "$APP_DIR"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull origin main
fi

# Deploy Frontend
if [ -d "frontend" ]; then
    echo "🎨 Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Deploy Backend
if [ -d "backend" ]; then
    echo "⚙️  Building backend..."
    cd backend
    npm install
    npm run build
    
    # Run database migrations
    if [ -d "prisma" ]; then
        echo "🗄️  Running database migrations..."
        npx prisma migrate deploy
        npx prisma generate
    fi
    cd ..
fi

# Restart PM2 process
echo "♻️  Restarting application..."
pm2 restart "$APP_NAME-api" || pm2 start ecosystem.config.js --only "$APP_NAME-api"

# Check status
pm2 status

echo "✅ Deployment complete!"
echo "📊 View logs: pm2 logs $APP_NAME-api"

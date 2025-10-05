#!/bin/bash

###############################################################################
# FinMan VPS Update Script
# This script updates the application on your VPS
# Run this script when you want to deploy new changes
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/finman"
BACKEND_DIR="$APP_DIR/apps/finman/backend"
FRONTEND_DIR="$APP_DIR/apps/finman/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}FinMan Update Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# Step 1: Pull latest changes
echo ""
echo "Step 1: Pulling latest changes from repository..."
git fetch origin
BEFORE=$(git rev-parse HEAD)
git pull origin main
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
    print_warning "No new changes found"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
else
    print_status "Pulled latest changes"
fi

# Step 2: Update backend
echo ""
echo "Step 2: Updating backend..."
cd "$BACKEND_DIR"

# Install/update dependencies
npm install --production
print_status "Backend dependencies updated"

# Run database migrations
npx prisma generate
npx prisma migrate deploy
print_status "Database migrations completed"

# Rebuild backend
npm run build
print_status "Backend rebuilt"

# Step 3: Update frontend
echo ""
echo "Step 3: Updating frontend..."
cd "$FRONTEND_DIR"

# Install/update dependencies
npm install
print_status "Frontend dependencies updated"

# Rebuild frontend
npm run build
print_status "Frontend rebuilt"

# Step 4: Restart PM2
echo ""
echo "Step 4: Restarting application..."
pm2 reload finman-api --update-env
print_status "Application restarted"

# Step 5: Reload Nginx
echo ""
echo "Step 5: Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
print_status "Nginx reloaded"

# Show status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Update Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "Recent Logs:"
pm2 logs finman-api --lines 20 --nostream
echo ""
print_status "Update successful! 🚀"

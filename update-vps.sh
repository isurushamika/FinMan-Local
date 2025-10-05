#!/bin/bash

# VPS Update Script for Linux/Mac
# Updates the FinMan backend on VPS after local changes are pushed

VPS_HOST="198.23.228.126"
VPS_USER="root"
PROJECT_PATH="~/FinMan"
BACKEND_PATH="$PROJECT_PATH/apps/finman/backend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}🔄 FinMan VPS Update Script${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Check if git changes are committed
echo -e "${YELLOW}🔍 Checking local git status...${NC}"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}⚠️  Warning: You have uncommitted changes!${NC}"
    echo ""
    echo -e "${YELLOW}Uncommitted files:${NC}"
    git status --short
    echo ""
    read -p "Do you want to commit them now? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter commit message: " commitMsg
        git add .
        git commit -m "$commitMsg"
        git push origin main
        echo -e "${GREEN}✅ Changes committed and pushed${NC}"
    else
        echo -e "${YELLOW}⚠️  Proceeding without committing local changes...${NC}"
    fi
fi

# Check if local is pushed to GitHub
echo ""
echo -e "${YELLOW}🔍 Checking if local changes are pushed...${NC}"
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/main)

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo -e "${RED}⚠️  Local commits not pushed to GitHub!${NC}"
    echo ""
    read -p "Push to GitHub now? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push origin main
        echo -e "${GREEN}✅ Pushed to GitHub${NC}"
    else
        echo -e "${RED}❌ VPS will not receive your latest changes!${NC}"
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}🚀 Updating VPS...${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# SSH and update
echo -e "${YELLOW}📡 Connecting to VPS: $VPS_USER@$VPS_HOST${NC}"
echo ""

ssh "$VPS_USER@$VPS_HOST" << 'ENDSSH'
set -e

cd ~/FinMan || exit 1

echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

cd apps/finman/backend || exit 1

echo "📦 Installing dependencies..."
npm install --production

echo "🔄 Restarting API service..."
pm2 restart finman-api

echo ""
echo "✅ Update Complete!"
echo "================================"
pm2 status

echo ""
echo "📊 Recent logs:"
pm2 logs finman-api --lines 20 --nostream

echo ""
echo "🔗 Testing API..."
curl -s https://api.gearsandai.me/health | jq '.' || curl -s https://api.gearsandai.me/health

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}✅ VPS Updated Successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${CYAN}🔗 Backend API: https://api.gearsandai.me${NC}"
    echo ""
    
    # Test the API
    echo -e "${YELLOW}🧪 Testing API from your machine...${NC}"
    if curl -s https://api.gearsandai.me/health | grep -q "ok"; then
        echo -e "${GREEN}✅ API Health Check: Passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not reach API from your location${NC}"
        echo -e "${NC}   (This might be normal if your IP is blocked or SSL issue)${NC}"
    fi
    
else
    echo ""
    echo -e "${RED}================================${NC}"
    echo -e "${RED}❌ Update Failed!${NC}"
    echo -e "${RED}================================${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting steps:${NC}"
    echo "1. SSH into VPS manually: ssh $VPS_USER@$VPS_HOST"
    echo "2. Check PM2 status: pm2 status"
    echo "3. Check logs: pm2 logs finman-api"
fi

echo ""

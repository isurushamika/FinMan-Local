#!/bin/bash

# FinMan Frontend Deployment Script
# This script deploys the frontend to your VPS

set -e  # Exit on error

echo "🚀 FinMan Frontend Deployment"
echo "================================"

# Configuration
VPS_USER="root"
VPS_HOST="172.245.138.228"
VPS_APP_DIR="/var/www/finman-app"
LOCAL_BUILD_DIR="apps/finman/frontend/dist"
NGINX_CONFIG="deployment/nginx/finman-app.conf"
DOMAIN="app.gearsandai.me"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Building frontend...${NC}"
cd apps/finman/frontend
npm run build
cd ../../..
echo -e "${GREEN}✅ Build complete${NC}"

echo ""
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
tar -czf finman-app.tar.gz -C $LOCAL_BUILD_DIR .
echo -e "${GREEN}✅ Package created${NC}"

echo ""
echo -e "${YELLOW}Step 3: Uploading to VPS...${NC}"
scp finman-app.tar.gz $VPS_USER@$VPS_HOST:/tmp/
echo -e "${GREEN}✅ Upload complete${NC}"

echo ""
echo -e "${YELLOW}Step 4: Deploying on VPS...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    set -e
    
    echo "📦 Extracting files..."
    sudo mkdir -p /var/www/finman-app
    sudo tar -xzf /tmp/finman-app.tar.gz -C /var/www/finman-app
    sudo chown -R www-data:www-data /var/www/finman-app
    sudo chmod -R 755 /var/www/finman-app
    
    echo "✅ Files deployed to /var/www/finman-app"
    
    # Clean up
    rm /tmp/finman-app.tar.gz
ENDSSH
echo -e "${GREEN}✅ Deployment complete${NC}"

echo ""
echo -e "${YELLOW}Step 5: Uploading Nginx configuration...${NC}"
scp $NGINX_CONFIG $VPS_USER@$VPS_HOST:/tmp/finman-app.conf
echo -e "${GREEN}✅ Nginx config uploaded${NC}"

echo ""
echo -e "${YELLOW}Step 6: Configuring Nginx...${NC}"
ssh $VPS_USER@$VPS_HOST << 'ENDSSH'
    set -e
    
    echo "📝 Installing Nginx configuration..."
    sudo mv /tmp/finman-app.conf /etc/nginx/sites-available/finman-app.conf
    sudo ln -sf /etc/nginx/sites-available/finman-app.conf /etc/nginx/sites-enabled/
    
    echo "🔍 Testing Nginx configuration..."
    sudo nginx -t
    
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Nginx configured and reloaded"
ENDSSH
echo -e "${GREEN}✅ Nginx configuration complete${NC}"

echo ""
echo -e "${YELLOW}Step 7: Setting up SSL certificate...${NC}"
echo -e "${YELLOW}Run this command on your VPS:${NC}"
echo -e "${GREEN}sudo certbot --nginx -d $DOMAIN${NC}"

# Clean up local files
rm finman-app.tar.gz

echo ""
echo "================================"
echo -e "${GREEN}🎉 Frontend Deployment Complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "1. SSH into your VPS: ssh $VPS_USER@$VPS_HOST"
echo "2. Run: sudo certbot --nginx -d $DOMAIN"
echo "3. Access your app at: https://$DOMAIN"
echo ""
echo "🔗 Your frontend will connect to API: https://api.gearsandai.me"
echo "================================"

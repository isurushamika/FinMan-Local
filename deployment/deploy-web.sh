#!/bin/bash

# FinMan Web App Deployment Script
# Deploy web frontend to app.gearsandai.me

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN_APP="app.gearsandai.me"
PROJECT_DIR="$HOME/FinMan"
FRONTEND_DIR="$PROJECT_DIR/apps/finman/frontend"
WEB_DIR="/var/www/finman-app"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}FinMan Web App Deployment${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Step 1: Update repository
echo -e "${YELLOW}Step 1: Updating repository...${NC}"
cd $PROJECT_DIR
git pull origin main
echo -e "${GREEN}✅ Repository updated${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
cd $FRONTEND_DIR
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Build frontend
echo -e "${YELLOW}Step 3: Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 4: Deploy to web directory
echo -e "${YELLOW}Step 4: Deploying files...${NC}"
sudo mkdir -p $WEB_DIR
sudo rm -rf $WEB_DIR/*
sudo cp -r dist/* $WEB_DIR/
sudo chown -R www-data:www-data $WEB_DIR
sudo chmod -R 755 $WEB_DIR
echo -e "${GREEN}✅ Files deployed${NC}"
echo ""

# Step 5: Configure Nginx
echo -e "${YELLOW}Step 5: Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/finman-app.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name app.gearsandai.me;
    
    root /var/www/finman-app;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/finman-app.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# Reload Nginx
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Step 6: Install SSL certificate
echo -e "${YELLOW}Step 6: Installing SSL certificate...${NC}"
sudo certbot --nginx -d $DOMAIN_APP --non-interactive --agree-tos --email admin@gearsandai.me --redirect
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate installed${NC}"
else
    echo -e "${YELLOW}⚠️  SSL installation failed (you can run certbot manually later)${NC}"
fi
echo ""

# Verification
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${GREEN}Web App:${NC}      https://$DOMAIN_APP"
echo -e "${GREEN}Backend API:${NC}  https://api.gearsandai.me"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit: https://$DOMAIN_APP"
echo "2. Test login and sync functionality"
echo ""

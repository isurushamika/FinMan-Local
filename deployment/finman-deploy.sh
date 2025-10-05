#!/bin/bash
# FinMan - Complete Ubuntu Server Setup and Deployment
# This script sets up everything from scratch
# Run with: sudo bash finman-deploy.sh

set -e  # Exit on error

echo "🚀 FinMan Complete Deployment Setup"
echo "===================================="
echo ""

# Configuration - EDIT THESE!
DOMAIN="finman.yourdomain.com"
EMAIL="your-email@example.com"
APP_DIR="/var/www/finman"
DB_NAME="finman_db"
DB_USER="finman_user"

# Generate secure passwords
DB_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "App Directory: $APP_DIR"
echo "Database: $DB_NAME"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 1. Update System
echo -e "${GREEN}[1/12] Updating system...${NC}"
apt update && apt upgrade -y

# 2. Install Dependencies
echo -e "${GREEN}[2/12] Installing dependencies...${NC}"
apt install -y curl wget git build-essential nginx postgresql postgresql-contrib \
    certbot python3-certbot-nginx ufw

# 3. Configure Firewall
echo -e "${GREEN}[3/12] Configuring firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 4. Install Node.js 20.x
echo -e "${GREEN}[4/12] Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "✓ Node.js $(node -v) installed"
echo "✓ NPM $(npm -v) installed"

# 5. Install PM2
echo -e "${GREEN}[5/12] Installing PM2...${NC}"
npm install -g pm2

# 6. Setup PostgreSQL
echo -e "${GREEN}[6/12] Setting up PostgreSQL...${NC}"
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
echo "✓ Database created: $DB_NAME"

# 7. Create App Directory
echo -e "${GREEN}[7/12] Creating application directory...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# 8. Clone Repository (or manual copy)
echo -e "${GREEN}[8/12] Getting application files...${NC}"
echo "Options:"
echo "  1. Clone from GitHub"
echo "  2. I'll copy files manually"
read -p "Choose option (1 or 2): " clone_option

if [ "$clone_option" == "1" ]; then
    read -p "Enter GitHub repository URL: " repo_url
    git clone $repo_url .
else
    echo "Please copy your application files to: $APP_DIR"
    echo "Press Enter when ready..."
    read
fi

# 9. Setup Backend
echo -e "${GREEN}[9/12] Setting up backend...${NC}"
cd $APP_DIR/apps/finman/backend

# Create .env
cat > .env <<EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
EOF

npm install --production
npx prisma generate
npx prisma migrate deploy
echo "✓ Backend configured"

# 10. Setup Frontend
echo -e "${GREEN}[10/12] Setting up frontend...${NC}"
cd $APP_DIR/apps/finman/frontend

cat > .env.production <<EOF
VITE_API_URL=https://$DOMAIN/api
VITE_APP_NAME=FinMan
VITE_APP_VERSION=2.0.0
EOF

npm install
npm run build
echo "✓ Frontend built"

# 11. Configure Nginx
echo -e "${GREEN}[11/12] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/finman <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name DOMAIN www.DOMAIN;
    
    root APPDIR/apps/finman/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /uploads/ {
        alias APPDIR/apps/finman/backend/uploads/;
    }
}
NGINX

sed -i "s|DOMAIN|$DOMAIN|g" /etc/nginx/sites-available/finman
sed -i "s|APPDIR|$APP_DIR|g" /etc/nginx/sites-available/finman

ln -sf /etc/nginx/sites-available/finman /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
echo "✓ Nginx configured"

# 12. Start with PM2
echo -e "${GREEN}[12/12] Starting application...${NC}"
cd $APP_DIR
pm2 start apps/finman/backend/src/server.ts --name finman-backend --interpreter node
pm2 save
pm2 startup systemd -u root --hp /root
echo "✓ Application started"

# Setup SSL
echo ""
echo -e "${YELLOW}Setting up SSL certificate...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL

echo ""
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "================================"
echo ""
echo "🔐 Save these credentials:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASS"
echo "   JWT Secret: $JWT_SECRET"
echo ""
echo "🌐 Your app is live at:"
echo "   https://$DOMAIN"
echo ""
echo "📊 Manage your app:"
echo "   pm2 status"
echo "   pm2 logs finman-backend"
echo "   pm2 restart finman-backend"
echo ""
echo "✨ Deployment successful! ✨"

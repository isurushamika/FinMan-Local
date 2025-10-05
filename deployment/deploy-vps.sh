#!/bin/bash

###############################################################################
# FinMan VPS Deployment Script
# This script automates the deployment process on Ubuntu VPS
# Run this script on your VPS server
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
LOG_DIR="/var/log/pm2"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}FinMan VPS Deployment Script${NC}"
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

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   echo "Please run as a regular user with sudo privileges"
   exit 1
fi

# Step 1: Update System
echo ""
echo "Step 1: Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_status "System updated"

# Step 2: Install Node.js
echo ""
echo "Step 2: Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    print_status "Node.js installed: $(node --version)"
else
    print_status "Node.js already installed: $(node --version)"
fi

# Step 3: Install PostgreSQL
echo ""
echo "Step 3: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "PostgreSQL installed"
else
    print_status "PostgreSQL already installed"
fi

# Step 4: Install Nginx
echo ""
echo "Step 4: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Step 5: Install PM2
echo ""
echo "Step 5: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    print_status "PM2 installed: $(pm2 --version)"
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Step 6: Create database
echo ""
echo "Step 6: Setting up PostgreSQL database..."
print_warning "Please enter database credentials:"
read -p "Database name [finman_production]: " DB_NAME
DB_NAME=${DB_NAME:-finman_production}

read -p "Database user [finman_user]: " DB_USER
DB_USER=${DB_USER:-finman_user}

read -sp "Database password: " DB_PASSWORD
echo ""

# Validate password doesn't contain single quotes (would break SQL)
if [[ "$DB_PASSWORD" == *"'"* ]]; then
    print_error "Password cannot contain single quotes ('), please choose a different password"
    exit 1
fi

# Create database and user using separate commands to avoid heredoc escaping issues
echo "Creating database if not exists..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"

echo "Creating user and granting privileges..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Grant schema permissions
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

print_status "Database created: $DB_NAME"

# Step 7: Setup application directory
echo ""
echo "Step 7: Setting up application directory..."

# Check if we're already in a git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    APP_DIR=$(pwd)
    print_status "Using current directory: $APP_DIR"
    
    # Update to latest code
    git pull origin main
    print_status "Repository updated to latest"
    
elif [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
    print_status "Created directory: $APP_DIR"
    
    read -p "Git repository URL: " GIT_REPO
    git clone "$GIT_REPO" "$APP_DIR"
    print_status "Repository cloned"
    
elif [ -d "$APP_DIR/.git" ]; then
    print_status "Directory already exists: $APP_DIR"
    cd "$APP_DIR"
    git pull origin main
    print_status "Repository updated"
    
else
    print_error "Directory $APP_DIR exists but is not a git repository"
    print_warning "Please remove it or clone repository manually"
    exit 1
fi

# Update paths based on actual app directory
BACKEND_DIR="$APP_DIR/apps/finman/backend"
FRONTEND_DIR="$APP_DIR/apps/finman/frontend"

# Step 8: Setup backend
echo ""
echo "Step 8: Setting up backend..."
cd "$BACKEND_DIR"

# Install dependencies
npm install --production
print_status "Backend dependencies installed"

# Create .env file
if [ ! -f ".env" ]; then
    print_warning "Creating backend .env file..."
    read -p "JWT Secret (press Enter to generate random): " JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    fi
    
    read -p "Domain (e.g., example.com): " DOMAIN
    
    # URL encode the password for DATABASE_URL
    # Special characters like @, #, $, %, &, * need to be encoded
    DB_PASSWORD_ENCODED=$(node -e "console.log(encodeURIComponent('$DB_PASSWORD'))")
    
    cat > .env << EOL
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD_ENCODED@localhost:5432/$DB_NAME?schema=public"

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,https://api.$DOMAIN

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
EOL
    print_status "Backend .env created"
else
    print_status "Backend .env already exists"
fi

# Run Prisma migrations
npx prisma generate
npx prisma migrate deploy
print_status "Database migration completed"

# Build backend
npm run build
print_status "Backend built successfully"

# Step 9: Setup frontend
echo ""
echo "Step 9: Setting up frontend..."
cd "$FRONTEND_DIR"

# Install dependencies
npm install
print_status "Frontend dependencies installed"

# Create/update .env.production
if [ ! -z "$DOMAIN" ]; then
    echo "VITE_API_URL=https://api.$DOMAIN" > .env.production
    print_status "Frontend .env.production created"
fi

# Build frontend
npm run build
print_status "Frontend built successfully"

# Step 10: Configure Nginx
echo ""
echo "Step 10: Configuring Nginx..."

# Backend API config
sudo tee /etc/nginx/sites-available/finman-api > /dev/null << 'EOL'
server {
    listen 80;
    server_name api.DOMAIN_PLACEHOLDER;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}
EOL

# Frontend config
sudo tee /etc/nginx/sites-available/finman-web > /dev/null << 'EOL'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;

    root /var/www/finman/apps/finman/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
EOL

# Replace domain placeholder
if [ ! -z "$DOMAIN" ]; then
    sudo sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/finman-api
    sudo sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/finman-web
fi

# Enable sites
sudo ln -sf /etc/nginx/sites-available/finman-api /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/finman-web /etc/nginx/sites-enabled/

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx
print_status "Nginx configured"

# Step 11: Setup PM2
echo ""
echo "Step 11: Starting application with PM2..."

# Create log directory
sudo mkdir -p "$LOG_DIR"
sudo chown -R $USER:$USER "$LOG_DIR"

# Start PM2
cd "$APP_DIR"
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup | tail -n 1 | sudo bash

print_status "PM2 configured and running"

# Step 12: Configure firewall
echo ""
echo "Step 12: Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    print_status "Firewall configured"
else
    print_warning "UFW not installed, skipping firewall configuration"
fi

# Step 13: SSL Setup
echo ""
echo "Step 13: SSL Certificate Setup..."
print_warning "To setup SSL certificates, run:"
echo "sudo apt install -y certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN"

# Final status
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "Next Steps:"
echo "1. Update your DNS records to point to this server"
echo "2. Run SSL certificate setup (see above)"
echo "3. Test your application:"
echo "   - API: http://api.$DOMAIN/health"
echo "   - Web: http://$DOMAIN"
echo ""
echo "Useful Commands:"
echo "  pm2 logs finman-api    - View application logs"
echo "  pm2 restart finman-api - Restart application"
echo "  pm2 monit              - Monitor application"
echo ""
print_status "All done! 🚀"

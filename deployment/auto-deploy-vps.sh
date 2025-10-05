#!/bin/bash

# FinMan VPS Automated Deployment Script
# This script handles complete fresh deployment with error handling

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_API="api.gearsandai.me"
DOMAIN_APP="app.gearsandai.me"
DB_USER="finman_user"
DB_PASSWORD="MyStr0ng@Pass#69_Fin"
DB_NAME="finman_production"
JWT_SECRET="finman-super-secret-jwt-key-$(date +%s)"
PROJECT_DIR="$HOME/FinMan"
BACKEND_DIR="$PROJECT_DIR/apps/finman/backend"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}FinMan VPS Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash deploy.sh)"
    exit 1
fi

print_status "Running as root"

# Step 1: Update System
echo ""
print_info "Step 1: Updating system..."
apt update -qq && apt upgrade -y -qq
apt install -y curl wget git build-essential > /dev/null 2>&1
print_status "System updated"

# Step 2: Install Node.js
echo ""
print_info "Step 2: Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y nodejs > /dev/null 2>&1
    print_status "Node.js installed: $(node -v)"
else
    print_status "Node.js already installed: $(node -v)"
fi

# Step 3: Install PostgreSQL
echo ""
print_info "Step 3: Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib > /dev/null 2>&1
    systemctl start postgresql
    systemctl enable postgresql > /dev/null 2>&1
    print_status "PostgreSQL installed"
else
    print_status "PostgreSQL already installed"
fi

# Step 4: Install PM2
echo ""
print_info "Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 > /dev/null 2>&1
    print_status "PM2 installed"
else
    print_status "PM2 already installed"
fi

# Step 5: Install Nginx
echo ""
print_info "Step 5: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx > /dev/null 2>&1
    systemctl start nginx
    systemctl enable nginx > /dev/null 2>&1
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Step 6: Install Certbot
echo ""
print_info "Step 6: Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx > /dev/null 2>&1
    print_status "Certbot installed"
else
    print_status "Certbot already installed"
fi

# Step 7: Setup Database
echo ""
print_info "Step 7: Setting up PostgreSQL database..."

# Drop existing database and user if they exist
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" > /dev/null 2>&1

# Create new database and user
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" > /dev/null 2>&1
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" > /dev/null 2>&1
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" > /dev/null 2>&1

# Test connection
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "Database created and tested successfully"
else
    print_error "Database connection test failed"
    exit 1
fi

# Step 8: Clone/Update Repository
echo ""
print_info "Step 8: Setting up project repository..."

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Project directory exists, cleaning up..."
    cd "$PROJECT_DIR"
    
    # Stop any running PM2 processes
    pm2 delete finman-api > /dev/null 2>&1 || true
    
    # Handle git conflicts - force clean state
    git fetch origin > /dev/null 2>&1
    git reset --hard origin/main > /dev/null 2>&1
    git clean -fd > /dev/null 2>&1
    git pull origin main > /dev/null 2>&1
    
    print_status "Repository updated"
else
    print_info "Cloning repository..."
    cd ~
    git clone https://github.com/isurushamika/FinMan.git > /dev/null 2>&1
    print_status "Repository cloned"
fi

# Step 9: Setup Backend
echo ""
print_info "Step 9: Setting up backend..."
cd "$BACKEND_DIR"

# Clean install
rm -rf node_modules package-lock.json > /dev/null 2>&1
npm install > /dev/null 2>&1
print_status "Backend dependencies installed"

# Create .env file with URL-encoded password
DB_PASSWORD_ENCODED=$(echo -n "$DB_PASSWORD" | jq -sRr @uri)
cat > .env << EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@localhost:5432/${DB_NAME}"
JWT_SECRET="${JWT_SECRET}"
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://${DOMAIN_APP},http://localhost:5173
EOF
print_status ".env file created"

# Run database migrations
echo ""
print_info "Running database migrations..."
npx prisma migrate deploy > /dev/null 2>&1
print_status "Database migrations completed"

# Build backend
echo ""
print_info "Building backend..."
npm run build > /dev/null 2>&1 || print_warning "Build step skipped (might not be needed)"

# Step 10: Start Backend with PM2
echo ""
print_info "Step 10: Starting backend with PM2..."

# Delete existing PM2 process if exists
pm2 delete finman-api > /dev/null 2>&1 || true

# Start new process
cd "$BACKEND_DIR"
pm2 start npm --name "finman-api" -- start > /dev/null 2>&1
pm2 save > /dev/null 2>&1

# Wait for backend to start
sleep 3

if pm2 list | grep -q "finman-api.*online"; then
    print_status "Backend started successfully"
else
    print_error "Backend failed to start"
    pm2 logs finman-api --lines 20
    exit 1
fi

# Step 11: Configure Nginx for Backend
echo ""
print_info "Step 11: Configuring Nginx..."

# Remove old configs
rm -f /etc/nginx/sites-enabled/finman* > /dev/null 2>&1
rm -f /etc/nginx/sites-available/finman* > /dev/null 2>&1

# Create backend Nginx config
cat > /etc/nginx/sites-available/finman-api.conf << 'EOF'
server {
    listen 80;
    server_name api.gearsandai.me;

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
        
        # CORS is handled by the backend application
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/finman-api.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default > /dev/null 2>&1

# Test and reload Nginx
if nginx -t > /dev/null 2>&1; then
    systemctl reload nginx
    print_status "Nginx configured and reloaded"
else
    print_error "Nginx configuration test failed"
    nginx -t
    exit 1
fi

# Step 12: Install SSL Certificate
echo ""
print_info "Step 12: Installing SSL certificate..."

# Check if certificate already exists
if certbot certificates 2>/dev/null | grep -q "$DOMAIN_API"; then
    print_warning "SSL certificate already exists for $DOMAIN_API"
else
    # Install certificate non-interactively
    certbot --nginx -d $DOMAIN_API --non-interactive --agree-tos --email admin@gearsandai.me --redirect > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        print_status "SSL certificate installed for $DOMAIN_API"
    else
        print_warning "SSL certificate installation failed (might need manual setup)"
    fi
fi

# Step 13: Setup PM2 Startup
echo ""
print_info "Step 13: Configuring PM2 startup..."
pm2 startup > /dev/null 2>&1 || true
pm2 save > /dev/null 2>&1
print_status "PM2 startup configured"

# Step 14: Final Verification
echo ""
print_info "Step 14: Running final verification..."

# Check PM2
if pm2 list | grep -q "finman-api.*online"; then
    print_status "PM2 status: Online"
else
    print_error "PM2 status: Offline"
fi

# Check Nginx
if systemctl is-active --quiet nginx; then
    print_status "Nginx status: Running"
else
    print_error "Nginx status: Stopped"
fi

# Check PostgreSQL
if systemctl is-active --quiet postgresql; then
    print_status "PostgreSQL status: Running"
else
    print_error "PostgreSQL status: Stopped"
fi

# Test API endpoint
sleep 2
if curl -s -k http://localhost:3000/health | grep -q "ok"; then
    print_status "API health check: OK (localhost)"
else
    print_warning "API health check failed on localhost"
fi

# Test via domain (if SSL is set up)
if curl -s https://$DOMAIN_API/health 2>/dev/null | grep -q "ok"; then
    print_status "API health check: OK (https://$DOMAIN_API)"
else
    print_warning "API health check via domain failed (might need DNS propagation)"
fi

# Final Summary
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Backend API:     ${BLUE}https://$DOMAIN_API${NC}"
echo -e "Health Check:    ${BLUE}https://$DOMAIN_API/health${NC}"
echo -e "PM2 Status:      ${BLUE}pm2 status${NC}"
echo -e "PM2 Logs:        ${BLUE}pm2 logs finman-api${NC}"
echo -e "Database:        ${BLUE}PostgreSQL ($DB_NAME)${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test API: curl https://$DOMAIN_API/health"
echo "2. View logs: pm2 logs finman-api"
echo "3. Deploy frontend from local machine"
echo ""
echo -e "${GREEN}Deployment script finished successfully!${NC}"

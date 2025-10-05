# 🚀 VPS Deployment Guide - Phase 7

**Date:** October 5, 2025  
**Status:** Production Deployment Ready  
**Target:** Ubuntu VPS Server

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Preparation](#server-preparation)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL/HTTPS Setup](#ssl-https-setup)
8. [PM2 Process Management](#pm2-process-management)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### What You Need

- ✅ Ubuntu VPS server (20.04 LTS or higher)
- ✅ Domain name pointing to your VPS IP
- ✅ SSH access to VPS
- ✅ Git installed on VPS
- ✅ Port 80 and 443 open on firewall

### VPS Specifications (Minimum)

- **RAM:** 2 GB
- **CPU:** 1 vCPU
- **Storage:** 20 GB SSD
- **OS:** Ubuntu 20.04/22.04 LTS

---

## 🖥️ Server Preparation

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Install Node.js (v18 LTS)

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### 4. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
```

### 5. Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### 6. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

### 7. Install Git

```bash
sudo apt install -y git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE finman_production;
CREATE USER finman_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE finman_production TO finman_user;

# Exit PostgreSQL
\q
```

### 2. Update PostgreSQL Authentication

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add this line (after the local connections):
local   finman_production   finman_user                     md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Test Database Connection

```bash
psql -U finman_user -d finman_production -h localhost
# Enter password when prompted
# Exit with: \q
```

---

## 🔙 Backend Deployment

### 1. Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/finman
sudo chown -R $USER:$USER /var/www/finman

# Clone your repository
cd /var/www/finman
git clone https://github.com/isurushamika/FinMan.git .

# Or if already cloned, pull latest
git pull origin main
```

### 2. Setup Backend

```bash
cd /var/www/finman/apps/finman/backend

# Install dependencies
npm install --production

# Install Prisma CLI globally (optional)
npm install -g prisma
```

### 3. Create Production Environment File

```bash
nano .env
```

**Add this content:**

```env
# Database
DATABASE_URL="postgresql://finman_user:your_secure_password_here@localhost:5432/finman_production?schema=public"

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# JWT
JWT_SECRET=your_very_long_random_secret_key_min_32_chars_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

**Generate a secure JWT secret:**

```bash
# Generate random 64-character secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db pull
```

### 5. Build Backend

```bash
npm run build
```

### 6. Test Backend Locally

```bash
# Start temporarily
npm start

# In another terminal, test:
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Stop the server (Ctrl+C)
```

---

## 🎨 Frontend Deployment

### 1. Update Production Environment

```bash
cd /var/www/finman/apps/finman/frontend

# Edit .env.production
nano .env.production
```

**Update with your actual domain:**

```env
VITE_API_URL=https://api.yourdomain.com
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Frontend

```bash
npm run build
```

**Output location:** `/var/www/finman/apps/finman/frontend/dist`

### 4. Verify Build

```bash
ls -lh dist/
# Should see: index.html, assets/, etc.
```

---

## 🌐 Nginx Configuration

### 1. Create Nginx Config for Backend API

```bash
sudo nano /etc/nginx/sites-available/finman-api
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # API Backend
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File uploads
    client_max_body_size 10M;
}
```

### 2. Create Nginx Config for Frontend

```bash
sudo nano /etc/nginx/sites-available/finman-web
```

**Add this configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/finman/apps/finman/frontend/dist;
    index index.html;

    # Frontend SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

### 3. Enable Sites

```bash
# Create symbolic links
sudo ln -s /etc/nginx/sites-available/finman-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/finman-web /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Update DNS Records

**Add these DNS records at your domain registrar:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | your_vps_ip | 3600 |
| A | www | your_vps_ip | 3600 |
| A | api | your_vps_ip | 3600 |

---

## 🔒 SSL/HTTPS Setup

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificates

```bash
# Get certificates for both domains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

### 3. Test Auto-Renewal

```bash
sudo certbot renew --dry-run
```

### 4. Verify HTTPS

```bash
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

---

## 🔄 PM2 Process Management

### 1. Create PM2 Ecosystem File

```bash
cd /var/www/finman
nano ecosystem.config.js
```

**Add this configuration:**

```javascript
module.exports = {
  apps: [
    {
      name: 'finman-api',
      cwd: '/var/www/finman/apps/finman/backend',
      script: 'dist/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/finman-api-error.log',
      out_file: '/var/log/pm2/finman-api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10
    }
  ]
};
```

### 2. Create Log Directory

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

### 3. Start Application with PM2

```bash
# Start the app
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs finman-api

# Monitor
pm2 monit
```

### 4. Setup PM2 Startup Script

```bash
# Generate startup script
pm2 startup

# Copy and run the command it outputs (will be something like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username

# Save current PM2 process list
pm2 save
```

### 5. Useful PM2 Commands

```bash
# Restart app
pm2 restart finman-api

# Stop app
pm2 stop finman-api

# Delete app
pm2 delete finman-api

# Reload with zero downtime
pm2 reload finman-api

# View logs
pm2 logs finman-api --lines 100

# Clear logs
pm2 flush
```

---

## 🧪 Testing

### 1. Backend API Tests

```bash
# Health check
curl https://api.yourdomain.com/health

# Register user
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'

# Login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 2. Frontend Tests

```bash
# Access from browser
https://yourdomain.com

# Should see the login/register page
# Test registration and login
# Test creating items, purchases, transactions
```

### 3. Android App Tests

**Update Android app environment:**

1. Edit `.env.production`:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

2. Rebuild Android app:
   ```bash
   # On Windows
   cd D:\Projects\Dev\financial
   copy apps\finman\frontend\.env.production apps\finman\frontend\.env
   cd apps\finman\frontend
   npm run build
   npx cap sync
   cd android
   .\gradlew assembleRelease
   ```

3. Install and test on device

### 4. Load Testing (Optional)

```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://api.yourdomain.com/health
```

---

## 🔍 Monitoring & Maintenance

### 1. Server Monitoring

```bash
# Install htop
sudo apt install -y htop

# Monitor resources
htop

# Check disk usage
df -h

# Check memory
free -h

# Check network
sudo netstat -tulpn | grep LISTEN
```

### 2. Application Logs

```bash
# PM2 logs
pm2 logs finman-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 3. Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Manual backup
pg_dump -U finman_user -h localhost finman_production > ~/backups/finman_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (crontab)
crontab -e

# Add this line:
0 2 * * * pg_dump -U finman_user -h localhost finman_production > ~/backups/finman_$(date +\%Y\%m\%d).sql
```

### 4. Automated Updates

```bash
# Create update script
nano ~/update-finman.sh
```

**Add:**

```bash
#!/bin/bash

echo "Updating FinMan application..."

cd /var/www/finman

# Pull latest code
git pull origin main

# Update backend
cd apps/finman/backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build

# Update frontend
cd ../frontend
npm install
npm run build

# Restart PM2
pm2 restart finman-api

echo "Update complete!"
```

**Make executable:**

```bash
chmod +x ~/update-finman.sh
```

---

## 🛡️ Security Best Practices

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Fail2Ban (Brute Force Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local
```

**Add:**

```ini
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
```

**Start Fail2Ban:**

```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Regular Updates

```bash
# Create update script
sudo nano /etc/cron.weekly/system-update

# Add:
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
```

**Make executable:**

```bash
sudo chmod +x /etc/cron.weekly/system-update
```

---

## 🚨 Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs finman-api

# Check if port is in use
sudo lsof -i :3000

# Check database connection
psql -U finman_user -d finman_production -h localhost

# Restart PM2
pm2 restart finman-api
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### SSL Certificate Issues

```bash
# Renew certificates manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

---

## 📊 Performance Optimization

### 1. Enable Gzip in Nginx

Already configured in nginx config above.

### 2. Enable HTTP/2

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/finman-web

# Change:
listen 443 ssl http2;
```

### 3. Database Query Optimization

```bash
# Connect to database
psql -U finman_user -d finman_production

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "Transaction" WHERE "userId" = 1;

# Create indexes if needed
CREATE INDEX idx_transaction_user ON "Transaction"("userId");
```

### 4. PM2 Cluster Mode

Already configured in ecosystem.config.js (2 instances).

---

## ✅ Deployment Checklist

- [ ] VPS provisioned and accessible
- [ ] Node.js installed (v18+)
- [ ] PostgreSQL installed and configured
- [ ] Nginx installed
- [ ] PM2 installed
- [ ] Database created
- [ ] Code cloned/pulled
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Backend built successfully
- [ ] Frontend built successfully
- [ ] Nginx configured for both API and web
- [ ] DNS records updated
- [ ] SSL certificates obtained
- [ ] PM2 process started
- [ ] Firewall configured
- [ ] Health checks passing
- [ ] Registration/login working
- [ ] CRUD operations working
- [ ] Android app connects to production
- [ ] Backup strategy in place
- [ ] Monitoring setup

---

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-lambda)

---

## 🎉 Success!

Once all steps are complete:
- Your backend API will be running at `https://api.yourdomain.com`
- Your web app will be accessible at `https://yourdomain.com`
- Your Android app will sync with the production server
- All data centralized on your VPS

**Congratulations on completing the deployment!** 🚀

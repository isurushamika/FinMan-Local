# VPS Fresh Installation Guide

Complete guide to wipe and reinstall everything on your VPS.

---

## ⚠️ WARNING

**This will DELETE everything on your VPS!**
- All files
- All databases
- All configurations
- All installed software

**Backup first if you have important data!**

---

## 📋 Backup First (Optional)

```bash
# SSH into VPS
ssh root@198.23.228.126

# Backup database
pg_dump -U finman_user -d finman_production -h localhost > ~/finman_backup_$(date +%Y%m%d).sql

# Download backup to local machine
# On local machine:
scp root@198.23.228.126:~/finman_backup_*.sql ./
```

---

## 🗑️ Option 1: Reinstall from Provider Panel (Easiest)

### RackNerd Control Panel

1. **Login to RackNerd**
   - Go to https://my.racknerd.com
   - Login with your credentials

2. **Access Your Server**
   - Click on your VPS service
   - Go to "Manage" or "Control Panel"

3. **Reinstall OS**
   - Look for "Reinstall OS" or "Rebuild Server"
   - Select: **Ubuntu 22.04 LTS** (recommended)
   - Confirm reinstallation
   - Wait 5-10 minutes

4. **Get New Root Password**
   - Provider will email you or show in panel
   - Note the new root password

5. **Test SSH Access**
   ```bash
   ssh root@198.23.228.126
   # Enter new password
   ```

---

## 🛠️ Option 2: Manual Wipe (Advanced)

**Only if you can't reinstall from panel**

```bash
# SSH into VPS
ssh root@198.23.228.126

# Stop all services
pm2 kill
sudo systemctl stop nginx
sudo systemctl stop postgresql

# Remove all data (CAREFUL!)
sudo rm -rf /root/FinMan
sudo rm -rf /var/www/finman-app
sudo rm -rf /etc/nginx/sites-enabled/finman*
sudo rm -rf /etc/nginx/sites-available/finman*

# Drop database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finman_production;"
sudo -u postgres psql -c "DROP USER IF EXISTS finman_user;"

# Remove SSL certificates
sudo certbot delete --cert-name api.gearsandai.me
sudo certbot delete --cert-name app.gearsandai.me

# Clear PM2
pm2 delete all
pm2 save --force

# Reboot
sudo reboot
```

---

## 🚀 Fresh Installation Steps

### Step 1: Update System

```bash
# SSH into fresh VPS
ssh root@198.23.228.126

# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 2: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
sudo systemctl status postgresql
```

### Step 4: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup
pm2 startup
# Run the command it outputs

# Verify
pm2 list
```

### Step 5: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Step 6: Install Certbot (SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify
certbot --version
```

---

## 🗄️ Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER finman_user WITH PASSWORD 'MyStr0ng@Pass#69_Fin';
CREATE DATABASE finman_production OWNER finman_user;
GRANT ALL PRIVILEGES ON DATABASE finman_production TO finman_user;
\q
```

Test connection:
```bash
psql -U finman_user -d finman_production -h localhost
# Password: MyStr0ng@Pass#69_Fin
\q
```

---

## 📦 Deploy Backend

```bash
# Clone repository
cd ~
git clone https://github.com/isurushamika/FinMan.git
cd FinMan/apps/finman/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

Paste this:
```env
DATABASE_URL="postgresql://finman_user:MyStr0ng%40Pass%2369_Fin@localhost:5432/finman_production"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3000
NODE_ENV=production
```

Save (Ctrl+O, Enter, Ctrl+X)

```bash
# Run database migrations
npx prisma migrate deploy

# Build backend
npm run build

# Start with PM2
pm2 start npm --name "finman-api" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs finman-api
```

---

## 🌐 Configure Nginx (Backend)

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/finman.conf
```

Paste this:
```nginx
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
    }
}
```

Save and exit.

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/finman.conf /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔐 Install SSL Certificate

```bash
# Install SSL for backend
sudo certbot --nginx -d api.gearsandai.me

# Follow prompts:
# 1. Enter email
# 2. Agree to terms
# 3. Choose to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ Test Backend

```bash
# Test health endpoint
curl https://api.gearsandai.me/health

# Should return:
# {"status":"ok"}
```

From local machine:
```powershell
# Test from Windows
Invoke-RestMethod -Uri "https://api.gearsandai.me/health"
```

---

## 📱 Optional: Deploy Frontend Web

```bash
# Create web directory
sudo mkdir -p /var/www/finman-app

# From local machine, deploy frontend
cd D:\Projects\Dev\financial
.\deployment\deploy-frontend.bat

# Then on VPS, install SSL
sudo certbot --nginx -d app.gearsandai.me
```

---

## 🔄 Final Verification

```bash
# On VPS, check everything
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# Test database
psql -U finman_user -d finman_production -h localhost -c "SELECT 1;"

# Test API
curl https://api.gearsandai.me/health

# Check SSL
sudo certbot certificates
```

---

## 📊 Expected Results

After completion:
- ✅ Ubuntu 22.04 LTS fresh install
- ✅ Node.js 20.x installed
- ✅ PostgreSQL 14 running
- ✅ PM2 managing backend
- ✅ Nginx reverse proxy configured
- ✅ SSL certificate installed
- ✅ Backend API live at https://api.gearsandai.me
- ✅ Database created and migrated

---

## 🐛 Troubleshooting

### Can't SSH after reinstall
```bash
# Remove old SSH key from local machine
ssh-keygen -R 198.23.228.126

# Try again
ssh root@198.23.228.126
```

### Database connection fails
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check user exists
sudo -u postgres psql -c "\du"

# Reset password
sudo -u postgres psql -c "ALTER USER finman_user WITH PASSWORD 'MyStr0ng@Pass#69_Fin';"
```

### PM2 not starting backend
```bash
# Check logs
pm2 logs finman-api

# Check .env file
cat ~/FinMan/apps/finman/backend/.env

# Restart
pm2 restart finman-api
```

### Nginx errors
```bash
# Test config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

---

## 🎯 Quick Command Summary

```bash
# Complete fresh install (run one by one)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs postgresql postgresql-contrib nginx certbot python3-certbot-nginx git build-essential
sudo npm install -g pm2
pm2 startup

# Setup database
sudo -u postgres psql -c "CREATE USER finman_user WITH PASSWORD 'MyStr0ng@Pass#69_Fin';"
sudo -u postgres psql -c "CREATE DATABASE finman_production OWNER finman_user;"

# Deploy backend
cd ~
git clone https://github.com/isurushamika/FinMan.git
cd FinMan/apps/finman/backend
npm install
# Create .env (see above)
npx prisma migrate deploy
pm2 start npm --name "finman-api" -- start
pm2 save

# Configure Nginx (copy config from above)
# Install SSL
sudo certbot --nginx -d api.gearsandai.me

# Test
curl https://api.gearsandai.me/health
```

---

**Total Time:** ~20-30 minutes for complete fresh install

**Your VPS will be clean and ready!** 🎉

---

*Last Updated: October 5, 2025*

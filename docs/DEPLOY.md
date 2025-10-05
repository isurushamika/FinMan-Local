# Deployment Guide

Complete guide for deploying FinMan backend and frontend.

---

## 🎯 Overview

- **Backend**: VPS at https://api.gearsandai.me
- **Frontend Web**: https://app.gearsandai.me  
- **Android**: APK file (5.28 MB)

---

## 1️⃣ Backend Deployment (VPS)

### Automated Deployment (Recommended) 🚀

**Direct on VPS (Git-based):**
```bash
# SSH into VPS
ssh root@198.23.228.126

# Clone/update repo and run deployment
cd /opt
git clone https://github.com/isurushamika/FinMan.git || (cd FinMan && git pull)
cd FinMan
chmod +x deployment/auto-deploy-vps.sh
sudo bash deployment/auto-deploy-vps.sh
```

**One-liner from anywhere:**
```bash
ssh root@198.23.228.126 "cd /opt && (git clone https://github.com/isurushamika/FinMan.git || (cd FinMan && git pull)) && cd FinMan && chmod +x deployment/auto-deploy-vps.sh && bash deployment/auto-deploy-vps.sh"
```

**What it does:**
- ✅ Installs all dependencies (Node.js, PostgreSQL, Nginx, PM2, Certbot)
- ✅ Sets up database with correct user/password
- ✅ Clones/updates repository (handles Git conflicts automatically)
- ✅ Installs backend dependencies
- ✅ Runs database migrations
- ✅ Starts backend with PM2
- ✅ Configures Nginx reverse proxy
- ✅ Installs SSL certificate
- ✅ Verifies everything is working

**Time:** 5-10 minutes for complete deployment

---

### Already Deployed ✅
Your backend is live at https://api.gearsandai.me

### Manual Update Backend

```bash
# SSH into VPS
ssh root@198.23.228.126

# Pull latest code
cd ~/FinMan
git pull origin main

# Update dependencies
cd apps/finman/backend
npm install

# Restart service
pm2 restart finman-api

# Verify
pm2 status
pm2 logs finman-api --lines 20
```

### Database Migrations

If you changed `prisma/schema.prisma`:

```bash
cd ~/FinMan/apps/finman/backend
npx prisma migrate deploy
pm2 restart finman-api
```

---

## 2️⃣ Frontend Web Deployment

### Quick Deploy

```powershell
# On Windows
.\deployment\deploy-frontend.bat
```

### Manual Deploy

```bash
# 1. Build frontend
cd apps/finman/frontend
npm run build

# 2. Upload to VPS
scp -r dist/* root@198.23.228.126:/var/www/finman-app/

# 3. Upload Nginx config
scp deployment/nginx/finman-app.conf root@198.23.228.126:/tmp/

# 4. On VPS, configure Nginx
ssh root@198.23.228.126
sudo mv /tmp/finman-app.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/finman-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. Install SSL
sudo certbot --nginx -d app.gearsandai.me
```

### DNS Setup

Add A record:
- **Type**: A
- **Name**: app
- **Value**: 198.23.228.126
- **TTL**: 3600

Wait 5-10 minutes for propagation.

---

## 3️⃣ Android APK

### Build APK

```bash
cd apps/finman/frontend

# Build web assets
npm run build

# Sync with Capacitor
npx cap sync

# Build APK
cd android
.\gradlew assembleDebug
```

### APK Location

`apps/finman/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Distribute

1. Transfer to phone via USB/cloud
2. Install APK
3. Users can download from your server or share directly

---

## 🔧 Troubleshooting

### Backend Issues

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs finman-api

# Restart if needed
pm2 restart finman-api

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check database
psql -U finman_user -d finman_production -h localhost
```

### Frontend Issues

```bash
# Rebuild
cd apps/finman/frontend
rm -rf dist node_modules
npm install
npm run build

# Check API connection
curl https://api.gearsandai.me/health
```

### SSL Issues

```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 🔐 Environment Variables

### Backend `.env`

Located at: `~/FinMan/apps/finman/backend/.env`

```env
DATABASE_URL="postgresql://finman_user:MyStr0ng%40Pass%2369_Fin@localhost:5432/finman_production"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=production
```

### Frontend `.env`

Located at: `apps/finman/frontend/.env`

```env
VITE_API_URL=https://api.gearsandai.me
```

---

## 📊 Monitoring

### Check Backend Health

```bash
curl https://api.gearsandai.me/health
# Should return: {"status":"ok"}
```

### View Logs

```bash
# PM2 logs
pm2 logs finman-api

# Nginx logs
sudo tail -f /var/log/nginx/finman-error.log
sudo tail -f /var/log/nginx/finman-access.log
```

### Check Resources

```bash
# CPU & Memory
pm2 monit

# Disk space
df -h

# Database size
psql -U finman_user -d finman_production -h localhost -c "\l+"
```

---

## 🔄 Complete Update Workflow

```bash
# 1. Local: Make changes and commit
git add .
git commit -m "feat: New feature"
git push origin main

# 2. VPS: Pull and update
ssh root@198.23.228.126
cd ~/FinMan
git pull origin main
cd apps/finman/backend
npm install
pm2 restart finman-api

# 3. Verify
pm2 status
curl https://api.gearsandai.me/health
```

---

## 🆘 Emergency Recovery

### Rollback Backend

```bash
# SSH to VPS
ssh root@198.23.228.126
cd ~/FinMan

# See recent commits
git log --oneline -5

# Rollback to previous commit
git reset --hard <commit-hash>

# Restart
cd apps/finman/backend
npm install
pm2 restart finman-api
```

### Backup Database

```bash
# On VPS
pg_dump -U finman_user -d finman_production -h localhost > backup_$(date +%Y%m%d).sql

# Restore if needed
psql -U finman_user -d finman_production -h localhost < backup_20251005.sql
```

---

*Last Updated: October 5, 2025*

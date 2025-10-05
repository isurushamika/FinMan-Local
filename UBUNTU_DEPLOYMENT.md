# FinMan Server Deployment - Complete Guide

Deploy FinMan on Ubuntu server and access from desktop browsers and mobile apps.

## 🎯 What You'll Get

After this guide, you'll have:
- ✅ FinMan running on Ubuntu server
- ✅ HTTPS with free SSL certificate
- ✅ Access from any desktop browser
- ✅ PostgreSQL database
- ✅ Automatic process management with PM2
- ✅ Ready for mobile app connection

---

## 🔧 Prerequisites

**Server:**
- Ubuntu 20.04 or 22.04 LTS
- 1GB RAM minimum (2GB recommended)
- Root/sudo access
- Public IP address

**Domain:**
- Domain name (e.g., `finman.yourdomain.com`)
- DNS access to create A record

---

## ⚡ Quick Start (15 minutes)

### 1. Prepare Your Server

```bash
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y
```

### 2. Run Automated Deployment

```bash
# Download script
wget https://raw.githubusercontent.com/isurushamika/FinMan/main/deployment/finman-deploy.sh

# Edit configuration (update DOMAIN and EMAIL)
nano finman-deploy.sh

# Run deployment
bash finman-deploy.sh
```

The script will:
- ✅ Install Node.js, PostgreSQL, Nginx, PM2
- ✅ Configure database
- ✅ Setup application
- ✅ Configure Nginx with HTTPS
- ✅ Start services

---

## 📱 Connect Mobile App

### Update Capacitor Config

Edit `apps/finman/frontend/capacitor.config.ts`:

```typescript
server: {
  url: 'https://finman.yourdomain.com',
  cleartext: false
}
```

### Rebuild and Deploy

```bash
cd apps/finman/frontend
npm run build
npx cap sync
npx cap open android
```

Build APK in Android Studio!

---

## 🌐 Access Your App

### From Desktop:
- Open browser
- Go to: `https://finman.yourdomain.com`
- Create account
- Use from any computer!

### From Mobile:
- Install APK (built with Capacitor)
- App connects to your server
- All data syncs across devices

---

## 🔧 Management Commands

```bash
# View app status
pm2 status

# View logs
pm2 logs finman-backend

# Restart app
pm2 restart finman-backend

# Update app
cd /var/www/finman
git pull
cd apps/finman/frontend
npm run build
cd ../backend
npx prisma migrate deploy
pm2 restart finman-backend
```

---

## 💾 Backup Database

```bash
# Create backup
sudo -u postgres pg_dump finman_db > backup_$(date +%Y%m%d).sql

# Restore backup
sudo -u postgres psql finman_db < backup_20251004.sql
```

---

## 🐛 Common Issues

**502 Bad Gateway:**
```bash
pm2 restart finman-backend
sudo systemctl reload nginx
```

**Database error:**
```bash
# Check .env file has correct DATABASE_URL
nano /var/www/finman/apps/finman/backend/.env
```

**SSL issues:**
```bash
sudo certbot renew --force-renewal
```

---

## 📊 What's Next?

1. ✅ [Build Android APK →](./CAPACITOR_BUILD_GUIDE.md)
2. ✅ Setup automated backups
3. ✅ Configure monitoring
4. ✅ Add more users

---

**🎉 Your FinMan server is live!**

Access from:
- 💻 Any desktop browser
- 📱 Android app (built with Capacitor)
- 🍎 iOS (coming soon)

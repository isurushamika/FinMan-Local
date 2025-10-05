# 🚀 VPS Deployment Quick Start

**Phase 7: Production Deployment**

---

## 📋 Pre-Deployment Checklist

### Required Information

Before starting, gather this information:

- [ ] **VPS IP Address:** `___________________`
- [ ] **SSH Username:** `___________________`
- [ ] **Domain Name:** `___________________`
- [ ] **Database Password:** `___________________` (create a strong one!)
- [ ] **JWT Secret:** (will be auto-generated, or provide your own)

### DNS Configuration

Update DNS records at your domain registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `your_vps_ip` | 3600 |
| A | www | `your_vps_ip` | 3600 |
| A | api | `your_vps_ip` | 3600 |

**Allow 1-24 hours for DNS propagation.**

---

## 🎯 Deployment Options

### Option A: Automated Deployment (Recommended)

**Step 1:** Upload deployment script to VPS
```bash
# From your Windows machine
scp deployment/deploy-vps.sh username@your_vps_ip:~/
```

**Step 2:** Connect to VPS
```bash
ssh username@your_vps_ip
```

**Step 3:** Run deployment script
```bash
chmod +x ~/deploy-vps.sh
./deploy-vps.sh
```

The script will:
- ✅ Install all dependencies (Node.js, PostgreSQL, Nginx, PM2)
- ✅ Setup database
- ✅ Clone repository
- ✅ Configure environment
- ✅ Build and deploy application
- ✅ Configure Nginx
- ✅ Start PM2

**Step 4:** Setup SSL certificates
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

**Done!** ✅

---

### Option B: Manual Deployment

Follow the complete guide in `VPS_DEPLOYMENT_GUIDE.md`

---

## 🧪 Post-Deployment Testing

### From Your Local Machine

**Option 1: Automated Testing (Windows)**
```powershell
.\deployment\test-production.ps1 -Domain "yourdomain.com"
```

**Option 2: Manual Testing**

1. **Test API Health:**
```bash
curl https://api.yourdomain.com/health
# Expected: {"status":"ok"}
```

2. **Test Web App:**
```
Open browser: https://yourdomain.com
Should see: Login/Register page
```

3. **Register Account:**
- Create account via web interface
- Login successfully
- Create test transaction

### From VPS

**Check Application Status:**
```bash
# SSH to VPS
ssh username@your_vps_ip

# Check PM2 status
pm2 status

# Check logs
pm2 logs finman-api

# Check Nginx
sudo systemctl status nginx

# Check database
psql -U finman_user -d finman_production -c "SELECT COUNT(*) FROM \"User\";"
```

---

## 📱 Update Android App for Production

**Step 1:** Update environment file
```bash
# On Windows
cd D:\Projects\Dev\financial\apps\finman\frontend
```

Edit `.env.production`:
```env
VITE_API_URL=https://api.yourdomain.com
```

**Step 2:** Build release APK
```powershell
# Copy production environment
copy .env.production .env

# Build frontend
npm run build

# Sync with Capacitor
npx cap sync

# Build release APK
cd android
.\gradlew assembleRelease
```

**Step 3:** Sign APK (for Play Store - optional)
```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore finman-release.keystore -alias finman -keyalg RSA -keysize 2048 -validity 10000

# APK will be at:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

**Step 4:** Install and test
- Install APK on device
- Test login/register
- Create transactions
- Verify sync works
- Test offline mode

---

## 🔄 Future Updates

### Quick Update Script

When you make code changes, deploy updates easily:

**Step 1:** Upload update script (first time only)
```bash
scp deployment/update-vps.sh username@your_vps_ip:~/
ssh username@your_vps_ip
chmod +x ~/update-vps.sh
```

**Step 2:** Run update (every time)
```bash
ssh username@your_vps_ip
./update-vps.sh
```

This will:
- Pull latest code
- Update dependencies
- Run migrations
- Rebuild application
- Restart PM2
- Zero downtime!

---

## 💾 Automated Backups

### Setup Daily Backups

**Step 1:** Upload backup script
```bash
scp deployment/backup-vps.sh username@your_vps_ip:~/
ssh username@your_vps_ip
chmod +x ~/backup-vps.sh
```

**Step 2:** Test backup
```bash
./backup-vps.sh
```

**Step 3:** Schedule daily backups
```bash
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /home/username/backup-vps.sh >> /home/username/backup.log 2>&1
```

**Backups saved in:** `~/backups/finman/`

### Restore from Backup

```bash
# Restore database
gunzip -c ~/backups/finman/db_TIMESTAMP.sql.gz | psql -U finman_user -d finman_production

# Restore uploads
tar -xzf ~/backups/finman/uploads_TIMESTAMP.tar.gz -C /var/www/finman/apps/finman/backend/
```

---

## 📊 Monitoring

### Real-time Monitoring

```bash
# SSH to VPS
ssh username@your_vps_ip

# Monitor PM2
pm2 monit

# Monitor system resources
htop

# View logs
pm2 logs finman-api --lines 100
```

### Check Application Health

```bash
# From anywhere
curl https://api.yourdomain.com/health

# Should return: {"status":"ok"}
```

---

## 🚨 Common Issues

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
sudo -u postgres psql -l | grep finman
```

### Issue: "502 Bad Gateway"

**Solution:**
```bash
# Check PM2 status
pm2 status

# Restart app
pm2 restart finman-api

# Check logs
pm2 logs finman-api --lines 50
```

### Issue: "SSL certificate error"

**Solution:**
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Issue: "Android app won't connect"

**Solutions:**
1. Verify API URL in `.env.production`
2. Rebuild Android app with production config
3. Check CORS settings in backend
4. Verify SSL certificate is valid

---

## ✅ Deployment Verification Checklist

- [ ] VPS accessible via SSH
- [ ] DNS records configured and propagated
- [ ] All dependencies installed (Node, PostgreSQL, Nginx, PM2)
- [ ] Database created and accessible
- [ ] Repository cloned
- [ ] Backend environment configured
- [ ] Frontend environment configured
- [ ] Database migrations completed
- [ ] Backend built and running
- [ ] Frontend built and deployed
- [ ] Nginx configured
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] PM2 startup configured
- [ ] Health check returns {"status":"ok"}
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transactions
- [ ] Can create items
- [ ] Can create budgets
- [ ] Web app accessible at https://yourdomain.com
- [ ] API accessible at https://api.yourdomain.com
- [ ] Android app connects to production
- [ ] Offline sync works
- [ ] Backups configured

---

## 📞 Support

### Useful Commands

```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql

# View all logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory usage
free -h

# Check who's using port 3000
sudo lsof -i :3000
```

### Log Locations

- **PM2 Logs:** `/var/log/pm2/`
- **Nginx Access:** `/var/log/nginx/access.log`
- **Nginx Error:** `/var/log/nginx/error.log`
- **PostgreSQL:** `/var/log/postgresql/`

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ API health check returns `{"status":"ok"}`  
✅ Can register and login via web app  
✅ Can create transactions, items, budgets  
✅ Android app connects to production API  
✅ Offline sync queues operations  
✅ SSL certificates valid (HTTPS working)  
✅ PM2 shows app running  
✅ Data persists across restarts  

---

## 📚 Documentation References

- **Full Guide:** `VPS_DEPLOYMENT_GUIDE.md`
- **Automated Script:** `deployment/deploy-vps.sh`
- **Update Script:** `deployment/update-vps.sh`
- **Backup Script:** `deployment/backup-vps.sh`
- **Testing Script:** `deployment/test-production.ps1`

---

**Ready to deploy? Follow Option A above to get started!** 🚀

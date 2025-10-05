# ✅ VPS & Android Setup Checklist

**Print this page and check off items as you complete them!**

---

## 📋 PRE-DEPLOYMENT

### Gather Information
- [ ] VPS IP: ___.___.___.___ 
- [ ] SSH Username: ____________
- [ ] Domain: ____________.com
- [ ] Database Password: ____________ (strong!)
- [ ] GitHub Repo: ____________

### VPS Setup
- [ ] VPS created (Ubuntu 22.04, 2GB RAM)
- [ ] Can SSH to VPS
- [ ] Created finman user with sudo

### DNS Setup
- [ ] A record: @ → VPS IP
- [ ] A record: www → VPS IP
- [ ] A record: api → VPS IP
- [ ] DNS propagated (wait 30 min, test with nslookup)

---

## 🚀 DEPLOYMENT

### Upload Script
- [ ] Uploaded deploy-vps.sh to VPS
- [ ] Made script executable (chmod +x)

### Run Deployment
- [ ] Ran ./deploy-vps.sh
- [ ] Entered database name
- [ ] Entered database password (saved it!)
- [ ] Entered domain name
- [ ] Entered git repo URL
- [ ] Script completed successfully

### Verify Deployment
- [ ] pm2 status shows "online"
- [ ] curl http://localhost:3000/health returns OK
- [ ] nginx is running
- [ ] Database accessible

---

## 🔒 SSL SETUP

### Install SSL
- [ ] Installed certbot
- [ ] Ran certbot --nginx
- [ ] Entered email address
- [ ] Agreed to terms
- [ ] Chose redirect HTTP to HTTPS
- [ ] Certificates installed successfully

### Test SSL
- [ ] https://api.yourdomain.com/health works
- [ ] https://yourdomain.com loads
- [ ] Green padlock shows in browser
- [ ] certbot renew --dry-run succeeds

---

## 🧪 TESTING

### Run Automated Tests
- [ ] Ran test-production.ps1
- [ ] All 11 tests passed
- [ ] No errors shown

### Manual Web Testing
- [ ] Can access https://yourdomain.com
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transaction
- [ ] Can create item
- [ ] Can create budget
- [ ] Data persists after refresh

---

## 📱 ANDROID APP

### Update Environment
- [ ] Updated .env.production with production URL
- [ ] Copied to .env
- [ ] Verified URL is correct

### Build App
- [ ] npm run build completed
- [ ] npx cap sync completed
- [ ] gradlew clean completed
- [ ] gradlew assembleDebug completed
- [ ] APK generated successfully

### Install & Test
- [ ] APK installed on device
- [ ] App launches without crash
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transaction
- [ ] Can create item
- [ ] Offline mode works
- [ ] Sync works when online
- [ ] Multi-device sync works

---

## 💾 MAINTENANCE SETUP

### Backups
- [ ] Uploaded backup-vps.sh
- [ ] Made executable
- [ ] Tested backup script
- [ ] Set up cron job for daily backup

### Monitoring
- [ ] Verified pm2 startup script
- [ ] Tested pm2 restart
- [ ] Can view logs with pm2 logs
- [ ] Can access nginx logs

### Updates
- [ ] Uploaded update-vps.sh
- [ ] Made executable
- [ ] Tested update process
- [ ] Zero-downtime update works

---

## ✅ FINAL VERIFICATION

### Production Ready
- [ ] API health check: https://api.yourdomain.com/health ✓
- [ ] Web app: https://yourdomain.com ✓
- [ ] SSL valid (green padlock) ✓
- [ ] Android app connected ✓
- [ ] Offline sync working ✓
- [ ] Multi-device sync working ✓
- [ ] Backups configured ✓
- [ ] All tests passing ✓

---

## 📞 IMPORTANT INFO TO SAVE

**VPS Details:**
```
IP: _______________
Username: _______________
SSH: ssh username@ip
```

**Database:**
```
Name: finman_production
User: finman_user
Password: _______________ (SAVE THIS!)
```

**URLs:**
```
Web: https://yourdomain.com
API: https://api.yourdomain.com
```

**Keystore (if created):**
```
File: finman-release.keystore
Password: _______________ (SAVE THIS!)
Location: _______________
```

---

## 🎯 QUICK COMMANDS

**SSH to VPS:**
```bash
ssh finman@your_vps_ip
```

**Check Status:**
```bash
pm2 status
pm2 logs finman-api
```

**Update App:**
```bash
./update-vps.sh
```

**Backup:**
```bash
./backup-vps.sh
```

**Test Production:**
```powershell
.\deployment\test-production.ps1 -Domain "yourdomain.com"
```

**Build Android:**
```powershell
cd apps\finman\frontend
copy .env.production .env
npm run build
npx cap sync
cd android
.\gradlew assembleDebug
```

---

## 🎉 SUCCESS!

Date Completed: _______________

All systems operational! 🚀

**Your FinMan app is now live in production!**

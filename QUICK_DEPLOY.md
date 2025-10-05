# FinMan - Quick Deployment Reference

## 🌐 Your URLs

| Service | URL | Status |
|---------|-----|--------|
| Backend API | https://api.gearsandai.me | ✅ Live |
| Frontend Web | https://app.gearsandai.me | ⏳ Deploy |
| Android App | APK File (5.3 MB) | ✅ Built |

---

## ⚡ Quick Deploy Commands

### Build Frontend
```bash
cd apps/finman/frontend
npm run build
```

### Deploy to VPS (Windows)
```bash
.\deployment\deploy-frontend.bat
```

### Deploy to VPS (Manual)
```bash
# Upload files
scp -r apps/finman/frontend/dist/* root@198.23.228.126:/var/www/finman-app/

# Upload config
scp deployment/nginx/finman-app.conf root@198.23.228.126:/tmp/

# On VPS
ssh root@198.23.228.126
sudo mv /tmp/finman-app.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/finman-app.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d app.gearsandai.me
```

---

## 📋 DNS Setup

Add this A record to your domain DNS:

```
Type: A
Name: app
Value: 198.23.228.126
TTL: 3600
```

Wait 5-10 minutes for propagation.

---

## ✅ Verify Deployment

```bash
# Check DNS
nslookup app.gearsandai.me

# Check HTTP → HTTPS redirect
curl -I http://app.gearsandai.me

# Check HTTPS
curl -I https://app.gearsandai.me

# Should see: HTTP/1.1 200 OK
```

Open browser: https://app.gearsandai.me

---

## 🔄 Update Frontend

```bash
# Build
cd apps/finman/frontend
npm run build

# Upload
scp -r dist/* root@198.23.228.126:/var/www/finman-app/

# Done! (No need to reload Nginx for static files)
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Site not loading | Check DNS: `nslookup app.gearsandai.me` |
| SSL error | Run: `sudo certbot --nginx -d app.gearsandai.me` |
| 404 on routes | Check Nginx config has `try_files $uri $uri/ /index.html;` |
| API not working | Verify `.env` has `VITE_API_URL=https://api.gearsandai.me` |

---

## 📱 User Access Options

### Option 1: Web App (PWA)
- URL: https://app.gearsandai.me
- Works on any device with a browser
- Installable as PWA
- Auto-updates

### Option 2: Android APK
- File: `apps/finman/frontend/android/app/build/outputs/apk/debug/app-debug.apk`
- Size: 5.3 MB
- Full native features
- Manual updates

**Both use same backend API!**

---

## 🔐 Current Configuration

```env
VITE_API_URL=https://api.gearsandai.me
```

Frontend → connects to → Backend API → PostgreSQL Database

All traffic encrypted with SSL ✅

---

## 📞 Support

- Backend logs: `ssh root@198.23.228.126 "pm2 logs finman-api"`
- Frontend logs: `ssh root@198.23.228.126 "sudo tail -f /var/log/nginx/finman-app-*.log"`
- SSL status: `ssh root@198.23.228.126 "sudo certbot certificates"`

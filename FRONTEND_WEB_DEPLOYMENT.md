# FinMan Frontend Web Deployment Guide

This guide will help you deploy the FinMan frontend as a web application accessible at `https://app.gearsandai.me`.

## 🎯 Overview

- **Frontend URL**: `https://app.gearsandai.me`
- **Backend API**: `https://api.gearsandai.me` (already deployed)
- **Platform**: Ubuntu 22.04 VPS with Nginx
- **SSL**: Let's Encrypt (Certbot)

---

## 📋 Prerequisites

✅ Backend API deployed and running at `https://api.gearsandai.me`  
✅ Domain DNS configured (add A record for `app.gearsandai.me`)  
✅ SSH access to VPS  
✅ Node.js installed locally  

---

## 🚀 Quick Deployment (Windows)

### Option 1: Automated Script

```powershell
# Run the deployment script
.\deployment\deploy-frontend.bat
```

Then follow the on-screen instructions to complete the deployment.

### Option 2: Manual Deployment

#### Step 1: Build the Frontend

```powershell
cd apps\finman\frontend
npm install
npm run build
```

The build output will be in `apps/finman/frontend/dist/`

#### Step 2: Upload to VPS

Using WinSCP, FileZilla, or SCP command:

```powershell
# Upload dist folder contents
scp -r apps/finman/frontend/dist/* root@198.23.228.126:/var/www/finman-app/

# Upload Nginx configuration
scp deployment/nginx/finman-app.conf root@198.23.228.126:/tmp/
```

#### Step 3: Configure VPS

SSH into your VPS:

```bash
ssh root@198.23.228.126
```

Then run:

```bash
# Create web directory
sudo mkdir -p /var/www/finman-app

# Set permissions
sudo chown -R www-data:www-data /var/www/finman-app
sudo chmod -R 755 /var/www/finman-app

# Install Nginx configuration
sudo mv /tmp/finman-app.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/finman-app.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 4: Install SSL Certificate

```bash
# Install SSL for the frontend domain
sudo certbot --nginx -d app.gearsandai.me
```

Follow the prompts:
- Enter your email address
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

---

## 🌐 DNS Configuration

Before deploying, add this DNS record to your domain:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | app | 198.23.228.126 | 3600 |

Or if using a subdomain:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | app | gearsandai.me | 3600 |

**Wait 5-10 minutes** for DNS propagation.

---

## ✅ Verification

### 1. Check DNS Resolution

```powershell
nslookup app.gearsandai.me
```

Should return: `198.23.228.126`

### 2. Check HTTP Response

```powershell
curl -I http://app.gearsandai.me
```

Should return a 301 redirect to HTTPS.

### 3. Check HTTPS

```powershell
curl -I https://app.gearsandai.me
```

Should return `200 OK`

### 4. Test in Browser

Visit: `https://app.gearsandai.me`

You should see the FinMan login screen.

---

## 🔧 Nginx Configuration Details

The configuration includes:

- ✅ **HTTP to HTTPS redirect** - All traffic encrypted
- ✅ **SSL/TLS** - Let's Encrypt certificates
- ✅ **Security headers** - XSS, CSP, frame protection
- ✅ **Gzip compression** - Faster loading
- ✅ **Static asset caching** - 1 year cache for JS/CSS/images
- ✅ **Service Worker support** - No caching for SW
- ✅ **SPA routing** - All routes redirect to index.html
- ✅ **CORS configured** - Frontend can access API

---

## 🔄 Updating the Frontend

When you make changes:

```powershell
# 1. Build locally
cd apps\finman\frontend
npm run build

# 2. Upload to VPS
scp -r dist/* root@198.23.228.126:/var/www/finman-app/

# 3. Clear browser cache and reload
# No need to reload Nginx for static file updates
```

---

## 📱 Progressive Web App (PWA)

The frontend is configured as a PWA, which means:

- ✅ **Installable** - Users can install it like a native app
- ✅ **Offline support** - Works without internet (cached data)
- ✅ **App-like experience** - Full screen, no browser UI
- ✅ **Auto-updates** - Service worker updates in background

### Installing as PWA

**On Desktop (Chrome/Edge):**
1. Visit `https://app.gearsandai.me`
2. Click the install icon in the address bar
3. Click "Install"

**On Mobile (Chrome/Safari):**
1. Visit `https://app.gearsandai.me`
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Tap "Add"

---

## 🔐 Security Features

- **HTTPS Only** - All traffic encrypted
- **Content Security Policy** - Prevents XSS attacks
- **Secure Headers** - X-Frame-Options, X-Content-Type-Options
- **API Connection** - Only connects to `https://api.gearsandai.me`
- **No Mixed Content** - All resources loaded over HTTPS

---

## 🐛 Troubleshooting

### Issue: "This site can't be reached"

**Solution:**
1. Check DNS: `nslookup app.gearsandai.me`
2. Verify Nginx is running: `sudo systemctl status nginx`
3. Check firewall: `sudo ufw status`

### Issue: "Your connection is not private" (SSL error)

**Solution:**
1. Re-run Certbot: `sudo certbot --nginx -d app.gearsandai.me`
2. Check certificate: `sudo certbot certificates`
3. Verify Nginx SSL config

### Issue: "404 Not Found" on routes

**Solution:**
The Nginx config should have:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Reload Nginx: `sudo systemctl reload nginx`

### Issue: API requests failing

**Solution:**
1. Check `.env` file has correct API URL: `VITE_API_URL=https://api.gearsandai.me`
2. Rebuild frontend: `npm run build`
3. Clear browser cache
4. Check browser console for CORS errors

### Issue: Service Worker not updating

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Go to browser DevTools → Application → Service Workers
3. Click "Unregister"
4. Reload page

---

## 📊 Monitoring

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/finman-app-access.log

# Error logs
sudo tail -f /var/log/nginx/finman-app-error.log
```

### Check SSL Certificate Expiry

```bash
sudo certbot certificates
```

Certificates auto-renew every 60 days.

---

## 🎉 Success!

Your FinMan frontend is now live at:

🔗 **https://app.gearsandai.me**

Users can:
- ✅ Access it from any device with a browser
- ✅ Install it as a PWA on mobile/desktop
- ✅ Use it offline with cached data
- ✅ Sync with backend API at `https://api.gearsandai.me`

---

## 📱 Mobile App vs Web App

You now have **two options** for users:

### 1. **Android APK** (Native-like)
- File: `app-debug.apk`
- Size: ~5.3 MB
- Features: Full native capabilities, biometric auth, offline-first
- Distribution: Manual install (sideload)

### 2. **Web App** (PWA)
- URL: `https://app.gearsandai.me`
- Access: Any browser on any device
- Features: Installable, offline support, auto-updates
- Distribution: Just share the URL

**Both apps connect to the same backend API!**

---

## 🔗 Related Documentation

- [Backend API Deployment](./VPS_DEPLOYMENT_GUIDE.md)
- [Android App Build Guide](../apps/finman/frontend/CAPACITOR_BUILD_GUIDE.md)
- [API Documentation](../apps/finman/backend/docs/API.md)

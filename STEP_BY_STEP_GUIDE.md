# 🚀 Step-by-Step VPS & Android Setup Guide

**Interactive Guide - Follow Along**  
**Estimated Time: 1-2 hours**

---

## 📋 Overview

This guide will walk you through:
1. ✅ VPS preparation and setup
2. ✅ Application deployment
**5. Git Repository:**
```
Enter your repo URL: https://github.com/yourusername/FinMan
```

**Note:** The script will use the already-cloned repository in `~/FinMan` SSL certificate installation
4. ✅ Android app production build
5. ✅ Testing and verification

---

## 🎯 Prerequisites Check

Before starting, make sure you have:

### Required Items
- [ ] **VPS Server** (DigitalOcean, Linode, AWS, etc.)
  - Ubuntu 20.04 or 22.04 LTS
  - Minimum: 2GB RAM, 1 CPU, 20GB SSD
  - Root or sudo access
  
- [ ] **Domain Name** (Namecheap, GoDaddy, Cloudflare, etc.)
  - Fully registered and accessible
  - Access to DNS management
  
- [ ] **SSH Client** (Windows Terminal, PuTTY, or built-in)
  - Ability to SSH into VPS
  
- [ ] **Git Repository** (GitHub)
  - Your FinMan code pushed to GitHub
  - Repository URL ready

### Information to Gather

Write down these details (you'll need them):

```
VPS IP Address: ___.___.___.___
SSH Username: __________
SSH Password/Key: __________
Domain Name: ________________.com
Database Password: __________________ (create a strong one!)
GitHub Username: __________
Git Repository URL: https://github.com/username/FinMan
```

**Important:** Make sure you've already pushed your code to GitHub:
```powershell
# On Windows, verify your code is on GitHub
cd D:\Projects\Dev\financial
git status
# Should show: "nothing to commit, working tree clean"

# If you have changes:
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 🖥️ PART 1: VPS SETUP (30-40 minutes)

### Step 1.1: Get Your VPS

**Option A: DigitalOcean (Recommended for beginners)**

1. Go to https://www.digitalocean.com/
2. Create an account
3. Click "Create" → "Droplets"
4. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($12/month - 2GB RAM)
   - **Datacenter:** Choose closest to your users
   - **Authentication:** SSH key (recommended) or Password
   - **Hostname:** finman-production
5. Click "Create Droplet"
6. Wait 1-2 minutes for droplet to be ready
7. **Note down the IP address shown**

**Option B: Other VPS Providers**
- Linode: https://www.linode.com/
- Vultr: https://www.vultr.com/
- AWS Lightsail: https://aws.amazon.com/lightsail/

### Step 1.2: Setup Domain DNS

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find "DNS Management" or "Advanced DNS"
3. Add these A records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `your_vps_ip` | 3600 |
| A | www | `your_vps_ip` | 3600 |
| A | api | `your_vps_ip` | 3600 |

**Example:**
```
A Record: @ → 159.65.123.45
A Record: www → 159.65.123.45
A Record: api → 159.65.123.45
```

4. Save changes
5. **Wait 10-30 minutes for DNS to propagate**

**Verify DNS:**
```bash
# From Windows Command Prompt
nslookup yourdomain.com
# Should show your VPS IP
```

### Step 1.3: First SSH Connection

**Windows (PowerShell):**
```powershell
ssh root@your_vps_ip
# or
ssh username@your_vps_ip
```

**If using PuTTY:**
1. Open PuTTY
2. Enter IP address
3. Port: 22
4. Click "Open"
5. Login with username/password

**First time?** Type `yes` when asked about fingerprint.

### Step 1.4: Create Non-Root User (Security Best Practice)

```bash
# Create new user
adduser finman
# Enter password when prompted

# Add to sudo group
usermod -aG sudo finman

# Test sudo access
su - finman
sudo ls -la /root
# Enter password, should work

# Exit back to root
exit
```

### Step 1.5: Install Git on VPS

```bash
# Switch to finman user
su - finman

# Update package list
sudo apt update

# Install Git
sudo apt install -y git

# Verify installation
git --version
# Should show: git version 2.x.x

# Configure Git (use your details)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Step 1.6: Clone Repository to VPS

```bash
# Still as finman user
cd ~

# Clone your repository
git clone https://github.com/yourusername/FinMan.git

# Enter the directory
cd FinMan

# Verify files are present
ls -la
# Should show: apps/, deployment/, *.md files, etc.

# Check current branch
git branch
# Should show: * main
```

**Alternative: Clone via SSH (if you have SSH keys set up):**
```bash
# Clone via SSH
git clone git@github.com:yourusername/FinMan.git
```

---

## 🚀 PART 2: AUTOMATED DEPLOYMENT (20-30 minutes)

### Step 2.1: Run Deployment Script

```bash
# Should already be in FinMan directory
cd ~/FinMan

# IMPORTANT: Pull latest changes first!
git pull origin main

# Verify you're in the right place
pwd
# Should show: /home/finman/FinMan

ls -la deployment/
# Should show: deploy-vps.sh, update-vps.sh, etc.

# Make deployment script executable
chmod +x deployment/deploy-vps.sh

# Run the deployment script
    ./deployment/deploy-vps.sh
```

### Step 2.2: Follow Script Prompts

The script will ask you questions. Here's what to enter:

**1. Database Name:**
```
Press Enter for default: finman_production
```

**2. Database User:**
```
Press Enter for default: finman_user
```

**3. Database Password:**
```
Enter a strong password (save this!)
⚠️ IMPORTANT: Do NOT use single quotes (') in the password
✓ Safe characters: A-Z, a-z, 0-9, @, #, $, %, &, *, -, _
Example: MyStr0ng@Pass#2024_Fin
```

**4. JWT Secret:**
```
Press Enter to auto-generate
(it will create a secure random key)
```

**5. Domain:**
```
Enter your domain: yourdomain.com
(without https:// or www)
```

**6. Git Repository:**
```
Enter your repo URL: https://github.com/yourusername/FinMan
```

### Step 2.3: Monitor Deployment

The script will show progress:
```
✓ System updated
✓ Node.js installed
✓ PostgreSQL installed
✓ Nginx installed
✓ PM2 installed
✓ Database created
✓ Repository cloned
✓ Backend dependencies installed
✓ Frontend dependencies installed
✓ Backend .env created
✓ Database migration completed
✓ Backend built successfully
✓ Frontend built successfully
✓ Nginx configured
✓ PM2 configured and running
✓ Firewall configured
```

**Expected time:** 10-15 minutes

### Step 2.4: Verify Deployment

```bash
# Check PM2 status
pm2 status
# Should show: finman-api | online

# Check Nginx
sudo systemctl status nginx
# Should show: active (running)

# Check database
psql -U finman_user -d finman_production -c "SELECT COUNT(*) FROM \"User\";"
# Should show: 0 (no users yet)
```

**Test API (HTTP - before SSL):**
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

---

## 🔒 PART 3: SSL CERTIFICATE SETUP (10 minutes)

### Step 3.1: Install Certbot

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Step 3.2: Obtain SSL Certificates

**Important:** Make sure DNS has propagated (wait 30 minutes after DNS setup)

```bash
# Get certificates for all subdomains
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

**Follow prompts:**
```
1. Enter email: your@email.com
2. Agree to terms: Y
3. Share email: N (optional)
4. Redirect HTTP to HTTPS: 2 (Yes - recommended)
```

**Expected output:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
...
Congratulations! You have successfully enabled HTTPS
```

### Step 3.3: Test Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Should show: Congratulations, all renewals succeeded
```

### Step 3.4: Verify HTTPS

**From your Windows machine:**
```powershell
# Test API
curl https://api.yourdomain.com/health
# Should return: {"status":"ok"}

# Or open in browser:
https://api.yourdomain.com/health
```

**You should see:**
- ✅ Green padlock in browser
- ✅ Valid SSL certificate
- ✅ {"status":"ok"} response

---

## 🧪 PART 4: TEST PRODUCTION DEPLOYMENT (10 minutes)

### Step 4.1: Run Automated Tests

**From your Windows machine:**

```powershell
cd D:\Projects\Dev\financial

# Run production tests
.\deployment\test-production.ps1 -Domain "yourdomain.com"
```

**Expected output:**
```
Test 1: Health Check
[✓] Health check passed

Test 2: SSL Certificate
[✓] SSL certificate valid

Test 3: User Registration
[✓] User registration successful

Test 4: User Login
[✓] User login successful

Test 5: Create Transaction
[✓] Transaction created: ID 1

Test 6: Get Transactions
[✓] Retrieved 1 transactions

Test 7: Create Item
[✓] Item created: ID 1

Test 8: Create Budget
[✓] Budget created: ID 1

Test 9: Delete Transaction
[✓] Transaction deleted successfully

Test 10: Frontend Accessibility
[✓] Frontend accessible

Test 11: CORS Configuration
[✓] CORS headers configured

Testing Complete!
```

### Step 4.2: Test Web Interface

Open browser and go to:
```
https://yourdomain.com
```

**You should see:**
- ✅ FinMan login/register page
- ✅ Green padlock (HTTPS)
- ✅ No errors in browser console

**Test registration:**
1. Click "Register"
2. Enter email, password, name
3. Click "Create Account"
4. Should see success message
5. Login with credentials

**Test features:**
- [ ] Create a transaction
- [ ] Create an item
- [ ] Create a budget
- [ ] View dashboard
- [ ] Logout and login again

---

## 📱 PART 5: ANDROID APP PRODUCTION BUILD (20 minutes)

### Step 5.1: Update Environment for Production

**On your Windows machine:**

```powershell
cd D:\Projects\Dev\financial\apps\finman\frontend
```

**Edit `.env.production`:**
```powershell
notepad .env.production
```

**Update with your domain:**
```env
VITE_API_URL=https://api.yourdomain.com
```

**Save and close.**

### Step 5.2: Copy Production Environment

```powershell
# Copy production env to .env
copy .env.production .env

# Verify
type .env
# Should show: VITE_API_URL=https://api.yourdomain.com
```

### Step 5.3: Build Frontend

```powershell
# Install dependencies (if not already)
npm install

# Build frontend
npm run build
```

**Expected output:**
```
vite v5.4.20 building for production...
✓ 1802 modules transformed.
dist/index.html                   2.44 kB │ gzip:   0.91 kB
dist/assets/index-B5Ndbf-I.css   35.56 kB │ gzip:   6.36 kB
dist/assets/web-CA60Ldag.js       0.42 kB │ gzip:   0.20 kB
dist/assets/index-Cd5-u2UV.js   479.11 kB │ gzip: 145.68 kB
✓ built in 4.05s
```

### Step 5.4: Sync with Capacitor

```powershell
npx cap sync
```

**Expected output:**
```
√ Copying web assets from dist to android\app\src\main\assets\public
√ Creating capacitor.config.json in android\app\src\main\assets
√ copy android in 51.05ms
√ Updating Android plugins
√ update android in 115.11ms
[info] Sync finished in 0.268s
```

### Step 5.5: Build Debug APK

```powershell
cd android

# Clean previous builds
.\gradlew clean

# Build debug APK
.\gradlew assembleDebug
```

**Expected output:**
```
BUILD SUCCESSFUL in 17s
112 actionable tasks: 99 executed, 13 up-to-date
```

**APK Location:**
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Step 5.6: Install APK on Device

**Option A: Direct Install via USB**

```powershell
# Install to connected device
.\gradlew installDebug
```

**Option B: Manual Install**

1. Copy APK to phone:
   ```
   android\app\build\outputs\apk\debug\app-debug.apk
   ```
2. On phone: Open the APK file
3. Allow "Install from Unknown Sources"
4. Tap "Install"

**Option C: ADB Install**

```powershell
# If adb is in PATH
adb install app\build\outputs\apk\debug\app-debug.apk
```

### Step 5.7: Test Android App

**On your Android device:**

1. **Launch App:**
   - Open "FinMan" app
   - Should load without errors

2. **Test Registration:**
   - Tap "Register"
   - Enter email, password, name
   - Tap "Create Account"
   - Should succeed

3. **Test Login:**
   - Login with credentials
   - Should see dashboard

4. **Test Features:**
   - [ ] Create transaction
   - [ ] Create item
   - [ ] Create budget
   - [ ] View all data

5. **Test Offline Sync:**
   - Enable Airplane Mode
   - Create a transaction
   - Should show "Queued for sync"
   - Disable Airplane Mode
   - Should auto-sync and show success

6. **Test Multi-Device Sync:**
   - Create transaction on web
   - Refresh Android app
   - Should see new transaction
   - Create transaction on Android
   - Refresh web browser
   - Should see new transaction

---

## 🎯 PART 6: BUILD RELEASE APK (Optional - for Play Store)

### Step 6.1: Generate Signing Key

```powershell
cd D:\Projects\Dev\financial\apps\finman\frontend\android

# Generate keystore
keytool -genkey -v -keystore finman-release.keystore -alias finman -keyalg RSA -keysize 2048 -validity 10000
```

**Answer prompts:**
```
Enter keystore password: [create strong password]
Re-enter new password: [same password]
What is your first and last name? [Your Name]
What is the name of your organizational unit? [Your Company]
What is the name of your organization? [Your Company]
What is the name of your City? [Your City]
What is the name of your State? [Your State]
What is the two-letter country code? [US]
Is CN=..., correct? yes
```

**Save the keystore file and password!**

### Step 6.2: Configure Signing

**Edit `android/app/build.gradle`:**

Add before `android {` block:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android {` block, add:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Step 6.3: Create Keystore Properties

**Create `android/keystore.properties`:**
```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=finman
storeFile=../finman-release.keystore
```

### Step 6.4: Build Release APK

```powershell
.\gradlew assembleRelease
```

**Release APK Location:**
```
android\app\build\outputs\apk\release\app-release.apk
```

**This APK is ready for Play Store submission!**

---

## ✅ VERIFICATION CHECKLIST

### Backend Verification
- [ ] VPS accessible via SSH
- [ ] PM2 shows app as "online"
- [ ] Database has users table
- [ ] Nginx is running
- [ ] API health check returns OK
- [ ] Can register new user via API
- [ ] Can login via API

### Frontend Verification
- [ ] Web app loads at https://yourdomain.com
- [ ] SSL certificate is valid (green padlock)
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transactions
- [ ] Can create items
- [ ] Can create budgets
- [ ] Data persists after refresh

### Android Verification
- [ ] APK installs on device
- [ ] App launches without crash
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transactions
- [ ] Can create items
- [ ] Offline mode works (queues operations)
- [ ] Sync works when back online
- [ ] Multi-device sync works

### Production Verification
- [ ] DNS records correct
- [ ] SSL certificates valid
- [ ] Auto-renewal configured
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] All tests passing

---

## 🚨 Troubleshooting Guide

### Issue: Database Creation Failed - Special Characters in Password

**Error Message:**
```
ERROR: syntax error at or near "!"
ERROR: CREATE DATABASE cannot be executed from a function
ERROR: database "finman_db" does not exist
```

**Solution:**
```bash
# 1. FIRST: Pull the latest fixed deployment script
cd ~/FinMan
git pull origin main

# 2. Clean up the failed database attempt
sudo -u postgres psql -c "DROP DATABASE IF EXISTS finman_db;"
sudo -u postgres psql -c "DROP USER IF EXISTS finman_admin;"

# 3. Verify you're in the correct directory
pwd
# Should show: /home/finman/FinMan

# 4. Run the updated deployment script
./deployment/deploy-vps.sh

# 5. When prompted for password, use safe characters only
# ✓ Safe: A-Z, a-z, 0-9, @, #, $, %, &, *, -, _
# ✗ Avoid: ' (single quote) ! (exclamation)
```

**Alternative: Manual Database Setup (if script keeps failing)**
```bash
# Create database and user manually
sudo -u postgres createdb finman_production
sudo -u postgres psql -c "CREATE USER finman_user WITH ENCRYPTED PASSWORD 'YourPassword123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE finman_production TO finman_user;"
sudo -u postgres psql -d finman_production -c "GRANT ALL ON SCHEMA public TO finman_user;"

# Then continue with manual backend setup
cd ~/FinMan/apps/finman/backend
npm install --production
# Create .env file manually (see VPS_DEPLOYMENT_GUIDE.md)
```

### Issue: Database Connection Error - Can't Reach Database Server

**Error Message:**
```
Error: P1001: Can't reach database server at `Pass:5432`
Datasource "db": PostgreSQL database "postgres", schema "public" at "Pass"
```

**Cause:** Special characters in the database password (like `@`, `#`, `$`) are not URL-encoded in DATABASE_URL.

**Solution:**
```bash
# 1. Pull the latest fixed deployment script
cd ~/FinMan
git checkout -- deployment/deploy-vps.sh
git pull origin main

# 2. Remove the incorrectly created .env file
rm ~/FinMan/apps/finman/backend/.env

# 3. Run the deployment script again
./deployment/deploy-vps.sh

# The updated script will automatically URL-encode the password
```

**Alternative: Fix .env file manually**
```bash
# Edit the .env file
cd ~/FinMan/apps/finman/backend
nano .env

# Find the DATABASE_URL line and URL-encode special characters:
# @ becomes %40
# # becomes %23
# $ becomes %24
# % becomes %25
# & becomes %26
# * becomes %2A

# Example:
# If password is: MyPass@2024#Fin
# DATABASE_URL should be:
# DATABASE_URL="postgresql://finman_user:MyPass%402024%23Fin@localhost:5432/finman_production?schema=public"

# Save and exit (Ctrl+X, Y, Enter)

# Test the connection
npx prisma migrate deploy
```

### Issue: SSH Connection Refused

**Solution:**
```bash
# Check if SSH is running on VPS
sudo systemctl status ssh

# If not running
sudo systemctl start ssh
```

### Issue: DNS Not Resolving

**Solution:**
```bash
# Wait longer (up to 24 hours)
# Or flush DNS cache on Windows:
ipconfig /flushdns

# Verify DNS:
nslookup yourdomain.com
```

### Issue: PM2 App Not Starting

**Solution:**
```bash
# Check logs
pm2 logs finman-api --lines 50

# Common fix: Restart
pm2 restart finman-api

# If database connection error:
sudo systemctl status postgresql
```

### Issue: Nginx 502 Bad Gateway

**Solution:**
```bash
# Check if app is running
pm2 status

# Check Nginx config
sudo nginx -t

# Restart both
pm2 restart finman-api
sudo systemctl restart nginx
```

### Issue: SSL Certificate Failed

**Solution:**
```bash
# Make sure DNS is propagated first
nslookup yourdomain.com

# Try again after 30 minutes
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

### Issue: Android App Won't Connect

**Solutions:**
1. Verify `.env.production` has correct URL
2. Rebuild app after changing .env
3. Check SSL certificate is valid
4. Verify CORS settings on backend
5. Check network permissions in AndroidManifest.xml

### Issue: Gradle Build Fails

**Solution:**
```powershell
# Clean and rebuild
cd android
.\gradlew clean
.\gradlew assembleDebug

# If Java version issue:
# Install JDK 17 (see JAVA17_SETUP.md)
```

---

## 📞 Need Help?

### Check Logs

**Backend logs:**
```bash
pm2 logs finman-api
```

**Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Database logs:**
```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Common Commands

```bash
# Restart everything
pm2 restart finman-api
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Check status
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql

# View processes
ps aux | grep node
ps aux | grep nginx
```

---

## 🎉 SUCCESS!

If all checks pass, congratulations! You now have:

✅ **Production VPS running** with PostgreSQL + Node.js  
✅ **Web app live** at https://yourdomain.com  
✅ **API accessible** at https://api.yourdomain.com  
✅ **SSL/HTTPS working** with auto-renewal  
✅ **Android app** connecting to production  
✅ **Multi-device sync** working  
✅ **Offline support** functional  

---

## 🔄 Daily Operations

### Deploy Updates

**On your Windows machine:**
```powershell
# Navigate to project
cd D:\Projects\Dev\financial

# Make your code changes...

# Check what changed
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Description of your changes"

# Push to GitHub
git push origin main
```

**On VPS:**
```bash
# SSH to VPS
ssh finman@your_vps_ip

# Navigate to project
cd ~/FinMan

# Pull latest changes
git pull origin main

# Run update script (rebuilds and restarts)
./deployment/update-vps.sh
```

**Or use the automated update script from Windows:**
```powershell
# This will SSH, pull, and update automatically
ssh finman@your_vps_ip "cd ~/FinMan && git pull && ./deployment/update-vps.sh"
```

### Check Health

```bash
# Quick health check
curl https://api.yourdomain.com/health

# Detailed check
pm2 status
```

### View Logs

```bash
pm2 logs finman-api --lines 100
```

### Pull Latest Code Changes

```bash
# SSH to VPS
ssh finman@your_vps_ip

# Navigate to project
cd ~/FinMan

# Check current status
git status

# Pull latest changes from GitHub
git pull origin main

# If there are updates, restart app
pm2 restart finman-api

# Or use the automated update script
./deployment/update-vps.sh
```

### Rollback to Previous Version

```bash
# View commit history
git log --oneline -10

# Rollback to specific commit
git checkout <commit-hash>

# Rebuild and restart
./deployment/update-vps.sh

# Or return to latest
git checkout main
git pull
```

---

## 📚 Additional Resources

- **Full Deployment Guide:** `VPS_DEPLOYMENT_GUIDE.md`
- **Android Testing:** `ANDROID_TESTING_GUIDE.md`
- **API Testing:** `API_TESTING_GUIDE.md`
- **Offline Sync:** `OFFLINE_SYNC_GUIDE.md`

---

**You're all set! Your FinMan app is now live in production!** 🚀🎊

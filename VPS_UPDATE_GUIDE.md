# 🔄 VPS Update Guide

This guide explains how to update your VPS backend when you make code changes.

---

## 🎯 Quick Update (Most Common)

When you've made changes to your backend code and pushed to GitHub:

```bash
# SSH into VPS
ssh root@198.23.228.126

# Navigate to project directory
cd ~/FinMan

# Pull latest changes from GitHub
git pull origin main

# Navigate to backend
cd apps/finman/backend

# Install any new dependencies
npm install

# Restart the API service
pm2 restart finman-api

# Check status
pm2 status

# View logs to verify
pm2 logs finman-api --lines 50
```

**Done!** Your backend is now updated with the latest code.

---

## 📋 Step-by-Step Update Process

### Step 1: Commit and Push Your Changes (Local)

```bash
# On your local machine
git add .
git commit -m "feat: Your changes description"
git push origin main
```

### Step 2: SSH into VPS

```bash
ssh root@198.23.228.126
```

**Optional: Switch to finman user** (if you created a dedicated user):
```bash
# Switch to finman user
su - finman

# Or use sudo to run commands as finman
sudo -u finman bash
```

**To switch back to root:**
```bash
exit
# or press Ctrl+D
```

> **Note**: If you're running everything as root (like in our setup), you don't need to switch users. The finman user is only needed if you set up a separate user for security purposes.

### Step 3: Pull Latest Code

```bash
cd ~/FinMan
git pull origin main
```

**Expected output:**
```
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
Updating 7985cdf..236617b
Fast-forward
 apps/finman/backend/src/server.ts | 10 +++++++---
 1 file changed, 7 insertions(+), 3 deletions(-)
```

### Step 4: Install Dependencies (if package.json changed)

```bash
cd apps/finman/backend
npm install
```

**Skip this if you didn't add new packages.**

### Step 5: Run Database Migrations (if schema changed)

```bash
# Only if you changed prisma/schema.prisma
npx prisma migrate dev --name your_migration_name

# Or for production
npx prisma migrate deploy
```

**Skip this if database didn't change.**

### Step 6: Restart the Service

```bash
pm2 restart finman-api
```

**Expected output:**
```
[PM2] Applying action restartProcessId on app [finman-api](ids: [ 0 ])
[PM2] [finman-api](0) ✓
```

### Step 7: Verify Update

```bash
# Check if running
pm2 status

# View recent logs
pm2 logs finman-api --lines 50

# Test API
curl https://api.gearsandai.me/health
```

**Expected:**
```json
{"status":"ok"}
```

---

## 🚀 Complete Update Script

Save this as a script on your VPS for one-command updates:

```bash
# On VPS, create update script
nano ~/update-finman.sh
```

Paste this content:

```bash
#!/bin/bash

echo "🔄 Starting FinMan Backend Update..."
echo "=================================="

# Navigate to project
cd ~/FinMan || exit 1

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

# Navigate to backend
cd apps/finman/backend || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run migrations (optional - uncomment if needed)
# echo "🗄️  Running database migrations..."
# npx prisma migrate deploy

# Restart service
echo "🔄 Restarting API service..."
pm2 restart finman-api

# Show status
echo ""
echo "✅ Update Complete!"
echo "=================================="
pm2 status

echo ""
echo "📊 Recent logs:"
pm2 logs finman-api --lines 20 --nostream

echo ""
echo "🔗 Testing API..."
curl -s https://api.gearsandai.me/health | jq '.'

echo ""
echo "✅ Backend updated successfully!"
```

Make it executable:

```bash
chmod +x ~/update-finman.sh
```

Now you can update with one command:

```bash
~/update-finman.sh
```

---

## 🗄️ Database Updates

### If You Changed Prisma Schema

1. **On local machine** (after changing `schema.prisma`):

```bash
cd apps/finman/backend

# Create migration
npx prisma migrate dev --name add_new_field

# Commit migration files
git add prisma/migrations/
git commit -m "feat: Add new database field"
git push origin main
```

2. **On VPS**:

```bash
cd ~/FinMan
git pull origin main
cd apps/finman/backend

# Apply migration to production
npx prisma migrate deploy

# Restart service
pm2 restart finman-api
```

### If You Need to Reset Database (⚠️ Deletes Data!)

```bash
# On VPS
cd ~/FinMan/apps/finman/backend

# Reset database (CAREFUL!)
npx prisma migrate reset

# Restart service
pm2 restart finman-api
```

---

## 📝 Environment Variables Update

If you need to update `.env` file:

```bash
# SSH into VPS
ssh root@198.23.228.126

# Edit .env
nano ~/FinMan/apps/finman/backend/.env
```

Update the variables, save (Ctrl+O, Enter, Ctrl+X), then:

```bash
# Restart to apply changes
pm2 restart finman-api
```

---

## 🔧 Nginx Configuration Update

If you changed Nginx configs:

```bash
# On local machine
git add deployment/nginx/
git commit -m "feat: Update Nginx config"
git push origin main

# On VPS
ssh root@198.23.228.126
cd ~/FinMan
git pull origin main

# Copy new config
sudo cp deployment/nginx/finman.conf /etc/nginx/sites-available/

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting Updates

### Issue: "Git pull" shows conflicts

```bash
# See what's different
git status

# Option 1: Stash local changes
git stash
git pull origin main

# Option 2: Hard reset (loses local changes!)
git reset --hard origin/main
git pull origin main
```

### Issue: Service won't start after update

```bash
# Check logs
pm2 logs finman-api

# Check for errors
pm2 describe finman-api

# Restart with full logs
pm2 restart finman-api --update-env

# If still failing, check process
pm2 delete finman-api
cd ~/FinMan/apps/finman/backend
pm2 start npm --name "finman-api" -- start
```

### Issue: "npm install" fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database migration fails

```bash
# Check database connection
psql -U finman_user -d finman_production -h localhost

# View migration status
npx prisma migrate status

# Force migration
npx prisma migrate deploy --force
```

### Issue: API returns old version

```bash
# Hard restart PM2
pm2 delete finman-api
cd ~/FinMan/apps/finman/backend
pm2 start npm --name "finman-api" -- start
pm2 save

# Clear any cached responses
# (Browser cache or CDN if applicable)
```

---

## 📊 Monitoring After Update

### Check Service Health

```bash
# PM2 status
pm2 status

# CPU and Memory usage
pm2 monit

# Recent logs
pm2 logs finman-api --lines 100

# Follow live logs
pm2 logs finman-api
```

### Check API Endpoints

```bash
# Health check
curl https://api.gearsandai.me/health

# Test login
curl -X POST https://api.gearsandai.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Check Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/finman-access.log

# Error logs
sudo tail -f /var/log/nginx/finman-error.log
```

### Check Database

```bash
# Connect to database
psql -U finman_user -d finman_production -h localhost

# Check tables
\dt

# Check recent data
SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 5;

# Exit
\q
```

---

## 🔄 Rollback to Previous Version

If the update breaks something:

```bash
# On VPS
cd ~/FinMan

# View commit history
git log --oneline -10

# Rollback to previous commit
git reset --hard <previous-commit-hash>

# Example:
git reset --hard 7985cdf

# Reinstall dependencies
cd apps/finman/backend
npm install

# Restart service
pm2 restart finman-api

# Verify
pm2 logs finman-api
```

---

## 📅 Update Schedule Recommendations

### Regular Updates
- **Code changes**: Update immediately after pushing to GitHub
- **Dependencies**: Weekly `npm update` check
- **Security patches**: As soon as available
- **Database schema**: Plan during low-traffic hours

### Monthly Maintenance
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
# Check version: node --version
# Update via nvm if using it

# Update PM2
npm install -g pm2
pm2 update

# Update global npm packages
npm update -g

# Check SSL certificate
sudo certbot certificates

# Vacuum database
psql -U finman_user -d finman_production -h localhost -c "VACUUM ANALYZE;"
```

---

## 🔐 Security Best Practices

### Before Updating:
1. ✅ Test changes locally first
2. ✅ Commit to Git (backup)
3. ✅ Check for breaking changes
4. ✅ Review dependency updates
5. ✅ Have rollback plan ready

### After Updating:
1. ✅ Verify API responds correctly
2. ✅ Check logs for errors
3. ✅ Test critical endpoints
4. ✅ Monitor for 10-15 minutes
5. ✅ Verify database integrity

---

## 📱 Frontend Updates

### Web Frontend

If you update the web frontend:

```bash
# On local machine
cd apps/finman/frontend
npm run build

# Upload to VPS
scp -r dist/* root@198.23.228.126:/var/www/finman-app/

# No need to restart Nginx for static files
```

### Android App

If you update the Android app:

```bash
# On local machine
cd apps/finman/frontend

# Update code
git add .
git commit -m "feat: Update Android app"
git push origin main

# Rebuild APK
npm run build
npx cap sync
cd android
.\gradlew assembleDebug

# New APK at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Update Checklist

### Pre-Update
- [ ] Changes tested locally
- [ ] Code committed to Git
- [ ] Git pushed to GitHub
- [ ] Backup important data (if major changes)

### During Update
- [ ] SSH into VPS
- [ ] Pull latest code
- [ ] Install dependencies (if needed)
- [ ] Run migrations (if needed)
- [ ] Restart PM2 service

### Post-Update
- [ ] Check PM2 status
- [ ] Review logs for errors
- [ ] Test API health endpoint
- [ ] Test critical features
- [ ] Monitor for 10-15 minutes

---

## 🎯 Quick Commands Reference

```bash
# Update in one go
ssh root@198.23.228.126 "cd ~/FinMan && git pull && cd apps/finman/backend && npm install && pm2 restart finman-api"

# Check status remotely
ssh root@198.23.228.126 "pm2 status"

# View logs remotely
ssh root@198.23.228.126 "pm2 logs finman-api --lines 50 --nostream"

# Test API remotely
curl https://api.gearsandai.me/health
```

---

## 📞 Need Help?

If something goes wrong:

1. **Check logs**: `pm2 logs finman-api`
2. **Check PM2**: `pm2 status`
3. **Check Nginx**: `sudo nginx -t`
4. **Check database**: `psql -U finman_user -d finman_production -h localhost`
5. **Rollback**: `git reset --hard <previous-commit>`

---

**🎉 You're now ready to update your VPS backend anytime!**

Remember: 
- Always test locally first
- Commit to Git before deploying
- Monitor logs after updates
- Keep backups of important data

---

## 👤 User Management on VPS

### Current Setup
Your VPS is currently set up with:
- **Root user**: Full system access (what you're using now)
- **Database user**: `finman_user` (PostgreSQL only)

### Understanding Users

#### Root User (Default)
```bash
# You're already root when you SSH in
ssh root@198.23.228.126

# Check current user
whoami
# Output: root

# Your projects are at: /root/FinMan
```

#### Creating a Dedicated finman User (Optional - Better Security)

If you want to create a separate user for running the app (recommended for production):

```bash
# As root, create finman user
sudo adduser finman

# Set a password when prompted
# Press Enter to skip other optional fields

# Add to sudo group (for admin tasks)
sudo usermod -aG sudo finman

# Create SSH directory for the user
sudo mkdir -p /home/finman/.ssh
sudo cp ~/.ssh/authorized_keys /home/finman/.ssh/
sudo chown -R finman:finman /home/finman/.ssh
sudo chmod 700 /home/finman/.ssh
sudo chmod 600 /home/finman/.ssh/authorized_keys
```

### Switching Between Users

#### Switch to finman User
```bash
# Method 1: Switch user (su)
su - finman
# Prompts for finman's password

# Method 2: Switch with sudo (no password needed)
sudo -i -u finman
# or
sudo su - finman

# Method 3: Run single command as finman
sudo -u finman <command>
# Example:
sudo -u finman pm2 list
```

#### Switch Back to Root
```bash
# From finman user, switch back
exit
# or press Ctrl+D

# Or directly switch
su - root
```

#### Check Current User
```bash
# Show current username
whoami

# Show user ID and groups
id

# Show current directory
pwd
```

### Moving Projects to finman User

If you want to move everything from root to finman user:

```bash
# As root
# Copy project to finman's home
sudo cp -r /root/FinMan /home/finman/
sudo chown -R finman:finman /home/finman/FinMan

# Switch to finman
su - finman

# Verify ownership
ls -la ~/FinMan

# Update PM2 to run as finman
pm2 delete finman-api
cd ~/FinMan/apps/finman/backend
pm2 start npm --name "finman-api" -- start
pm2 save
pm2 startup

# Follow the command PM2 gives you to set up startup
```

### Which User Should You Use?

#### Using Root (Current Setup) ✅
**Pros:**
- ✅ Simpler - no user switching needed
- ✅ Full system access
- ✅ No permission issues
- ✅ What you're already using

**Cons:**
- ⚠️ Less secure if compromised
- ⚠️ Any mistake affects whole system

**Good for:**
- Personal projects
- Development/testing
- Small deployments
- When you're the only user

#### Using Dedicated User (finman) 🔒
**Pros:**
- ✅ Better security (limited permissions)
- ✅ Isolates application from system
- ✅ Best practice for production
- ✅ Easier to manage multiple apps

**Cons:**
- ⚠️ Need to switch users for admin tasks
- ⚠️ Need sudo for system changes
- ⚠️ More complex setup

**Good for:**
- Production deployments
- Multi-user systems
- Security-conscious setups
- Professional environments

### Recommended: Stay with Root for Now

Since this is your personal VPS and you're the only user:
- ✅ **Keep using root** - It's simpler and works fine
- 🔒 Just make sure to use a strong SSH password/key
- 📝 The `finman_user` in PostgreSQL is separate and already secure

### Quick User Commands Cheat Sheet

```bash
# Check who you are
whoami

# See all users
cat /etc/passwd | grep -E "root|finman"

# Switch to finman (if you created it)
su - finman

# Run command as finman
sudo -u finman pm2 list

# Switch back to root
exit

# See what user owns files
ls -la /root/FinMan

# Change file owner to finman
sudo chown -R finman:finman /path/to/folder

# Change file owner to root
sudo chown -R root:root /path/to/folder
```

---

## 🔐 PostgreSQL User vs System User

**Important:** Don't confuse these two!

### System User (Linux)
```bash
# These are OS users
root        # Your current user
finman      # Optional app user (if created)
```

### Database User (PostgreSQL)
```bash
# These are database users
postgres    # PostgreSQL superuser
finman_user # Your app's database user
```

**They are separate!** 
- `finman_user` can only access PostgreSQL, not the system
- System user `root` accesses the OS, not directly the database

### Connecting to Database

```bash
# As any system user (root, finman, etc.), connect to DB
psql -U finman_user -d finman_production -h localhost
# This uses DATABASE user: finman_user

# The password is: MyStr0ng@Pass#69_Fin
# (from your .env file)
```

---

*Last Updated: October 5, 2025*

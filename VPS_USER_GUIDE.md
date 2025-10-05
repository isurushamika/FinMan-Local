# 🔐 VPS User Quick Reference

## Your Current Setup

**You are using:** `root` user ✅  
**VPS IP:** 198.23.228.126  
**Project Location:** `/root/FinMan`

---

## Quick Commands

### Check Current User
```bash
whoami
# Output: root (that's you!)
```

### Access VPS
```bash
# SSH as root (what you normally do)
ssh root@198.23.228.126
```

### Navigate to Project
```bash
# Your FinMan project
cd ~/FinMan
# Same as: cd /root/FinMan
```

---

## User Types (Don't Confuse These!)

### 1. System User (Linux)
**Current:** `root` (you)

```bash
# Check system user
whoami
# Output: root
```

### 2. Database User (PostgreSQL)
**For DB:** `finman_user`

```bash
# Connect to database AS finman_user
psql -U finman_user -d finman_production -h localhost
# Password: MyStr0ng@Pass#69_Fin
```

**They are different!** 
- `root` = Your VPS login
- `finman_user` = Database-only user

---

## Optional: Create Dedicated User

If you want better security (not required):

```bash
# As root, create finman user
sudo adduser finman
# Set password when prompted

# Add sudo privileges
sudo usermod -aG sudo finman

# Copy SSH keys
sudo cp -r ~/.ssh /home/finman/
sudo chown -R finman:finman /home/finman/.ssh
```

### Switch to finman User
```bash
# Method 1: Switch user
su - finman
# Prompts for password

# Method 2: Switch without password
sudo su - finman

# Method 3: Run one command
sudo -u finman pm2 list
```

### Switch Back to Root
```bash
exit
# or press Ctrl+D
```

---

## Recommended: Keep Using Root

**For your setup:** ✅ **Stay with root**

**Why?**
- ✅ Simpler - no switching needed
- ✅ You're the only user
- ✅ Personal VPS
- ✅ No permission headaches

**Just ensure:**
- 🔑 Use SSH key authentication (not password)
- 🔒 Keep server updated
- 💾 Regular backups

---

## Common Tasks

### Update Backend Code
```bash
# As root (your current user)
ssh root@198.23.228.126
cd ~/FinMan
git pull origin main
cd apps/finman/backend
npm install
pm2 restart finman-api
```

### Check Running Services
```bash
# PM2 services
pm2 status

# All users and services
pm2 list

# Current user
whoami
```

### Access Database
```bash
# Connect as finman_user (database user)
psql -U finman_user -d finman_production -h localhost

# Inside psql:
\dt          # List tables
\q           # Quit
```

### View Logs
```bash
# PM2 logs
pm2 logs finman-api

# Nginx logs
sudo tail -f /var/log/nginx/finman-error.log
```

---

## When You SSH In...

```bash
$ ssh root@198.23.228.126
# You're now: root
# Location: /root/

$ cd FinMan
# You're now at: /root/FinMan

$ whoami
# Output: root

$ ls -la
# Shows files owned by root
```

---

## Quick Troubleshooting

### "Permission denied"
```bash
# Make sure you're root
whoami

# If not root, switch
su - root
# or
sudo su -
```

### "Command not found"
```bash
# Make sure you're in right directory
pwd
cd ~/FinMan/apps/finman/backend

# Or use full path
/root/.nvm/versions/node/v20.x.x/bin/pm2 status
```

### "Database authentication failed"
```bash
# Use correct database user
psql -U finman_user -d finman_production -h localhost
# NOT: psql -U root
```

---

## Summary

| What | User | Purpose |
|------|------|---------|
| **VPS Login** | `root` | System access (you) ✅ |
| **Database** | `finman_user` | PostgreSQL access 🗄️ |
| **Optional App User** | `finman` | Isolated app (advanced) 🔒 |

**You're using:** `root` for everything except database queries 👍

---

## Need More Info?

See [VPS_UPDATE_GUIDE.md](./VPS_UPDATE_GUIDE.md) for:
- Complete user management
- Creating dedicated users
- Security best practices
- Detailed switching commands

---

**🎯 Bottom Line:**

You're `root`. That's fine. Just keep using it like you have been!

```bash
ssh root@198.23.228.126  ✅ This is you
cd ~/FinMan                 ✅ Your project
pm2 restart finman-api      ✅ Your commands
```

*Last Updated: October 5, 2025*

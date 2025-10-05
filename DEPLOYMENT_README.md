# 📋 VPS Deployment - README

## 🎯 What This Is

Complete deployment resources for FinMan financial management application to Ubuntu VPS with PostgreSQL backend, enabling multi-device synchronization.

---

## 🚀 Quick Start (3 Steps)

### 1. Prepare VPS & Domain
- Ubuntu 20.04/22.04 VPS (2GB RAM minimum)
- Domain name pointing to VPS IP
- SSH access configured

### 2. Deploy Application
```bash
# Upload deployment script
scp deployment/deploy-vps.sh username@your_vps_ip:~/

# Connect and run
ssh username@your_vps_ip
chmod +x ~/deploy-vps.sh
./deploy-vps.sh
```

### 3. Setup SSL & Test
```bash
# On VPS
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# From Windows
.\deployment\test-production.ps1 -Domain "yourdomain.com"
```

**Done!** Your app is live at https://yourdomain.com 🎉

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **DEPLOYMENT_QUICKSTART.md** | Quick reference guide (start here) |
| **VPS_DEPLOYMENT_GUIDE.md** | Complete deployment guide (800+ lines) |
| **PROJECT_COMPLETE.md** | Full project summary and achievements |
| **PHASE_7_COMPLETE.md** | Phase 7 deployment resources overview |
| **ANDROID_SETUP_COMPLETE.md** | Android build and testing guide |

---

## 🔧 Scripts Included

| Script | Purpose | Platform |
|--------|---------|----------|
| `deployment/deploy-vps.sh` | Initial VPS deployment | Bash (Linux) |
| `deployment/update-vps.sh` | Update deployed app | Bash (Linux) |
| `deployment/backup-vps.sh` | Backup database & files | Bash (Linux) |
| `deployment/test-production.ps1` | Test production API | PowerShell (Windows) |

---

## ✅ What's Included

- ✅ Complete backend API (Node.js + PostgreSQL)
- ✅ Modern frontend (React + TypeScript)
- ✅ Android mobile app (Capacitor)
- ✅ Automated deployment scripts
- ✅ SSL/HTTPS configuration
- ✅ Backup automation
- ✅ Testing tools
- ✅ Comprehensive documentation

---

## 🎯 Production URLs

After deployment:
- **Web App:** https://yourdomain.com
- **API:** https://api.yourdomain.com
- **Health Check:** https://api.yourdomain.com/health

---

## 📞 Support

### Documentation
- **Quick Start:** DEPLOYMENT_QUICKSTART.md
- **Full Guide:** VPS_DEPLOYMENT_GUIDE.md

### Commands
```bash
pm2 restart finman-api  # Restart app
pm2 logs finman-api     # View logs
./update-vps.sh         # Deploy updates
./backup-vps.sh         # Create backup
```

---

**Ready to deploy? Start with `DEPLOYMENT_QUICKSTART.md`!** 🚀

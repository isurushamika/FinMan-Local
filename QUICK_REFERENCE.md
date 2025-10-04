# Quick Reference - Multi-App Server

## 🚀 Common Commands

### Development

```bash
# Start FinMan Frontend
cd apps/finman/frontend
npm run dev

# Start FinMan Backend
cd apps/finman/backend
npm run dev

# Build for production
cd apps/finman/frontend && npm run build
cd apps/finman/backend && npm run build
```

### Production Deployment

```bash
# Initial setup on Ubuntu
cd /var/www
git clone <repo-url> apps
cd apps
./deployment/deploy.sh finman

# Start all apps
pm2 start ecosystem.config.js --env production
pm2 save

# Update specific app
cd /var/www/apps
git pull
./deployment/deploy.sh finman
```

### PM2 Commands

```bash
pm2 start ecosystem.config.js          # Start all apps
pm2 restart finman-api                 # Restart FinMan
pm2 stop finman-api                    # Stop FinMan
pm2 logs finman-api                    # View logs
pm2 monit                              # Monitor all apps
pm2 list                               # List all apps
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/finman-access.log
sudo tail -f /var/log/nginx/finman-error.log

# Enable site
sudo ln -s /etc/nginx/sites-available/finman /etc/nginx/sites-enabled/
```

### Database Commands

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# List databases
\l

# Connect to database
\c finman_db

# Run migrations
cd apps/finman/backend
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio
```

## 📁 Directory Structure Quick View

```
/var/www/apps/
├── finman/
│   ├── frontend/dist/      # Served by Nginx
│   ├── backend/dist/       # Run by PM2
│   └── backend/uploads/    # User files
├── app2/
│   └── ...
└── logs/                   # PM2 logs
```

## 🌐 URL Patterns

### Subdomain Setup
```
finman.yourdomain.com           → Frontend
finman.yourdomain.com/api/*     → Backend API
finman.yourdomain.com/uploads/* → Files
```

### Path-based Setup
```
yourdomain.com/finman           → Frontend
yourdomain.com/finman/api/*     → Backend API
yourdomain.com/finman/uploads/* → Files
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `ecosystem.config.js` | PM2 app management |
| `deployment/nginx/*.conf` | Nginx configurations |
| `apps/*/backend/.env` | Backend environment vars |
| `deployment/deploy.sh` | Auto-deploy script |

## 🔐 Ports

| App | Port | Access |
|-----|------|--------|
| FinMan API | 3000 | Internal (proxied by Nginx) |
| App2 API | 3001 | Internal |
| Nginx HTTP | 80 | External (redirects to 443) |
| Nginx HTTPS | 443 | External |
| PostgreSQL | 5432 | Internal |

## 📊 Monitoring

```bash
# System resources
htop

# PM2 dashboard
pm2 monit

# Nginx connections
sudo netstat -tuln | grep :80
sudo netstat -tuln | grep :443

# Disk space
df -h

# Database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('finman_db'));"
```

## 🚨 Emergency Commands

```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx

# Stop all Node processes
pm2 stop all

# View all errors
pm2 logs --err --lines 50

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :443

# Disk space critical
du -sh /var/www/apps/*
du -sh /var/www/apps/*/backend/uploads/*
```

## 📝 Adding New App Checklist

- [ ] Create `apps/newapp/{frontend,backend}` directories
- [ ] Setup package.json for both
- [ ] Add entry to `ecosystem.config.js`
- [ ] Create nginx config in `deployment/nginx/`
- [ ] Create PostgreSQL database
- [ ] Update backend .env file
- [ ] Build frontend and backend
- [ ] Start with PM2
- [ ] Enable nginx site
- [ ] Setup SSL certificate
- [ ] Test and monitor

## 🔄 Update Workflow

```bash
# 1. Pull changes
cd /var/www/apps
git pull

# 2. Deploy app
./deployment/deploy.sh finman

# 3. Verify
pm2 status
curl https://finman.yourdomain.com/health
```

## 🗄️ Backup Commands

```bash
# Backup database
pg_dump -U finman_user finman_db > backup_$(date +%Y%m%d).sql

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/apps/finman/backend/uploads/

# Restore database
psql -U finman_user finman_db < backup_20251004.sql
```

## 🆘 Quick Fixes

**App won't start:**
```bash
cd apps/finman/backend
npm install
npm run build
pm2 restart finman-api
```

**Nginx 502 Bad Gateway:**
```bash
pm2 status  # Check if backend is running
pm2 logs finman-api --err
pm2 restart finman-api
```

**SSL Certificate Expired:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Database Connection Error:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U finman_user -d finman_db -h localhost
```

**Out of Disk Space:**
```bash
# Check usage
df -h

# Clean PM2 logs
pm2 flush

# Clean old logs
sudo find /var/log -name "*.log" -mtime +30 -delete

# Clean npm cache
npm cache clean --force
```

## 📚 Useful Links

- PM2 Documentation: https://pm2.keymetrics.io/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- PostgreSQL: https://www.postgresql.org/docs/

---

**Keep this handy for quick reference!** 📖

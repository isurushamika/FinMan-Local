# Multi-App Server Structure

This project is structured to support hosting multiple applications on a single Ubuntu server.

## 📁 Project Structure

```
financial/                          # Root project directory
├── apps/                           # All applications
│   ├── finman/                     # Financial Manager App
│   │   ├── frontend/               # React frontend
│   │   │   ├── src/
│   │   │   ├── public/
│   │   │   ├── package.json
│   │   │   └── vite.config.ts
│   │   ├── backend/                # Node.js API
│   │   │   ├── src/
│   │   │   ├── prisma/
│   │   │   ├── package.json
│   │   │   └── .env
│   │   └── README.md
│   │
│   └── [future-apps]/              # Add more apps here
│
├── deployment/                     # Deployment configurations
│   ├── nginx/                      # Nginx configs
│   │   ├── finman-subdomain.conf
│   │   └── main-site-pathbased.conf
│   ├── pm2/                        # PM2 configs (if needed)
│   ├── deploy.sh                   # Linux deploy script
│   └── deploy.bat                  # Windows deploy script
│
├── ecosystem.config.js             # PM2 multi-app manager
└── README.md                       # This file
```

## 🚀 Development Workflow

### Start FinMan Locally

**Frontend:**
```bash
cd apps/finman/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Backend:**
```bash
cd apps/finman/backend
npm install
npx prisma migrate dev
npm run dev
# Runs on http://localhost:3000
```

### Adding a New App

1. Create app structure:
```bash
mkdir -p apps/newapp/{frontend,backend}
```

2. Setup frontend (React/Vue/etc):
```bash
cd apps/newapp/frontend
npm create vite@latest . -- --template react-ts
npm install
```

3. Setup backend:
```bash
cd apps/newapp/backend
npm init -y
# Install your backend dependencies
```

4. Add to `ecosystem.config.js`:
```javascript
{
  name: 'newapp-api',
  script: './apps/newapp/backend/dist/server.js',
  env_production: {
    PORT: 3001  // Use different port
  }
}
```

5. Create nginx config in `deployment/nginx/newapp.conf`

## 📦 Production Deployment

### Initial Server Setup

1. **Clone repository:**
```bash
cd /var/www
git clone your-repo-url apps
cd apps
```

2. **Setup each app:**
```bash
# FinMan
cd apps/finman/frontend
npm install && npm run build

cd ../backend
npm install && npm run build
npx prisma migrate deploy
```

3. **Configure PM2:**
```bash
# From project root
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

4. **Setup Nginx:**

**Option A - Subdomain (Recommended):**
```bash
sudo cp deployment/nginx/finman-subdomain.conf /etc/nginx/sites-available/finman
sudo ln -s /etc/nginx/sites-available/finman /etc/nginx/sites-enabled/
```

Update the file:
- Replace `finman.yourdomain.com` with your actual domain
- Update paths if needed

**Option B - Path-based:**
```bash
sudo cp deployment/nginx/main-site-pathbased.conf /etc/nginx/sites-available/main
sudo ln -s /etc/nginx/sites-available/main /etc/nginx/sites-enabled/
```

5. **SSL Setup:**
```bash
sudo certbot --nginx -d finman.yourdomain.com
# Or for multiple apps:
sudo certbot --nginx -d yourdomain.com -d finman.yourdomain.com -d app2.yourdomain.com
```

6. **Start services:**
```bash
sudo nginx -t
sudo systemctl reload nginx
pm2 restart all
```

### Quick Deploy Script

```bash
# Deploy specific app
./deployment/deploy.sh finman

# Or deploy all apps
for app in apps/*/; do
    app_name=$(basename "$app")
    ./deployment/deploy.sh "$app_name"
done
```

## 🌐 URL Structure

### Subdomain Approach (Recommended)
- `finman.yourdomain.com` → FinMan app
- `finman.yourdomain.com/api` → FinMan API
- `app2.yourdomain.com` → Another app
- `app2.yourdomain.com/api` → App2 API

**Pros:**
- Clean URLs
- Isolated apps
- Easy SSL per app
- Independent deployments

### Path-based Approach
- `yourdomain.com/finman` → FinMan app
- `yourdomain.com/finman/api` → FinMan API
- `yourdomain.com/app2` → Another app

**Pros:**
- Single domain
- One SSL certificate
- Good for related apps

## 🗄️ Database Strategy

### Option 1: Separate Databases (Recommended)
```sql
-- Each app has its own database
CREATE DATABASE finman_db;
CREATE DATABASE app2_db;
CREATE DATABASE app3_db;

-- Each with own user
CREATE USER finman_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE finman_db TO finman_user;
```

**Pros:**
- Complete isolation
- Easy backups per app
- Independent migrations
- Security boundaries

### Option 2: Shared Database, Different Schemas
```sql
-- One database, multiple schemas
CREATE DATABASE apps_db;
CREATE SCHEMA finman;
CREATE SCHEMA app2;
```

## 📊 PM2 Management

```bash
# Start all apps
pm2 start ecosystem.config.js

# Start specific app
pm2 start ecosystem.config.js --only finman-api

# View status
pm2 status

# View logs
pm2 logs finman-api
pm2 logs --lines 100

# Restart app
pm2 restart finman-api

# Stop app
pm2 stop finman-api

# Delete app
pm2 delete finman-api

# Monitor
pm2 monit
```

## 📁 File Organization on Server

```
/var/www/apps/
├── finman/
│   ├── frontend/dist/          # Built frontend
│   ├── backend/
│   │   ├── dist/               # Built backend
│   │   ├── uploads/            # User uploads
│   │   └── node_modules/
│   └── .env
│
├── app2/
│   └── ...
│
└── logs/                       # PM2 logs
    ├── finman-api-error.log
    ├── finman-api-out.log
    └── ...
```

## 🔐 Environment Variables

Each app has its own `.env` file:

```
apps/finman/backend/.env
apps/app2/backend/.env
```

Keep secrets separate per app!

## 🚦 Port Allocation

Assign different ports to each backend:

- **FinMan API**: 3000
- **App2 API**: 3001
- **App3 API**: 3002
- etc.

Configure in `ecosystem.config.js` and app `.env` files.

## 📝 Best Practices

1. **Version Control**: Each app can have its own git repo or use monorepo
2. **Dependencies**: Keep app dependencies isolated
3. **Logging**: Use PM2 logs, store in `/var/log/` or app-specific locations
4. **Backups**: Backup each database separately
5. **SSL**: Use Let's Encrypt, renews automatically
6. **Monitoring**: Use PM2 monitoring or external tools
7. **Updates**: Deploy apps independently

## 🔄 CI/CD Integration

Example GitHub Actions for auto-deploy:

```yaml
name: Deploy FinMan
on:
  push:
    branches: [main]
    paths: ['apps/finman/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /var/www/apps && ./deployment/deploy.sh finman'
```

## 📚 Additional Documentation

- **FinMan Specific**: See `apps/finman/README.md`
- **API Documentation**: `apps/finman/backend/docs/API.md`
- **Deployment Guide**: `apps/finman/DEPLOYMENT_GUIDE.md`
- **Migration Guide**: `apps/finman/MIGRATION_GUIDE.md`

## 🆘 Troubleshooting

**App not starting:**
```bash
pm2 logs finman-api --err
```

**Nginx issues:**
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

**Database connection:**
```bash
sudo -u postgres psql
\l  # List databases
\c finman_db  # Connect to database
```

**Port conflicts:**
```bash
sudo lsof -i :3000
# Kill process using the port
```

## 🎯 Next Steps

1. ✅ Structure created
2. ✅ Deployment configs ready
3. ⏭️ Deploy to Ubuntu server
4. ⏭️ Add more apps as needed
5. ⏭️ Setup monitoring and backups

---

**Ready to host unlimited apps on your Ubuntu server!** 🚀

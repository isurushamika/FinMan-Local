# Project Restructure Plan - Multi-App Server

## Current Structure (Single App)
```
financial/
├── src/              # Frontend
├── backend/          # Backend
├── public/
└── package.json
```

## New Structure (Multi-App Ready)

```
apps/
├── finman/                      # Financial Manager App
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── ...
│   ├── backend/
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── package.json
│   │   └── ...
│   └── README.md
│
├── app2/                        # Future app
│   ├── frontend/
│   └── backend/
│
└── shared/                      # Shared utilities (optional)
    ├── types/
    ├── utils/
    └── components/
```

## Benefits

✅ **Clean Separation** - Each app is self-contained
✅ **Easy Deployment** - Deploy apps independently
✅ **Scalable** - Add unlimited apps
✅ **Nginx Ready** - Perfect for subdomain/path-based routing
✅ **Independent Versions** - Each app has own dependencies
✅ **Shared Code** - Optional shared folder for common code

## Deployment Structure on Ubuntu

```
/var/www/
├── finman/
│   ├── frontend/          # Built frontend (dist/)
│   └── backend/           # Node.js backend
│
├── app2/
│   ├── frontend/
│   └── backend/
│
└── shared/                # Shared static assets (optional)
```

## Nginx Configuration

### Option 1: Subdomain-based
- `finman.yourdomain.com` → FinMan app
- `app2.yourdomain.com` → Another app
- `api.finman.yourdomain.com` → FinMan API

### Option 2: Path-based
- `yourdomain.com/finman` → FinMan app
- `yourdomain.com/app2` → Another app
- `yourdomain.com/finman/api` → FinMan API

### Option 3: Port-based (Development)
- `yourdomain.com:3000` → FinMan API
- `yourdomain.com:3001` → App2 API
- `yourdomain.com:80` → Main site/router

## Migration Steps

1. ✅ Create new folder structure
2. ✅ Move frontend files to `apps/finman/frontend/`
3. ✅ Move backend files to `apps/finman/backend/`
4. ✅ Update all import paths
5. ✅ Update configuration files
6. ✅ Update documentation
7. ✅ Test both frontend and backend
8. ✅ Create deployment scripts

## PM2 Ecosystem (Multi-App Management)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'finman-api',
      script: './apps/finman/backend/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'app2-api',
      script: './apps/app2/backend/dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
```

## Database Strategy

### Option 1: Separate Databases
```
PostgreSQL:
├── finman_db      (Port 5432)
├── app2_db        (Port 5432)
└── app3_db        (Port 5432)
```

### Option 2: Single Database, Multiple Schemas
```
PostgreSQL (finman_db):
├── public schema     (finman tables)
├── app2 schema       (app2 tables)
└── app3 schema       (app3 tables)
```

**Recommendation:** Separate databases for better isolation and security.

## Folder Ownership & Permissions

```bash
/var/www/
├── finman/     (owned by: www-data or pm2 user)
├── app2/       (owned by: www-data or pm2 user)
└── uploads/    (writable by app processes)
    ├── finman/
    └── app2/
```

## Development Workflow

```bash
# Start FinMan frontend
cd apps/finman/frontend
npm run dev

# Start FinMan backend
cd apps/finman/backend
npm run dev

# Add a new app
mkdir -p apps/newapp/{frontend,backend}
# Copy template or start fresh
```

## Root-Level Files (Optional)

```
apps/
├── finman/
├── app2/
├── shared/
├── ecosystem.config.js    # PM2 multi-app config
├── deploy.sh              # Deploy all apps
├── docker-compose.yml     # Multi-container setup
├── .github/workflows/     # CI/CD for all apps
└── README.md              # Main documentation
```

## Implementation

Would you like me to:

**Option A: Full Restructure** (Recommended)
- Move everything to `apps/finman/{frontend,backend}`
- Create root-level deployment configs
- Update all paths and documentation

**Option B: Minimal Change** (Quick)
- Keep current structure
- Just create deployment configs for multi-app server
- Document how to add more apps later

**Option C: Hybrid**
- Restructure but keep `financial` as root name
- Create `apps/financial` structure
- Easier migration path

Which option would you prefer?

# FinMan - Personal Finance Manager# FinMan - Financial Management Application



A full-stack personal finance management application with offline-first architecture, biometric authentication, and real-time sync.> **Complete Mobile + Web Financial Manager with Advanced Security**



---## 📱 Project Overview



## 🚀 Quick StartFinMan is a full-stack financial management application with:

- **Native Android App** (Capacitor)

### Your URLs- **Progressive Web App** (PWA)

- **Backend API**: https://api.gearsandai.me ✅ Live- **REST API Backend** (Node.js + Prisma)

- **Web App**: https://app.gearsandai.me (ready to deploy)- **Ubuntu Server Deployment** ready

- **GitHub**: https://github.com/isurushamika/FinMan

## 🚀 Quick Start

### Android APK

- **Location**: `apps/finman/frontend/android/app/build/outputs/apk/debug/app-debug.apk`### Development

- **Size**: 5.28 MB

- **Install**: Transfer to phone and install```powershell

# Install dependencies

---cd apps/finman/frontend

npm install

## 📱 Installation

cd ../backend

### Android Appnpm install

1. Transfer APK to your phone

2. Enable "Install from Unknown Sources"# Run development servers

3. Install and open appnpm run dev  # Frontend on http://localhost:5173

4. Create account or loginnpm run dev  # Backend on http://localhost:3001

```

### Web App

```bash### Production Build

.\deployment\deploy-frontend.bat

# See docs/DEPLOY.md for details```powershell

```# Build frontend

cd apps/finman/frontend

---npm run build



## 🛠️ Development# Build backend

cd ../backend

### Run Locallynpm run build

```bash

# Backend# Build Android APK

cd apps/finman/backendcd ../frontend/android

npm install.\gradlew assembleDebug

npm run dev```



# Frontend**APK Location:** `apps/finman/frontend/android/app/build/outputs/apk/debug/app-debug.apk`

cd apps/finman/frontend

npm install## ✨ Features

npm run dev

```### Core Financial Features

- ✅ **Transaction Tracking** - Income/expense management with categories

### Build Android- ✅ **Budget Management** - Monthly/yearly budgets with progress tracking

```bash- ✅ **Recurring Transactions** - Automated bill and payment tracking

cd apps/finman/frontend- ✅ **Item Tracker** - Track purchases and item history

npm run build- ✅ **Charts & Analytics** - Visual spending insights

npx cap sync

cd android### Smart Notifications 🔔

.\gradlew assembleDebug- ✅ **Bill Reminders** - Get notified before recurring bills are due

```- ✅ **Budget Alerts** - Alerts at 80%, 90%, 100% of budget

- ✅ **Spending Summaries** - Daily/weekly spending reports

---- ✅ **Configurable Settings** - Custom thresholds and schedules



## 🔄 Update VPS### Security 🔒

- ✅ **Biometric Authentication** - Fingerprint/Face ID

```bash- ✅ **PIN/Password Protection** - Secure app access

ssh root@198.23.228.126- ✅ **Data Encryption** - AES-256-GCM encryption

cd ~/FinMan- ✅ **Auto-Lock** - Configurable inactivity timeout

git pull origin main- ✅ **Session Management** - Secure session handling

cd apps/finman/backend

npm install### Data Management

pm2 restart finman-api- ✅ **Export/Import** - JSON data backup/restore

```- ✅ **Search & Filter** - Advanced transaction search

- ✅ **Offline Support** - Full offline functionality

---- ✅ **Cloud Sync Ready** - API backend for multi-device sync



## 📚 Documentation## 📁 Project Structure



- **[docs/DEPLOY.md](./docs/DEPLOY.md)** - Deployment guide (VPS + Web)```

- **[docs/API.md](./docs/API.md)** - API documentation  financial/

- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Development guide├── apps/

│   └── finman/

---│       ├── frontend/              # React + Vite + Capacitor

│       │   ├── src/

## ✨ Features│       │   │   ├── components/   # UI components

│       │   │   ├── utils/        # Utilities (storage, auth, crypto)

- Transaction management│       │   │   ├── types/        # TypeScript types

- Budget tracking│       │   │   └── App.tsx       # Main application

- Recurring transactions│       │   ├── android/          # Android project

- Item tracking│       │   ├── public/           # Static assets

- Charts & summaries│       │   └── dist/             # Production build

- Offline sync│       │

- Biometric auth│       └── backend/              # Node.js + Express + Prisma

- Data export/import│           ├── src/

- Dark mode│           │   ├── controllers/  # API controllers

│           │   ├── services/     # Business logic

---│           │   ├── routes/       # API routes

│           │   ├── middleware/   # Auth, error handling

## 🔐 Tech Stack│           │   └── server.ts     # Main server

│           └── prisma/           # Database schema

**Backend**: Node.js, PostgreSQL, Prisma, JWT  │

**Frontend**: React, TypeScript, Capacitor  ├── deployment/                   # Nginx & PM2 configs

**Infrastructure**: VPS, Nginx, SSL, PM2└── docs/                         # Documentation



---```



*Last Updated: October 5, 2025*## 🛠️ Technology Stack


### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Mobile:** Capacitor 7.x
- **Styling:** Tailwind CSS
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React
- **Date Handling:** date-fns

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer

### Security
- **Encryption:** Web Crypto API (AES-256-GCM)
- **Biometric:** Capacitor Native Biometric
- **Storage:** Encrypted localStorage

## 📝 Build Requirements

### For Web App
- Node.js 18+
- npm or yarn

### For Android APK
- **Java Development Kit:** JDK 21 (required)
  - Download: https://adoptium.net/temurin/releases/?version=21
  - Set `JAVA_HOME` or configure in `android/gradle.properties`
- **Android SDK:** Installed (command-line tools sufficient)
- **Gradle:** 8.11+ (included in project)

**Note:** Android Studio is **not** required for building APKs. Use `gradlew` command-line tool.

## 🔧 Configuration Files

### Frontend Configuration
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite build configuration
- `capacitor.config.ts` - Capacitor/Android settings
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Android Configuration
- `android/build.gradle` - Android Gradle Plugin 8.7.2
- `android/gradle.properties` - Java 21 path, JVM settings
- `android/app/build.gradle` - App-specific build settings
- `android/variables.gradle` - Android SDK versions

### Backend Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `prisma/schema.prisma` - Database schema

## 🌐 Deployment

### Ubuntu Server Deployment

Complete deployment guide: [UBUNTU_DEPLOYMENT.md](UBUNTU_DEPLOYMENT.md)

**Quick Deploy:**
```bash
cd deployment
chmod +x finman-deploy.sh
./finman-deploy.sh
```

**Services:**
- Frontend: http://yourdomain.com/finman (or subdomain)
- Backend: http://yourdomain.com/api/finman
- PM2 process management for backend

### Android APK Distribution

1. **Build Release APK:**
   ```powershell
   cd apps/finman/frontend/android
   .\gradlew assembleRelease
   ```

2. **Sign APK** (for production):
   - Generate keystore
   - Configure signing in `android/app/build.gradle`
   - Build signed APK

3. **Distribute:**
   - Direct APK distribution
   - Google Play Store (with signed release)
   - Enterprise app stores

## 📖 Additional Documentation

- **[CAPACITOR_BUILD_GUIDE.md](CAPACITOR_BUILD_GUIDE.md)** - Complete Capacitor setup
- **[JAVA17_SETUP.md](apps/finman/frontend/JAVA17_SETUP.md)** - Java 21 installation guide
- **[UBUNTU_DEPLOYMENT.md](UBUNTU_DEPLOYMENT.md)** - Server deployment guide
- **[SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)** - Security features
- **[API.md](apps/finman/backend/docs/API.md)** - Backend API documentation

## 🧹 Maintenance

### Clean Build Artifacts
```powershell
.\cleanup.bat
```

Removes:
- Frontend/backend build directories
- Android build artifacts
- Gradle cache
- Temporary files

### Update Dependencies
```powershell
# Frontend
cd apps/finman/frontend
npm update

# Backend
cd ../backend
npm update
```

## 🐛 Troubleshooting

### Build Issues

**TypeScript Errors:**
```powershell
npm run build 2>&1 | Select-String "error"
```

**Android Build Fails:**
- Verify Java 21 is installed: `java -version`
- Check Gradle daemon: `.\gradlew --version`
- Clean build: `.\gradlew clean`

**Biometric Not Working:**
- Test on physical device (not emulator)
- Check Android permissions
- Verify device has biometric hardware

### Common Solutions

1. **"Java 17/21 required" error:**
   - Install correct JDK version
   - Update `android/gradle.properties`

2. **"Module not found" errors:**
   - Delete `node_modules`
   - Run `npm install`

3. **Capacitor sync issues:**
   - Run `npx cap sync android`
   - Rebuild Android project

## 📊 Performance

### Bundle Sizes (Production)
- **Frontend:**
  - HTML: 0.49 KB
  - CSS: 24.88 KB (gzipped: 4.98 KB)
  - JavaScript: 405.92 KB (gzipped: 128.80 KB)
  
- **Android APK:**
  - Debug: ~5.3 MB
  - Release (minified): ~4.5 MB

### Optimization
- ✅ Code splitting with Vite
- ✅ Tree shaking enabled
- ✅ Gzip compression
- ✅ Lazy loading for components
- ✅ Development-only console logs
- ✅ Encrypted local storage

## 🔐 Security Best Practices

1. **Change default encryption key** in production
2. **Use HTTPS** for backend API
3. **Enable biometric auth** for sensitive operations
4. **Set auto-lock timeout** appropriately
5. **Regular data backups** via export feature
6. **Keep dependencies updated** for security patches

## 📄 License

Private project - All rights reserved

## 👤 Author

**Isuru Shamika**
- GitHub: [@isurushamika](https://github.com/isurushamika)

## 🙏 Acknowledgments

- React Team
- Capacitor Team
- Tailwind CSS
- Chart.js
- All open-source contributors

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Status:** Production Ready ✅

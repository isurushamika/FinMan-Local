# FinMan - Personal Finance Manager (Electron Desktop App)

**Offline-First Desktop Personal Finance Management Application**

FinMan is a completely offline desktop application that runs natively on your computer. All your financial data stays on your device - no cloud, no server, no internet required!

## 🚀 One-Click Quick Start

### Windows Users

**Double-click `START_FINMAN.bat`**

That's it! The app will:
1. Install dependencies automatically (first time only)
2. Launch as a desktop application
3. No browser needed!

### Alternative (PowerShell)

Right-click `START_FINMAN.ps1` → "Run with PowerShell"

## 📦 Build Standalone Executable

Want to create an installer that you can share or run without Node.js?

**Double-click `BUILD_EXECUTABLE.bat`**

This will create:
- `FinMan Setup 1.0.0.exe` - Windows installer in `apps/finman/frontend/release/`

After installation, FinMan runs like any other desktop app!

## ✨ Features

### 📊 Transaction Management
- Track income and expenses
- Categorize transactions
- Add descriptions and accounts
- Quick search and filtering
- Visual charts and analytics

### 💰 Budget Planning
- Create monthly/yearly budgets by category
- Real-time budget progress tracking
- Budget alerts and notifications
- Overspending warnings

### 🔄 Recurring Transactions
- Set up recurring bills and income
- Daily, weekly, monthly, or yearly frequency
- Auto-generate transactions
- Pause/resume recurring items

### 💳 Subscription Tracking
- Track all your subscriptions
- Monitor recurring costs
- Cancellation date tracking
- Total monthly subscription costs

### 📦 Price Tracker
- Track item prices over time
- Record purchase history
- Compare prices across stores
- Identify price trends

### 🔔 Smart Notifications
- Upcoming bill reminders
- Budget alert warnings
- Configurable notification settings
- Never miss a payment

### 💾 Data Management
- Export data as JSON
- Import data from backups
- Clear specific data types
- Full local storage control

## 🔒 Privacy & Security

✅ **100% Offline** - No internet connection required  
✅ **Desktop App** - Runs natively on your computer  
✅ **Local Storage** - All data stored on your device  
✅ **No Cloud** - Your data never leaves your computer  
✅ **No Tracking** - No analytics, no telemetry  
✅ **Open Source** - Full transparency  

## 📋 System Requirements

- **Windows**: 10 or higher
- **macOS**: 10.13 or higher (build with `npm run electron:build:mac`)
- **Linux**: Most modern distributions (build with `npm run electron:build:linux`)
- **Memory**: 512MB RAM minimum
- **Disk Space**: 200MB for installation

For development:
- **Node.js** 16 or higher ([Download here](https://nodejs.org/))

## 🛠️ Manual Development

If the one-click launcher doesn't work:

```bash
# Navigate to the frontend directory
cd apps/finman/frontend

# Install dependencies (first time only)
npm install

# Run in development mode
npm run electron:dev

# Or build executable
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

## 📱 Desktop App vs Browser

### Desktop App (Electron)
✅ Runs as native application  
✅ No browser required  
✅ System tray integration  
✅ Proper window management  
✅ OS-native menus  
✅ Can create shortcuts  
✅ Feels like a real app  

### Browser Version
Want to run in browser instead? Use:
```bash
npm run dev
```
Then open http://localhost:5173

## 🎯 Usage Guide

### First Time Setup
1. Launch the application using `START_FINMAN.bat`
2. The desktop app window opens
3. Start adding transactions from the "Add New" tab

### Daily Use
1. Double-click the FinMan shortcut (after installation)
2. Add/view transactions
3. Check your dashboard for insights
4. Review budgets and spending
5. Close the app window when done (data is automatically saved)

### Data Backup
1. Go to the "Data" tab
2. Click "Export All Data"
3. Save the JSON file to a safe location
4. Use "Import Data" to restore from a backup

## 🔧 Troubleshooting

### App won't start
- Ensure Node.js is installed: `node --version`
- Delete `node_modules` folder and try again
- Run `npm install` manually in the frontend directory

### Build fails
- Run `npm install` again
- Check you have enough disk space (need ~500MB during build)
- Try running as Administrator

### Data disappeared
- Data is stored in Electron's userData folder
- Location varies by OS:
  - Windows: `%APPDATA%\finman\`
  - macOS: `~/Library/Application Support/finman/`
  - Linux: `~/.config/finman/`
- Always keep regular backups using the Export feature

### Window doesn't open
- Check if the app is already running (system tray)
- Restart your computer
- Rebuild the app with `BUILD_EXECUTABLE.bat`

## 💡 Tips

- **Regular Backups**: Export your data weekly
- **Desktop Shortcut**: Pin to taskbar for quick access
- **Multiple Devices**: Export/import data to sync between computers
- **Data Safety**: Data persists even after reinstalling the app!

## 🎨 Customization

The app includes:
- 🌓 Dark mode support (follows system theme)
- 📊 Multiple chart visualizations
- 🔍 Advanced filtering
- 📱 Responsive design
- 🎯 Native window controls

## 📁 Project Structure

```
financial-local/
├── START_FINMAN.bat          # One-click launcher (Windows)
├── START_FINMAN.ps1          # PowerShell launcher
├── BUILD_EXECUTABLE.bat      # Build standalone installer
└── apps/finman/frontend/     # Application code
    ├── electron.js           # Electron main process
    ├── src/                  # React source code
    ├── public/               # Static assets
    ├── dist/                 # Built files (after build)
    ├── release/              # Executables (after build)
    └── package.json          # Dependencies
```

## 📦 Distribution

### Share the Installer
After running `BUILD_EXECUTABLE.bat`, you'll get:
- `FinMan Setup 1.0.0.exe` - Full installer (~80-120MB)

Share this file with others! They can:
1. Double-click to install
2. Run FinMan without Node.js
3. Get automatic updates (if configured)

### Portable Version
To create a portable version (no installation needed):
```bash
npm run electron:build:win -- --dir
```
This creates a folder you can copy to USB drives.

## 🚫 What's Not Included

This is a **local-only** desktop application. It does NOT include:
- ❌ Cloud sync
- ❌ Multi-device sync
- ❌ Online backup
- ❌ User authentication
- ❌ API server
- ❌ Database server

Your data is stored entirely on your device using Electron's storage.

## 🆘 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Electron logs (Help → Toggle Developer Tools)
3. Check the `release/` folder for build logs
4. Verify Node.js is properly installed

## 📄 License

MIT License - Feel free to use and modify for personal use.

## 🔄 Updates

To update the application:
1. Pull the latest code
2. Run `BUILD_EXECUTABLE.bat` again
3. Install the new version (keeps your data)

Or in development mode:
```bash
cd apps/finman/frontend
npm install
npm run electron:dev
```

## 🎉 What's New in Electron Version

✅ **Native Desktop App** - No browser required  
✅ **Windows Installer** - Professional NSIS installer  
✅ **System Integration** - Proper menus, shortcuts, icons  
✅ **Better Performance** - Optimized for desktop  
✅ **Persistent Storage** - Data in OS-specific location  
✅ **Auto Updates** - Ready for update system (optional)  
✅ **Offline by Default** - No internet needed ever  

---

**Made with ❤️ for local, private, offline personal finance management**

*Your money, your data, your device. Period.*

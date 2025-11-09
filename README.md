# FinMan - Personal Finance Manager

**Offline-First Personal Finance Management Application**

FinMan is a completely offline personal finance manager that runs locally on your computer. All your financial data stays on your device - no cloud, no server, no internet required!

## 🚀 One-Click Quick Start

### Windows Users

**Double-click `START_FINMAN.bat`**

That's it! The app will:
1. Install dependencies automatically (first time only)
2. Start the application
3. Open in your default browser at `http://localhost:5173`

### Alternative (PowerShell)

Right-click `START_FINMAN.ps1` → "Run with PowerShell"

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
✅ **Local Storage** - All data stored in your browser  
✅ **No Cloud** - Your data never leaves your computer  
✅ **No Tracking** - No analytics, no telemetry  
✅ **Open Source** - Full transparency  

## 📋 System Requirements

- **Node.js** 16 or higher ([Download here](https://nodejs.org/))
- **Modern Web Browser** (Chrome, Edge, Firefox, Safari)
- **Operating System**: Windows, macOS, or Linux

## 🛠️ Manual Installation

If the one-click launcher doesn't work:

```bash
# Navigate to the frontend directory
cd apps/finman/frontend

# Install dependencies (first time only)
npm install

# Start the application
npm run dev
```

Then open your browser to `http://localhost:5173`

## 📱 Usage Guide

### First Time Setup
1. Launch the application using `START_FINMAN.bat`
2. The app opens in your browser
3. Start adding transactions from the "Add New" tab

### Daily Use
1. Double-click `START_FINMAN.bat` to launch
2. Add/view transactions
3. Check your dashboard for insights
4. Review budgets and spending
5. Close browser tab when done (data is automatically saved)

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

### Data disappeared
- Data is stored in browser localStorage
- Clearing browser cache removes data
- Always keep regular backups using the Export feature

### Browser compatibility
- Use a modern browser (Chrome, Edge, Firefox recommended)
- Enable JavaScript and localStorage
- Don't use private/incognito mode (data won't persist)

### Port already in use
- If port 5173 is busy, the app will use a different port
- Check the terminal output for the correct URL

## 💡 Tips

- **Regular Backups**: Export your data weekly
- **Browser Bookmarks**: Bookmark `http://localhost:5173` for quick access
- **Multiple Devices**: Export/import data to sync between computers
- **Data Safety**: Your data is stored in browser localStorage - don't clear browsing data!

## 🎨 Customization

The app includes:
- 🌓 Dark mode support
- 📊 Multiple chart visualizations
- 🔍 Advanced filtering
- 📱 Responsive design for all screen sizes

## 📁 Project Structure

```
financial-local/
├── START_FINMAN.bat          # One-click launcher (Windows)
├── START_FINMAN.ps1          # PowerShell launcher
└── apps/finman/frontend/     # Application code
    ├── src/                  # Source code
    ├── public/               # Static assets
    └── package.json          # Dependencies
```

## 🚫 What's Not Included

This is a **local-only** version. It does NOT include:
- ❌ Cloud sync
- ❌ Multi-device sync
- ❌ User authentication
- ❌ Online backup
- ❌ Mobile app
- ❌ API server
- ❌ Database server

Your data is stored entirely in your browser's localStorage.

## 🆘 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review browser console for errors (F12)
3. Ensure you're using a supported browser
4. Verify Node.js is installed correctly

## 📄 License

MIT License - Feel free to use and modify for personal use.

## 🔄 Updates

To update the application:
1. Pull the latest code
2. Run `npm install` in the frontend directory
3. Restart the application

---

**Made with ❤️ for local, private, offline personal finance management**

*Your money, your data, your device. Period.*

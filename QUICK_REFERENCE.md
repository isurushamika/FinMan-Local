# FinMan - Quick Reference

## 🚀 Starting the App

**Windows**: Double-click `START_FINMAN.bat`

**PowerShell**: Right-click `START_FINMAN.ps1` → "Run with PowerShell"

**Manual**:
```bash
cd apps/finman/frontend
npm run dev
```

App opens at: http://localhost:5173

---

## 📊 Main Features

| Feature | Location | Description |
|---------|----------|-------------|
| **Dashboard** | Dashboard tab | Overview, charts, summaries |
| **Add Transaction** | Add New tab | Record income/expenses |
| **View Transactions** | Transactions tab | List, search, filter |
| **Budgets** | Budgets tab | Set and track budgets |
| **Recurring** | Recurring tab | Auto-repeat transactions |
| **Subscriptions** | Subscriptions tab | Track subscriptions |
| **Price Tracker** | Price Tracker tab | Monitor item prices |
| **Settings** | Settings tab | Preferences, notifications |
| **Data Management** | Data tab | Export, import, clear data |

---

## 💾 Data Backup

### Export (Backup)
1. Click **Data** tab
2. Click **Export All Data**
3. Save the `.json` file somewhere safe
4. Do this weekly!

### Import (Restore)
1. Click **Data** tab
2. Click **Import Data**
3. Select your backup `.json` file
4. Data is restored!

---

## ⚙️ Important Settings

### Notifications
- **Settings** tab → Enable/disable alerts
- Budget warnings at 80% and 100%
- Bill reminders (1 day, 3 days, 7 days before)

### Dark Mode
- Automatic based on system preference
- Toggle in browser or OS settings

---

## 🔒 Privacy & Storage

✅ **All data stored locally** in your browser  
✅ **No internet connection needed** to use the app  
✅ **No cloud storage** - your data never leaves your PC  
✅ **No tracking** - zero analytics or telemetry  

⚠️ **Important**: Don't clear browser data or you'll lose your transactions!

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **App won't start** | Install Node.js from https://nodejs.org |
| **Port 5173 in use** | Close other Vite apps, or use the new port shown in terminal |
| **Data disappeared** | Restore from backup JSON file |
| **Charts not showing** | Refresh the page (F5) |
| **Slow performance** | Clear old data, export/import to clean up |

---

## 🎯 Best Practices

1. **Export data weekly** - Keep regular backups
2. **Categorize consistently** - Use the same category names
3. **Add descriptions** - Help remember transactions later
4. **Set realistic budgets** - Start conservative
5. **Review monthly** - Check dashboard regularly
6. **Use recurring** - Set up bills once, forget about it

---

## 📂 Data Storage Location

Your data is stored in your browser's localStorage:
- **Chrome**: `chrome://settings/content/all?search=localhost`
- **Edge**: `edge://settings/content/all?search=localhost`
- **Firefox**: `about:preferences#privacy` → Manage Data

**Storage used**: ~1KB per transaction (typical: 1-5MB total)

---

## 🆘 Emergency Recovery

If the app crashes or won't load:

1. **Don't panic!** Data is still in browser storage
2. Open browser DevTools (F12)
3. Go to **Application** → **Local Storage** → `http://localhost:5173`
4. Copy/save the data manually
5. Clear browser cache
6. Restart app
7. Import your backup

---

## 📱 Pro Tips

### Keyboard Shortcuts
- **F5** - Refresh page
- **F12** - Open DevTools (advanced)
- **Ctrl+F** - Find in transactions
- **Esc** - Close modals/popups

### Transaction Tips
- Use consistent category names (Food, not Food/Groceries)
- Add account info (Cash, Bank, Credit Card)
- Include store/merchant names in description
- Date transactions accurately for better charts

### Budget Tips
- Start with monthly budgets first
- Track 3 months before setting limits
- Include buffer (10-20% extra)
- Review and adjust quarterly

---

## 🔄 Updates

To update the app:
```bash
cd apps/finman/frontend
npm install
```

Then restart the app.

---

## 📞 Support

1. Check this quick reference
2. Read the main README.md
3. Check browser console for errors (F12)
4. Review OFFLINE_CONVERSION.md for technical details

---

**Remember**: This is YOUR app, YOUR data, YOUR computer. Complete privacy guaranteed! 🔒

# FinMan Auto Backup Setup Guide

## Quick Start

1. **Open FinMan** and log in with your password
2. Click **Settings** (gear icon at bottom)
3. Click **Auto Backup** tab
4. Click **Browse** to select your backup location
5. Choose your backup frequency (Daily recommended)
6. Set how many backups to keep (7 recommended)
7. Enable **"Enable Automatic Backups"**
8. Click **Save Settings**

Done! Your data will now automatically backup.

---

## Recommended Backup Locations

### OneDrive (Best for Windows)
```
C:\Users\YourName\OneDrive\FinMan Backups
```
- ✅ Automatically syncs to cloud
- ✅ Access from any device
- ✅ Free 5GB storage

### Dropbox
```
C:\Users\YourName\Dropbox\FinMan Backups
```
- ✅ Cross-platform sync
- ✅ Easy file sharing
- ✅ Version history

### External Drive (Best for Privacy)
```
E:\FinMan Backups
```
- ✅ Complete privacy (offline)
- ✅ Physical control
- ✅ No cloud dependency

### Network Drive
```
\\NAS\Backups\FinMan
```
- ✅ Home network backup
- ✅ Shared family access
- ✅ Local speed

---

## Backup Frequency Guide

| Frequency | Best For | Storage Used |
|-----------|----------|--------------|
| **Hourly** | Active day traders | High |
| **Daily** | Regular users | Medium (recommended) |
| **Weekly** | Casual users | Low |

---

## How Many Backups to Keep?

**7 Daily Backups** = 1 week of history (recommended)
**30 Daily Backups** = 1 month of history (power users)
**7 Weekly Backups** = 7 weeks of history (casual)

**Tip**: More backups = more storage used, but better recovery options.

---

## Manual Backup

Need a backup right now?
1. Go to Settings > Auto Backup
2. Click **"Backup Now"**
3. Done! Backup created instantly.

---

## Restore from Backup

**Coming Soon**: Currently, backups can be manually restored by:
1. Closing FinMan
2. Copying backup file to data folder
3. Renaming to `finman-data.enc`
4. Restarting FinMan

---

## Backup File Names

Backups are named with timestamps:
```
finman-backup-2025-11-09-12-30-00.enc
                 YYYY-MM-DD-HH-MM-SS
```

This makes it easy to identify when each backup was created.

---

## Storage Requirements

Each backup file size depends on your data:
- **100 transactions**: ~50 KB
- **1,000 transactions**: ~500 KB
- **10,000 transactions**: ~5 MB

**Example**: 7 daily backups with 1,000 transactions = ~3.5 MB total

OneDrive free tier (5 GB) can store years of backups!

---

## Troubleshooting

### "No data file to backup"
**Solution**: Add some transactions first, then try backup.

### "Failed to select location"
**Solution**: Make sure the folder exists and you have write permissions.

### "Backup failed"
**Solution**: Check disk space and folder permissions.

### Backup not automatic?
**Solution**: Make sure "Enable Automatic Backups" is checked and settings are saved.

---

## Security

### Are backups encrypted?
**Yes!** Backups use the same AES-256-GCM encryption as your main data file.

### Can others read my backups?
**No!** Without your FinMan password, backup files are unreadable.

### What if I forget my password?
**Important**: Save your password somewhere safe. If lost, backups cannot be recovered.

---

## Best Practices

1. ✅ **Daily backups** to cloud storage (OneDrive/Dropbox)
2. ✅ **Weekly backups** to external drive (offline safety)
3. ✅ **Keep at least 7 backups** (1 week of history)
4. ✅ **Test restore** occasionally (verify backups work)
5. ✅ **Secure password** (write it down safely)

---

## Advanced Tips

### Multiple Backup Locations
Want both cloud AND external drive backups?
1. Set primary backup to OneDrive
2. Manually copy backup files to external drive weekly
3. Best of both worlds!

### Before Major Changes
About to make big changes to your data?
1. Go to Settings > Auto Backup
2. Click "Backup Now"
3. Make your changes
4. If something goes wrong, restore from backup

### Moving Computers
1. Copy all backup files from old computer
2. Install FinMan on new computer
3. Copy backups to new backup location
4. Restore latest backup

---

## Session Timeout Feature

FinMan now automatically locks after 15 minutes of inactivity.

**To unlock:**
1. Enter your password
2. Continue working

**To change timeout:**
Currently fixed at 15 minutes. Future update will make this configurable.

---

## Need Help?

Check the NEW_FEATURES.md file for technical details.

---

**That's it!** Your financial data is now safely backed up automatically. 🎉

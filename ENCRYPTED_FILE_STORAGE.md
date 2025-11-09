# Encrypted File Storage Guide

## Overview
FinMan now supports encrypted file storage, allowing your financial data to be stored in an encrypted file on your computer instead of browser localStorage. This provides better security, portability, and backup capabilities.

## Features

### 🔐 Encrypted Storage
- All data is encrypted using AES-256 encryption
- Your password is used as the encryption key
- Data is stored in: `C:\Users\[Username]\AppData\Roaming\finman\finman-data.enc`

### 📦 Data Migration
- One-click migration from browser localStorage to encrypted file
- Seamlessly migrate your existing data
- No data loss during migration

### 💾 Backup & Restore
- **Export**: Create encrypted backup files to any location
- **Import**: Restore data from encrypted backup files
- Backups are fully encrypted and portable

## How to Use

### 1. Open Settings
1. Launch FinMan desktop app
2. Click on "Settings" in the navigation
3. Go to the "Data Storage" tab

### 2. Migrate to File Storage
1. Click "Migrate Now" button
2. Your data will be moved from browser storage to an encrypted file
3. Wait for success confirmation

### 3. Create Backups (Export)
1. Click "Export Backup" button
2. Choose a location to save your backup file
3. Default filename: `finman-backup-YYYY-MM-DD.enc`
4. Store this file in a safe location (external drive, cloud storage, etc.)

### 4. Restore from Backup (Import)
1. Click "Import Backup" button
2. Select your encrypted backup file (.enc)
3. Your data will be restored
4. Refresh the app to see imported data

## Storage Locations

### Default Data File (Portable Mode)
```
Windows: [FinMan.exe Location]\data\finman-data.enc
Mac: [FinMan.app Location]/data/finman-data.enc
Linux: [FinMan Location]/data/finman-data.enc
```

**Example:**
If FinMan.exe is in `D:\Apps\FinMan\`, your data will be in:
```
D:\Apps\FinMan\data\finman-data.enc
```

### Backup Files
- You choose the location when exporting
- Recommended: External drive or cloud storage
- File extension: `.enc`

## Security Notes

✅ **What's Encrypted:**
- All transactions
- Budgets
- Recurring transactions
- Subscriptions
- Price tracking data
- Settings

✅ **Encryption Details:**
- Algorithm: AES-256-GCM
- Key Derivation: PBKDF2 with 100,000 iterations
- Salt: Randomly generated per user

⚠️ **Important:**
- Your password is the encryption key
- If you forget your password, you cannot decrypt your data
- Keep backups of your encrypted file
- Store backups in multiple safe locations

## Advantages over localStorage

| Feature | localStorage | Encrypted File |
|---------|-------------|----------------|
| Portability | ❌ Tied to browser | ✅ Can move entire folder |
| Backup | ❌ Manual export only | ✅ Copy entire FinMan folder |
| Security | ⚠️ Browser storage | ✅ Encrypted file |
| Multi-device | ❌ No | ✅ Copy folder to USB/other PC |
| Size Limit | ⚠️ 5-10MB browser limit | ✅ No practical limit |
| USB Drive | ❌ No | ✅ Run from USB stick |

## Troubleshooting

### Migration Failed
- Ensure you're running the desktop app (not browser)
- Check you have write permissions to AppData folder
- Try exporting data first as a backup

### Import Failed
- Verify you're using the correct password
- Check the backup file isn't corrupted
- Ensure the file has `.enc` extension

### File Not Found
- Check the default location: `%APPDATA%\finman\finman-data.enc`
- Ensure the app has permission to create files
- Try running the app as administrator

## Portable Mode (USB Drive Ready!)

FinMan now runs in **portable mode**, meaning:
- All data is stored in the same folder as FinMan.exe
- You can copy the entire FinMan folder anywhere
- Perfect for USB drives or external storage
- No installation needed on new computers

### Running from USB Drive:
1. Copy the entire `win-unpacked` folder to your USB drive
2. Rename it to `FinMan` (optional)
3. Run `FinMan.exe` from the USB drive
4. Your data travels with you!

### Moving to Another Computer:
1. Copy the entire FinMan folder (including the `data` subfolder)
2. Paste it on the new computer
3. Run FinMan.exe
4. All your data is there!

### Folder Structure:
```
FinMan/
├── FinMan.exe
├── resources/
├── locales/
├── data/                    ← Your encrypted data here!
│   └── finman-data.enc
└── [other files]
```

## Best Practices

1. **Create Regular Backups**
   - Export your data weekly
   - Keep multiple backup versions
   - Store backups in different locations

2. **Test Your Backups**
   - Occasionally test importing from backup
   - Verify data integrity after import

3. **Secure Your Password**
   - Use a strong, unique password
   - Never share your password
   - Consider using a password manager

4. **Multiple Devices**
   - Export from Device A
   - Import to Device B
   - Both devices will have identical data

## Technical Details

### File Format
```
finman-data.enc (Encrypted JSON)
├── transactions[]
├── budgets[]
├── recurring[]
├── items[]
├── purchases[]
├── version
└── lastModified
```

### Encryption Process
1. User data → JSON string
2. JSON string + Password + Salt → PBKDF2
3. Derived key + Data → AES-256-GCM encryption
4. Encrypted data → File

### Decryption Process
1. Read encrypted file
2. Password + Salt → PBKDF2 key derivation
3. Derived key + Encrypted data → AES-256-GCM decryption
4. Decrypted JSON → Parsed data → App

## Future Enhancements

🔜 Planned features:
- Automatic daily backups
- Cloud sync (optional, encrypted)
- Multiple vault support
- Backup to USB drive on insert
- Compression for large data files

## Support

If you encounter any issues:
1. Check the app logs
2. Try exporting your data first
3. Report issues on GitHub
4. Include error messages (no personal data)

---

**Remember**: Your data security is in your hands. Keep your password safe and create regular backups!

# Android Testing Guide

## Prerequisites

### Hardware Requirements
- ✅ Windows PC with development environment
- ✅ Android device or emulator
- ✅ Both on the same WiFi network (for local testing)

### Software Requirements
- ✅ Android Studio installed
- ✅ Java 17 or higher
- ✅ Node.js and npm
- ✅ Backend server running

### Network Information
- **Your Computer IP:** 192.168.1.199
- **Backend Port:** 3000
- **Backend URL:** http://192.168.1.199:3000

## Quick Start

### Option 1: Automated Build (Recommended)

```bash
# Run the automated build script
.\build-android.bat
```

This will:
1. Copy `.env.android` to `.env`
2. Build the frontend
3. Sync with Capacitor
4. Open Android Studio

### Option 2: Manual Build

```bash
# 1. Navigate to frontend
cd apps\finman\frontend

# 2. Copy Android environment
copy .env.android .env

# 3. Build frontend
npm run build

# 4. Sync with Capacitor
npx cap sync

# 5. Open Android Studio
npx cap open android
```

## Pre-Testing Checklist

### 1. Backend Server Running

```bash
cd apps\finman\backend
npm run dev
```

Expected output:
```
🚀 FinMan API Server running on http://0.0.0.0:3000
📝 Environment: development
```

### 2. Verify Backend Accessibility

From your computer's browser:
```
http://localhost:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-10-04T..."}
```

### 3. Verify Network Accessibility

From your phone's browser (while on same WiFi):
```
http://192.168.1.199:3000/health
```

Should return the same JSON response.

**If this doesn't work:**
- Check both devices are on same WiFi
- Check Windows Firewall (see Firewall section below)
- Verify backend is running on 0.0.0.0 (not just localhost)

### 4. Check Environment Configuration

**File:** `apps/finman/frontend/.env`

Should contain:
```env
VITE_API_URL=http://192.168.1.199:3000
```

## Building the Android App

### Using Android Studio

1. **Open Project**
   - Android Studio should open automatically
   - Or: File → Open → `apps/finman/frontend/android`

2. **Wait for Gradle Sync**
   - May take a few minutes first time
   - Watch bottom status bar

3. **Select Device**
   - Top toolbar: Select your Android device or emulator
   - If no device: Tools → Device Manager → Create Virtual Device

4. **Build & Run**
   - Click green play button (▶️) or press Shift+F10
   - App will install and launch on device

### First Build Troubleshooting

**Gradle Build Failed:**
```bash
# Clean and rebuild
cd apps\finman\frontend\android
.\gradlew clean
.\gradlew build
```

**Java Version Issues:**
- Ensure Java 17 is installed
- Set JAVA_HOME environment variable
- See JAVA17_SETUP.md for details

**SDK Not Found:**
- Open SDK Manager (Tools → SDK Manager)
- Install Android SDK Platform 34
- Install Android SDK Build-Tools

## Testing Checklist

### Phase 1: Network Connectivity

- [ ] App launches successfully
- [ ] No crash on startup
- [ ] Check logcat for network errors

**Logcat Filter:**
```
package:com.finman.app
```

Look for errors like:
- "Network request failed"
- "Unable to resolve host"
- "Connection refused"

### Phase 2: Authentication

- [ ] Register new user
- [ ] Verify registration successful
- [ ] Logout
- [ ] Login with same credentials
- [ ] Verify login successful
- [ ] Check token stored locally

**Test Data:**
```
Email: android-test@example.com
Password: test123456
Name: Android Tester
```

### Phase 3: CRUD Operations

**Items:**
- [ ] Create new item
- [ ] View items list
- [ ] Update item
- [ ] Delete item
- [ ] Verify all changes persist

**Purchases:**
- [ ] Create purchase for item
- [ ] View purchase history
- [ ] Delete purchase
- [ ] Verify changes persist

**Transactions:**
- [ ] Create income transaction
- [ ] Create expense transaction
- [ ] View transactions list
- [ ] Update transaction
- [ ] Delete transaction

### Phase 4: Offline Functionality

- [ ] Enable Airplane Mode
- [ ] Create item (should queue)
- [ ] Update item (should queue)
- [ ] Check sync status shows "Offline"
- [ ] Check pending count increases
- [ ] Disable Airplane Mode
- [ ] Verify automatic sync occurs
- [ ] Verify all changes synced

### Phase 5: Sync Status

- [ ] Sync indicator shows in UI
- [ ] Status changes: Online → Offline → Syncing
- [ ] Pending operations count displays
- [ ] Manual sync button works
- [ ] Last sync time updates

## Debugging

### Viewing Console Logs

**Chrome DevTools (Recommended):**
1. Connect device via USB
2. Enable USB Debugging on device
3. Open Chrome: `chrome://inspect`
4. Click "Inspect" on your app
5. View Console tab

**Android Studio Logcat:**
1. Bottom tab: Logcat
2. Filter by package name
3. Look for errors in red

### Common Issues

#### Can't Connect to Backend

**Symptoms:**
- Network errors
- "Connection refused"
- Timeout errors

**Solutions:**
1. Check both devices on same WiFi
2. Verify backend running: `http://192.168.1.199:3000/health`
3. Check Windows Firewall (see below)
4. Verify `.env` has correct IP

#### Windows Firewall Blocking

**Quick Fix:**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```

**Or manually:**
1. Windows Security → Firewall & network protection
2. Advanced settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000
5. Allow the connection

#### API Returns 401 Unauthorized

**Symptoms:**
- Can't login
- "Unauthorized" errors
- Token issues

**Solutions:**
1. Clear app data: Settings → Apps → FinMan → Storage → Clear Data
2. Verify backend JWT_SECRET matches
3. Check token expiration (default 7 days)

#### Gradle Build Errors

**Symptoms:**
- "Task failed"
- "Could not resolve dependencies"

**Solutions:**
```bash
cd apps\finman\frontend\android
.\gradlew clean
.\gradlew --refresh-dependencies
```

#### App Crashes on Startup

**Check Logcat for:**
- JavaScript errors
- Native crashes
- Missing resources

**Common fixes:**
```bash
# Rebuild everything
npm run build
npx cap sync
```

### Performance Testing

#### Check API Response Times

In Chrome DevTools:
1. Network tab
2. Look at API request times
3. Should be < 500ms on local network

#### Check App Performance

In Chrome DevTools:
1. Performance tab
2. Record session
3. Look for:
   - Slow renders
   - Memory leaks
   - Large bundles

## Testing Scenarios

### Scenario 1: New User Flow

1. Launch app
2. Click "Sign Up"
3. Enter details
4. Create account
5. Automatically logged in
6. Dashboard shows

### Scenario 2: Offline Shopping

1. Go to Items
2. Add items to track
3. Enable Airplane Mode
4. Add purchase records (queued)
5. Disable Airplane Mode
6. Verify purchases synced

### Scenario 3: Budget Tracking

1. Create budget for category
2. Add expenses in that category
3. View budget progress
4. Verify alerts for overspending

### Scenario 4: Multi-Device Sync

1. Make changes on Android
2. Open web app on computer
3. Verify changes appear
4. Make changes on web
5. Refresh Android app
6. Verify changes appear

## Performance Benchmarks

### Expected Performance

| Operation | Target | Acceptable |
|-----------|--------|------------|
| API Call (local) | < 100ms | < 500ms |
| Page Load | < 1s | < 2s |
| Sync Operation | < 2s | < 5s |
| App Launch | < 2s | < 4s |

### Network Usage

- Typical API call: < 5 KB
- Image upload: Varies by size
- Offline queue: Stored locally (0 network)

## Security Testing

### Checklist

- [ ] HTTPS in production (not HTTP)
- [ ] Tokens encrypted in storage
- [ ] Passwords not logged
- [ ] API credentials not in code
- [ ] No sensitive data in logs

### Test Cases

1. **Token Expiration:**
   - Wait 7 days
   - Verify auto-logout
   - Require re-login

2. **Invalid Token:**
   - Manually corrupt token
   - Verify redirected to login

3. **Network Security:**
   - Verify cleartext only allowed for development
   - Production should enforce HTTPS

## After Testing

### Restore Development Environment

```bash
cd apps\finman\frontend
copy .env.development .env
npm run build
```

### Clear Test Data

If needed, clear database:
```sql
-- On VPS or local PostgreSQL
TRUNCATE TABLE item_purchases, items, transactions, budgets, recurring_transactions, users CASCADE;
```

Or use API:
```bash
# Clear specific user's data
DELETE /api/items
DELETE /api/transactions
DELETE /api/budgets
```

## Deploying to Production

Once testing is complete:

1. Update `.env.production`:
   ```env
   VITE_API_URL=https://yourdomain.com
   ```

2. Build production APK:
   ```bash
   copy .env.production .env
   npm run build
   npx cap sync
   cd android
   .\gradlew assembleRelease
   ```

3. Sign APK (see Android docs)

4. Upload to Google Play Store

## Summary

✅ **Network configured** for Android  
✅ **Permissions** set in manifest  
✅ **Build scripts** created  
✅ **Testing guide** complete  
✅ **Debugging tools** documented  

Your Android app is ready to test! 🚀

**Start Testing:**
```bash
.\build-android.bat
```

**Questions?** Check the troubleshooting section or logs in Chrome DevTools.


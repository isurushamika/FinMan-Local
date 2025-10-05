# Android Development Configuration

## Local Network API Configuration

Your computer's IP address: **192.168.1.199**

### Environment Files

Create different `.env` files for each environment:

#### 1. Development (Local Browser)
**File:** `.env.development`
```env
VITE_API_URL=http://localhost:3000
```

#### 2. Android (Same Network)
**File:** `.env.android`
```env
VITE_API_URL=http://192.168.1.199:3000
```

#### 3. Production (VPS)
**File:** `.env.production`
```env
VITE_API_URL=https://yourdomain.com
```

### Current Setup

The app is currently using `.env` which points to `http://localhost:3000`.

For Android testing on the same network, you need to:

1. **Update `.env` temporarily** or **create `.env.android`**
2. **Rebuild the app** with Android configuration
3. **Test on device**

### Network Requirements

✅ **Already Configured:**
- Internet permission in AndroidManifest.xml
- Network state permission in AndroidManifest.xml
- Cleartext traffic allowed (for HTTP in development)

### Testing Steps

1. **Ensure both devices are on the same WiFi network**
2. **Start backend server:**
   ```bash
   cd apps/finman/backend
   npm run dev
   ```
   Server will be available at: http://192.168.1.199:3000

3. **Update frontend .env for Android:**
   ```env
   VITE_API_URL=http://192.168.1.199:3000
   ```

4. **Rebuild frontend:**
   ```bash
   cd apps/finman/frontend
   npm run build
   npx cap sync
   ```

5. **Build and run Android app:**
   ```bash
   cd apps/finman/frontend
   npx cap run android
   ```

6. **Test API connectivity** from the app

### Firewall Configuration

If the Android app can't connect, you may need to allow the backend port through Windows Firewall:

```powershell
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```

### Verification

Test API connectivity from your phone's browser first:
1. Open browser on Android device
2. Navigate to: http://192.168.1.199:3000/health
3. Should see: `{"status":"ok","timestamp":"..."}`

If this works, the app will be able to connect too!

### Troubleshooting

**Can't connect from Android:**
1. Check both devices on same WiFi
2. Check Windows Firewall settings
3. Verify backend is listening on 0.0.0.0 (not just localhost)
4. Try ping from phone: `ping 192.168.1.199`

**Backend not accessible:**
- Check `apps/finman/backend/.env` has `HOST=0.0.0.0`
- Restart backend server
- Check no other service using port 3000

### IP Address Changes

If your computer's IP changes:
1. Run `ipconfig` to get new IP
2. Update `.env.android` with new IP
3. Rebuild and sync: `npm run build && npx cap sync`

### Production Setup

For production, use HTTPS:
```env
VITE_API_URL=https://api.yourdomain.com
```

No IP address needed - works from anywhere!

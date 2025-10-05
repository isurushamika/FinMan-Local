# Building FinMan Android App with Capacitor

Complete guide to build, test, and deploy your FinMan Android app with native biometric authentication.

---

## 🎯 What You'll Build

- ✅ Native Android APK
- ✅ Real fingerprint/face authentication
- ✅ Connects to your Ubuntu server
- ✅ Works offline with local storage
- ✅ Install on any Android device
- ✅ Optional: Publish to Play Store

---

## 📋 Prerequisites

### Required Software

**Windows:**
```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Install Android Studio
winget install Google.AndroidStudio

# Install Java JDK 17
winget install Microsoft.OpenJDK.17
```

**Environment Variables (Windows):**
```powershell
# Add to System Environment Variables:
JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.x.x
ANDROID_HOME=C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

---

## 🚀 Quick Build (3 Steps)

### Step 1: Configure for Production

Edit `apps/finman/frontend/capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finman.app',
  appName: 'FinMan',
  webDir: 'dist',
  
  server: {
    // Point to your Ubuntu server
    url: 'https://finman.yourdomain.com',
    cleartext: false  // Use HTTPS only
  },
  
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false  // Disable in production
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    }
  }
};

export default config;
```

### Step 2: Build and Sync

```powershell
cd D:\Projects\Dev\financial\apps\finman\frontend

# Build web assets
npm run build

# Sync to Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 3: Build APK in Android Studio

1. Android Studio opens automatically
2. Wait for Gradle sync to complete
3. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Wait 2-5 minutes for build
5. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Install on Your Phone

### Via USB (ADB)

```powershell
# Enable USB debugging on phone:
# Settings → About → Tap "Build number" 7 times
# Settings → Developer options → USB debugging (ON)

# Connect phone via USB
# Install APK
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Launch app
adb shell am start -n com.finman.app/.MainActivity
```

### Via File Transfer

1. Copy APK to phone (USB, email, cloud)
2. Open APK on phone
3. Allow "Install from unknown sources"
4. Install and open!

---

## 🔐 Test Biometric Authentication

1. Open FinMan app
2. Create account with password
3. Go to **Security Settings**
4. Enable **Biometric Authentication**
5. Lock app (🔒 button)
6. Unlock with fingerprint!

**Note:** Device must have:
- Fingerprint scanner OR face unlock
- Screen lock enabled
- Biometric enrolled in Settings

---

## 🏗️ Production Build (Release APK)

### Step 1: Generate Keystore

```powershell
# Navigate to project root
cd D:\Projects\Dev\financial\apps\finman\frontend

# Generate keystore (one-time only!)
keytool -genkey -v -keystore finman-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias finman

# Enter details:
# Password: [create strong password]
# Name: Your Name
# Organization: Your Company
# etc.
```

**⚠️ IMPORTANT:** Save keystore file and password! You'll need it for updates.

### Step 2: Configure Signing

Edit `android/app/build.gradle`:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            storeFile file('../../finman-release-key.jks')
            storePassword 'YOUR_KEYSTORE_PASSWORD'
            keyAlias 'finman'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build Release APK

```powershell
cd android

# Build release APK
.\gradlew assembleRelease

# APK location:
# app\build\outputs\apk\release\app-release.apk
```

### Step 4: Optimize and Align

```powershell
# Align APK for optimal loading
zipalign -v -p 4 app-release.apk app-release-aligned.apk

# Verify alignment
zipalign -c -v 4 app-release-aligned.apk
```

---

## 🌐 Connect to Your Server

### Local Development

```typescript
// capacitor.config.ts
server: {
  url: 'http://192.168.1.100:5173',  // Your local IP
  cleartext: true  // Allow HTTP for dev
}
```

Find your local IP:
```powershell
ipconfig | findstr IPv4
```

### Production Server

```typescript
// capacitor.config.ts
server: {
  url: 'https://finman.yourdomain.com',
  cleartext: false
}
```

### Offline Mode (No Server)

```typescript
// capacitor.config.ts - Comment out server block
// server: { ... }

// App will use local storage only
```

---

## 🎨 App Icons and Splash Screen

### Generate Icons

1. Create 1024x1024 PNG icon
2. Use: https://icon.kitchen/
3. Upload your icon
4. Download Android icon set
5. Extract to `android/app/src/main/res/`

### Custom Splash Screen

Edit `android/app/src/main/res/drawable/splash.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_image"/>
    </item>
</layer-list>
```

---

## 📦 Google Play Store Publishing

### Step 1: Prepare App Bundle

```powershell
cd android
.\gradlew bundleRelease

# Output: app\build\outputs\bundle\release\app-release.aab
```

### Step 2: Create Play Console Account

1. Go to: https://play.google.com/console
2. Pay $25 one-time fee
3. Create developer account

### Step 3: Upload App

1. **Create App** in Play Console
2. Fill out **Store Listing**:
   - Title: FinMan - Financial Manager
   - Short description
   - Full description
   - Screenshots (phone + tablet)
   - Icon (512x512)
   - Feature graphic (1024x500)

3. **Content Rating:**
   - Complete questionnaire
   - FinMan should be "Everyone"

4. **App Content:**
   - Privacy policy (required)
   - Data safety
   - Target audience

5. **Upload AAB:**
   - Production → Create release
   - Upload `app-release.aab`
   - Review and rollout

### Step 4: Wait for Review

- Review time: 1-7 days
- Check for issues
- Respond to Google feedback

---

## 🔄 Updating Your App

### Update Version

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2  // Increment by 1
        versionName "2.0.1"  // Update version
    }
}
```

### Build and Deploy

```powershell
# Rebuild web assets
npm run build

# Sync changes
npx cap sync android

# Build release
cd android
.\gradlew bundleRelease

# Upload new AAB to Play Console
```

---

## 🐛 Common Issues

### Build Errors

**Gradle sync failed:**
```powershell
cd android
.\gradlew clean
.\gradlew build
```

**Java version error:**
- Install JDK 17 exactly
- Set JAVA_HOME correctly

**SDK not found:**
- Install Android SDK via Android Studio
- Set ANDROID_HOME environment variable

### Runtime Issues

**White screen on startup:**
```typescript
// Check capacitor.config.ts webDir matches build output
webDir: 'dist'  // Must match Vite output directory
```

**API calls fail:**
- Check server URL in capacitor.config.ts
- Verify CORS settings on server
- Check server is accessible from phone

**Biometric not working:**
- Device must have biometric enrolled
- Screen lock must be enabled
- Request biometric permission in manifest

### Permission Issues

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

---

## 📊 Build Checklist

Before releasing:

- [ ] Update version number
- [ ] Test biometric authentication
- [ ] Test server connection
- [ ] Test offline functionality
- [ ] Check all features work
- [ ] Test on multiple devices
- [ ] Optimize images/assets
- [ ] Enable ProGuard (minification)
- [ ] Disable debugging
- [ ] Sign with release keystore
- [ ] Test release APK thoroughly
- [ ] Prepare Play Store assets
- [ ] Write privacy policy

---

## 🎓 Development Workflow

### Daily Development

```powershell
# Start dev server
npm run dev

# In new terminal:
npx cap run android --livereload --external

# App updates automatically as you code!
```

### Testing on Device

```powershell
# Quick sync after changes
npx cap sync android

# Rebuild and install
npx cap run android
```

### View Logs

```powershell
# Android logcat
adb logcat | findstr "Capacitor|Console"

# Or in Android Studio:
# View → Tool Windows → Logcat
```

---

## 💡 Pro Tips

### Faster Builds

```gradle
// android/gradle.properties
org.gradle.jvmargs=-Xmx4096m
org.gradle.parallel=true
org.gradle.caching=true
```

### Better Performance

```typescript
// Preload critical data
useEffect(() => {
  // Load data on app start
  loadTransactions();
  loadBudgets();
}, []);
```

### Secure Storage

```typescript
// Use biometric-protected storage for sensitive data
if (await isBiometricAvailable()) {
  await saveBiometricCredentials(username, password);
}
```

---

## 📱 Testing Devices

Recommended test devices:
- ✅ Your personal phone (primary testing)
- ✅ Android emulator (various versions)
- ✅ Friend's/family phone (different brand)
- ✅ Tablet (if supporting tablets)

Test on:
- Android 8.0 (minimum)
- Android 14.0 (latest)
- Different screen sizes
- Different manufacturers (Samsung, Xiaomi, OnePlus, etc.)

---

## 🎉 Next Steps

1. ✅ Build APK and test on your phone
2. ✅ Setup your Ubuntu server
3. ✅ Connect app to server
4. ✅ Test biometric authentication
5. ✅ Share APK with friends/family
6. 🚀 Publish to Play Store (optional)

---

## 📞 Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Studio: https://developer.android.com/studio
- Play Console: https://play.google.com/console
- Icon Generator: https://icon.kitchen/

---

**🎊 Your FinMan Android app is ready to build!**

Start with:
```powershell
cd apps/finman/frontend
npm run build
npx cap sync android
npx cap open android
```

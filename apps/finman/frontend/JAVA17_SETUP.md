# Java 17 Setup Guide

## Installation Steps

### 1. Download JDK 17
- URL: https://adoptium.net/temurin/releases/?version=17
- Select: **Windows x64**
- Package Type: **JDK**
- Version: **17 - LTS**
- Download the `.msi` installer

### 2. Install JDK 17
1. Run the downloaded `.msi` file
2. Follow the installation wizard
3. **Important:** Note the installation path (default: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`)
4. Optional but recommended: Check "Set JAVA_HOME variable" during installation

### 3. Configure Gradle to Use JDK 17

#### Option A: Set in gradle.properties (Recommended for this project)
1. Open: `apps/finman/frontend/android/gradle.properties`
2. Find the commented line starting with `# org.gradle.java.home=`
3. Uncomment it and update the path:
   ```properties
   org.gradle.java.home=C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.13.11-hotspot
   ```
   ⚠️ **Important:** Use double backslashes (`\\`) in the path!

#### Option B: Set JAVA_HOME Environment Variable (System-wide)
1. Press `Win + X` → System
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System Variables", click "New"
5. Variable name: `JAVA_HOME`
6. Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot` (use your actual path)
7. Click OK
8. Restart PowerShell/Terminal

### 4. Verify Installation

Run in PowerShell:
```powershell
cd D:\Projects\Dev\financial\apps\finman\frontend\android
.\gradlew --version
```

You should see:
```
Launcher JVM:  17.x.x (Eclipse Adoptium 17.x.x+x)
Daemon JVM:    C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot
```

### 5. Build APK

Once Java 17 is configured:

**Debug APK (for testing):**
```powershell
cd D:\Projects\Dev\financial\apps\finman\frontend\android
.\gradlew assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`

**Release APK (for distribution):**
```powershell
.\gradlew assembleRelease
```
Output: `app/build/outputs/apk/release/app-release-unsigned.apk`

### 6. Install APK on Device

**Via USB:**
```powershell
# List connected devices
adb devices

# Install APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Via File Transfer:**
- Copy the APK to your phone
- Open it and allow installation from unknown sources

## Troubleshooting

### Error: "Android Gradle plugin requires Java 17"
- Solution: Make sure `gradle.properties` has the correct JDK 17 path
- Verify the path exists and uses double backslashes

### Error: "JAVA_HOME is not set"
- Solution: Either set in `gradle.properties` OR set system environment variable
- Restart terminal after setting environment variables

### Gradle Daemon Issues
```powershell
# Stop all Gradle daemons
.\gradlew --stop

# Try build again
.\gradlew assembleDebug
```

### Build Cache Issues
```powershell
# Clean build
.\gradlew clean
.\gradlew assembleDebug
```

## What Changed

### Files Updated for Java 17:

1. **android/build.gradle**
   - Android Gradle Plugin: `8.7.2` (latest, requires Java 17)

2. **android/gradle.properties**
   - Increased heap size: `org.gradle.jvmargs=-Xmx2048m`
   - Added Java 17 path configuration (commented, ready to uncomment)

## Next Steps After Installation

1. ✅ Install JDK 17 (you're doing this now)
2. ⏳ Update `gradle.properties` with your JDK 17 path
3. ⏳ Verify with `.\gradlew --version`
4. ⏳ Build debug APK with `.\gradlew assembleDebug`
5. ⏳ Test on device or emulator

## Quick Reference

**JDK 17 Download:** https://adoptium.net/temurin/releases/?version=17

**Default Installation Paths:**
- Eclipse Adoptium: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`
- Oracle JDK: `C:\Program Files\Java\jdk-17`
- Amazon Corretto: `C:\Program Files\Amazon Corretto\jdk17.x.x_x`

**Build Commands:**
```powershell
cd D:\Projects\Dev\financial\apps\finman\frontend\android

# Debug build
.\gradlew assembleDebug

# Release build  
.\gradlew assembleRelease

# Clean build
.\gradlew clean

# Check Gradle version
.\gradlew --version
```

**APK Locations:**
- Debug: `app/build/outputs/apk/debug/app-debug.apk`
- Release: `app/build/outputs/apk/release/app-release-unsigned.apk`

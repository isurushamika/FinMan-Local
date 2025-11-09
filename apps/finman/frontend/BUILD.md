# Building FinMan Desktop App

## Quick Build

Run the build script from the frontend directory:

```powershell
cd apps\finman\frontend
.\build-exe.ps1 -Platform win
```

This will create a timestamped build in: `release/v{version}-{timestamp}/`

## Build Output

Each build creates:
- **win-unpacked/** - Portable executable (no installer needed)
  - `FinMan.exe` - Main application (~201 MB)
- **FinMan Setup {version}.exe** - Windows installer (~98 MB)

## Build for Other Platforms

```powershell
# macOS
.\build-exe.ps1 -Platform mac

# Linux
.\build-exe.ps1 -Platform linux
```

## Manual Build (Advanced)

If you prefer to build manually:

```powershell
# 1. Build frontend
npm run build

# 2. Package with electron-builder
npx electron-builder --win

# Output will be in: release/win-unpacked/
```

## Build Organization

Builds are organized by version and timestamp:
```
release/
├── v1.0.0-20251109-114936/
│   ├── win-unpacked/
│   │   └── FinMan.exe
│   └── FinMan Setup 1.0.0.exe
├── v1.0.0-20251109-120000/
│   └── ...
```

This allows you to:
- Keep multiple builds side-by-side
- Easily compare different versions
- Roll back if needed
- Track build history

## Version Management

Update version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

The build script automatically uses this version in the folder name.

## Portable vs Installer

**Portable (win-unpacked/FinMan.exe):**
- No installation required
- Can run from USB drive
- Data stored next to executable
- Perfect for testing

**Installer (FinMan Setup.exe):**
- Professional installation experience
- Start menu shortcuts
- Desktop icon
- Proper uninstaller

## Clean Builds

The build script automatically cleans old builds in temp folders. To manually clean:

```powershell
Remove-Item -Recurse -Force dist, build-*
```

Release folder builds are preserved for version history.

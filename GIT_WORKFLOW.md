# Git Workflow Guide for FinMan

## 📊 Repository Information

- **Repository**: https://github.com/isurushamika/FinMan
- **Current Branch**: `main`
- **Last Commit**: 0c6dcf5 - "feat: Add sync indicator and web deployment configuration"

---

## 🚀 Quick Git Commands

### Check Status
```bash
git status
```

### View Changes
```bash
# See what changed
git diff

# See staged changes
git diff --staged
```

### Add Changes
```bash
# Add all changes
git add .

# Add specific file
git add path/to/file

# Add specific folder
git add apps/finman/frontend/
```

### Commit Changes
```bash
# Commit with message
git commit -m "your message here"

# Commit with detailed message
git commit -m "feat: Add new feature" -m "Detailed description of what changed"
```

### Push to GitHub
```bash
# Push to main branch
git push origin main

# Force push (use with caution!)
git push -f origin main
```

### Pull Latest Changes
```bash
# Pull from GitHub
git pull origin main
```

---

## 📝 Commit Message Convention

Use this format for better organization:

```
<type>: <subject>

<body (optional)>
```

### Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Examples:
```bash
git commit -m "feat: Add user authentication"
git commit -m "fix: Resolve sync indicator not updating"
git commit -m "docs: Update deployment guide"
git commit -m "refactor: Optimize database queries"
```

---

## 🔄 Common Workflows

### Daily Development Workflow

```bash
# 1. Start your day - pull latest
git pull origin main

# 2. Make your changes
# ... code, code, code ...

# 3. Check what changed
git status
git diff

# 4. Stage your changes
git add .

# 5. Commit with message
git commit -m "feat: Add new transaction filter"

# 6. Push to GitHub
git push origin main
```

### Before Deploying

```bash
# 1. Ensure everything is committed
git status

# 2. View recent commits
git log --oneline -5

# 3. Create a tag for this version
git tag -a v1.0.0 -m "Version 1.0.0 - Production Release"

# 4. Push with tags
git push origin main --tags
```

### After Making Deployment Changes

```bash
# Example: After updating frontend
git add apps/finman/frontend/
git commit -m "feat: Update frontend UI components"
git push origin main

# Example: After backend changes
git add apps/finman/backend/
git commit -m "fix: Resolve API authentication issue"
git push origin main
```

---

## 🌿 Branching Strategy

### Create a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push branch to GitHub
git push origin feature/new-feature

# Switch back to main
git checkout main

# Merge feature branch
git merge feature/new-feature

# Push merged changes
git push origin main

# Delete feature branch (optional)
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### Example Feature Branches

```bash
# New feature
git checkout -b feature/offline-sync

# Bug fix
git checkout -b fix/transaction-validation

# Documentation
git checkout -b docs/api-guide

# Refactoring
git checkout -b refactor/database-layer
```

---

## 🔍 Viewing History

### Recent Commits
```bash
# Last 5 commits
git log --oneline -5

# Pretty format
git log --graph --oneline --all --decorate -10

# See changes in each commit
git log -p -2
```

### View Specific File History
```bash
# See all changes to a file
git log -- apps/finman/frontend/src/App.tsx

# See changes with diff
git log -p -- apps/finman/frontend/src/App.tsx
```

---

## ↩️ Undoing Changes

### Undo Unstaged Changes
```bash
# Undo changes to a file
git restore apps/finman/frontend/src/App.tsx

# Undo all unstaged changes
git restore .
```

### Undo Staged Changes
```bash
# Unstage a file
git restore --staged apps/finman/frontend/src/App.tsx

# Unstage all
git restore --staged .
```

### Undo Last Commit (Keep Changes)
```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and unstage changes
git reset HEAD~1

# Undo commit and discard changes (CAREFUL!)
git reset --hard HEAD~1
```

### Revert a Pushed Commit
```bash
# Create a new commit that undoes a previous commit
git revert <commit-hash>
git push origin main
```

---

## 🏷️ Tagging Releases

### Create Version Tags
```bash
# Create annotated tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"

# Create tag for specific commit
git tag -a v1.0.1 <commit-hash> -m "Version 1.0.1 - Bug fixes"

# Push tags to GitHub
git push origin --tags

# Push single tag
git push origin v1.0.0
```

### List Tags
```bash
# List all tags
git tag

# Show tag details
git show v1.0.0
```

### Delete Tags
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin --delete v1.0.0
```

---

## 🔧 Configuration

### Set Your Identity
```bash
# Set name
git config --global user.name "Your Name"

# Set email
git config --global user.email "your.email@example.com"

# View config
git config --list
```

### Useful Aliases
```bash
# Short status
git config --global alias.st status

# Short log
git config --global alias.lg "log --oneline --graph --all --decorate"

# Last commit
git config --global alias.last "log -1 HEAD"

# Now you can use:
git st
git lg
git last
```

---

## 📦 .gitignore Best Practices

Your current `.gitignore` excludes:
- ✅ `node_modules/` - Dependencies
- ✅ `dist/` `build/` - Build outputs
- ✅ `.env` - Environment variables
- ✅ `*.log` - Log files
- ✅ `uploads/**/*` - Uploaded files
- ✅ `*.apk` `*.aab` - Android builds
- ✅ `android/build/` - Android build artifacts
- ✅ `.vscode/*` - Editor settings

**Never commit:**
- 🚫 Passwords or API keys
- 🚫 node_modules
- 🚫 Build artifacts
- 🚫 .env files
- 🚫 Large binary files (APKs, videos)
- 🚫 User uploads

---

## 🚨 Emergency Recovery

### Lost Changes?
```bash
# See all actions (reflog)
git reflog

# Restore from reflog
git reset --hard HEAD@{1}
```

### Accidentally Committed Secrets?

```bash
# Remove file from last commit
git rm --cached .env
git commit --amend -m "Remove .env file"

# Force push (if already pushed)
git push -f origin main

# ⚠️ THEN IMMEDIATELY:
# - Rotate all secrets/passwords
# - Update .env with new credentials
```

### Merge Conflicts

```bash
# When you see merge conflicts:
git status  # Shows conflicted files

# Edit conflicted files, look for:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> branch-name

# After resolving:
git add .
git commit -m "Resolve merge conflicts"
```

---

## 📊 Current Repository Structure

```
FinMan/
├── apps/
│   └── finman/
│       ├── backend/          # Node.js API
│       └── frontend/         # React + Capacitor
├── deployment/
│   ├── nginx/                # Nginx configs
│   ├── deploy-frontend.sh    # Linux deploy script
│   └── deploy-frontend.bat   # Windows deploy script
├── .gitignore                # Ignored files
├── FRONTEND_WEB_DEPLOYMENT.md
├── QUICK_DEPLOY.md
└── test-backend-api.ps1
```

---

## 🔗 Useful GitHub Links

- **Repository**: https://github.com/isurushamika/FinMan
- **Commits**: https://github.com/isurushamika/FinMan/commits/main
- **Issues**: https://github.com/isurushamika/FinMan/issues
- **Releases**: https://github.com/isurushamika/FinMan/releases

---

## 📱 Recommended Workflow for FinMan

### For Backend Changes:
```bash
# 1. Make changes to backend
# 2. Test locally
npm test

# 3. Commit
git add apps/finman/backend/
git commit -m "fix: Resolve authentication bug"

# 4. Push
git push origin main

# 5. Deploy to VPS
ssh root@198.23.228.126
cd ~/FinMan
git pull origin main
cd apps/finman/backend
npm install
pm2 restart finman-api
```

### For Frontend Changes:
```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Commit
git add apps/finman/frontend/
git commit -m "feat: Add new dashboard widget"

# 4. Push
git push origin main

# 5. Build and deploy
npm run build
# Deploy via script or manual upload
```

### For Android App:
```bash
# 1. Update frontend
# 2. Commit changes
git add .
git commit -m "feat: Update Android app UI"
git push origin main

# 3. Build APK
cd apps/finman/frontend
npm run build
npx cap sync
cd android
.\gradlew assembleDebug

# 4. APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## ✅ Best Practices

1. **Commit Often** - Small, focused commits are better than large ones
2. **Write Good Messages** - Explain *why*, not just *what*
3. **Pull Before Push** - Always pull latest before starting work
4. **Test Before Commit** - Make sure code works
5. **Don't Commit Secrets** - Use .env and .gitignore
6. **Tag Releases** - Version your deployments
7. **Use Branches** - For experimental features
8. **Review Before Push** - Use `git diff` and `git status`

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Check status | `git status` |
| Stage all | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| Pull | `git pull origin main` |
| View log | `git log --oneline -10` |
| Undo changes | `git restore .` |
| Create branch | `git checkout -b branch-name` |
| Switch branch | `git checkout main` |
| Tag version | `git tag -a v1.0.0 -m "Release"` |

---

**Your code is now safely backed up on GitHub! 🎉**

Repository: https://github.com/isurushamika/FinMan

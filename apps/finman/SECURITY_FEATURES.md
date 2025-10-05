# Data Security Features

## Overview
FinMan now includes comprehensive security features to protect your financial data with password protection, encryption, and auto-lock capabilities.

## Security Features

### 1. **Password Protection**
- **Secure Password Hashing**: Uses PBKDF2 with 100,000 iterations and SHA-256
- **Strong Password Requirements**:
  - Minimum 8 characters
  - Mix of uppercase and lowercase letters
  - Numbers
  - Special characters
- **Password Strength Indicator**: Real-time feedback on password security
- **No Password Recovery**: For maximum security, passwords cannot be recovered (reset means data loss)

### 2. **Data Encryption**
- **Algorithm**: AES-256-GCM (Advanced Encryption Standard)
- **Key Derivation**: PBKDF2 with user password
- **Sensitive Data**: All financial data can be encrypted
- **Toggle Option**: Enable/disable encryption in settings
- **Web Crypto API**: Uses browser's built-in cryptographic functions

### 3. **Auto-Lock**
- **Inactivity Detection**: Monitors user activity
- **Configurable Timeout**: 1, 5, 10, 15, 30 minutes, or 1 hour
- **Automatic Logout**: Locks app after specified inactive period
- **Quick Access**: Easy unlock with saved password

### 4. **Session Management**
- **Session Tokens**: Secure session tracking
- **24-Hour Expiry**: Sessions automatically expire
- **Activity Tracking**: Monitors last activity timestamp
- **Secure Storage**: Session data stored securely

### 5. **Biometric Authentication** (Coming Soon)
- **Fingerprint**: Touch ID/Fingerprint sensor support
- **Face Recognition**: Face ID support
- **Web Authentication API**: Standards-compliant implementation
- **Fallback**: Password always available as backup

## How It Works

### First-Time Setup
1. Open FinMan for the first time
2. Create a secure password (min 8 characters)
3. Optionally set a display name
4. Password is hashed and stored securely
5. Salt generated for encryption
6. Auto-lock enabled by default (5 minutes)

### Login Flow
1. Enter your password
2. Password is verified against stored hash
3. Session created with 24-hour expiry
4. Last login time updated
5. Access granted to financial data

### Auto-Lock Flow
1. User activity monitored continuously
2. Timer resets on any interaction
3. After timeout period elapses:
   - App locks automatically
   - Session remains valid
   - Password required to unlock
4. Re-enter password to unlock

### Password Change
1. Navigate to Security Settings
2. Click "Change Password"
3. Enter current password
4. Enter new password (must meet requirements)
5. Confirm new password
6. New salt generated
7. New hash stored securely

## Technical Implementation

### Encryption Process
```typescript
1. User enters password
2. Salt generated (16 bytes random)
3. Key derived using PBKDF2:
   - Password + Salt
   - 100,000 iterations
   - SHA-256 hash
   - 256-bit key
4. Data encrypted with AES-256-GCM:
   - IV (Initialization Vector) generated (12 bytes)
   - Data encrypted with key + IV
   - IV prepended to ciphertext
5. Result stored as Base64
```

### Password Hashing
```typescript
1. User enters password
2. Salt generated/retrieved
3. PBKDF2 derivation:
   - Password + Salt
   - 100,000 iterations
   - SHA-256 hash
   - 256-bit output
4. Hash stored as Base64
5. Original password never stored
```

### Decryption Process
```typescript
1. User enters password
2. Retrieve salt from storage
3. Derive key using same process
4. Extract IV from ciphertext
5. Decrypt with key + IV
6. Return original data
```

## Security Settings

### Available Options

#### **Data Encryption**
- **Default**: Enabled
- **Description**: Encrypts all financial data
- **Impact**: Slightly slower load times, maximum security
- **Recommendation**: Keep enabled

#### **Auto-Lock**
- **Default**: Enabled (5 minutes)
- **Options**: 1, 5, 10, 15, 30 minutes, or 1 hour
- **Impact**: App locks after inactivity
- **Recommendation**: 5-15 minutes for balance of security/convenience

#### **Require Password on Startup**
- **Default**: Enabled
- **Description**: Always require password when opening app
- **Impact**: Password needed every time
- **Recommendation**: Enable for shared devices

#### **Biometric Authentication** (Coming Soon)
- **Default**: Disabled (not yet available)
- **Description**: Use fingerprint/face recognition
- **Impact**: Faster login
- **Recommendation**: Enable when available

## Data Storage

### What is Stored
- **User Profile**: Username, password hash, salt, creation date
- **Security Settings**: Auto-lock timeout, encryption preferences
- **Session Data**: Session token, expiry time
- **Auth State**: Login status, last activity

### Where Data is Stored
- **Browser localStorage**: All data stored locally
- **No Cloud Storage**: Nothing sent to external servers
- **Client-Side Only**: Complete privacy

### Storage Keys
```
financial_user          - User profile and credentials
financial_auth_state    - Authentication state
financial_session       - Session token
financial_transactions  - Financial data (potentially encrypted)
financial_budgets       - Budget data (potentially encrypted)
financial_recurring     - Recurring data (potentially encrypted)
financial_items         - Item tracking data
financial_purchases     - Purchase history
```

## Security Best Practices

### For Users
1. **Use a Strong Password**: Mix of characters, numbers, symbols
2. **Don't Share Password**: Never share with anyone
3. **Enable Auto-Lock**: Protect against unauthorized access
4. **Keep Encryption On**: Maximum data protection
5. **Regular Backups**: Export data regularly
6. **Remember Password**: No recovery option available

### For Developers
1. **Never Log Passwords**: Don't console.log sensitive data
2. **Use Web Crypto API**: Native browser encryption
3. **Constant-Time Comparison**: Prevent timing attacks
4. **Secure Random**: Use crypto.getRandomValues()
5. **HTTPS Only**: Ensure secure connection
6. **CSP Headers**: Content Security Policy

## Encryption Algorithms

### AES-256-GCM
- **Type**: Symmetric encryption
- **Key Size**: 256 bits
- **Mode**: Galois/Counter Mode
- **Authentication**: Built-in authentication
- **IV Size**: 12 bytes
- **Performance**: Hardware-accelerated in modern browsers

### PBKDF2
- **Type**: Key derivation function
- **Hash**: SHA-256
- **Iterations**: 100,000
- **Salt Size**: 16 bytes
- **Output**: 256 bits
- **Purpose**: Password hashing and key derivation

## Browser Compatibility

### Requirements
- **Web Crypto API**: Required (available in all modern browsers)
- **localStorage**: Required
- **ES6+**: Modern JavaScript features

### Supported Browsers
- ✅ Chrome 60+
- ✅ Firefox 57+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Opera 47+

### Not Supported
- ❌ Internet Explorer (any version)
- ❌ Very old browsers without Web Crypto API

## Security Considerations

### What This Protects Against
- ✅ Unauthorized access to your device
- ✅ Data theft if device is lost/stolen
- ✅ Casual browsing of financial data
- ✅ Data leaks from localStorage

### What This Does NOT Protect Against
- ❌ Malware on your device
- ❌ Keyloggers
- ❌ Physical access with your password
- ❌ Browser vulnerabilities
- ❌ XSS attacks (mitigated by CSP)

## Password Recovery

### Important Notice
**There is NO password recovery option.**

This is by design for maximum security:
- No "forgot password" link
- No email recovery
- No security questions
- No backdoor access

**If you forget your password:**
1. You will lose access to all data
2. Only option is to reset the app
3. All data will be permanently lost
4. You'll need to start fresh

**Recommendation**: Write down your password and store it in a secure physical location.

## Future Enhancements

### Planned Features
1. **Biometric Authentication**
   - Fingerprint (Touch ID, Windows Hello)
   - Face Recognition (Face ID)
   - Web Authentication API (WebAuthn)

2. **Multi-Factor Authentication**
   - TOTP (Time-based One-Time Password)
   - Backup codes
   - Email verification (optional)

3. **Advanced Encryption**
   - Per-transaction encryption
   - Encrypted backups
   - Secure export with password

4. **Security Audit Log**
   - Login attempts
   - Settings changes
   - Data exports
   - Failed authentication

5. **Secure Sharing**
   - Encrypted data sharing
   - Temporary access codes
   - Read-only sharing

## Migration from Unencrypted Data

If you have existing data before security was enabled:
1. Data will be migrated automatically
2. Encryption can be toggled in settings
3. Existing data encrypted on first login
4. No data loss during migration

## Testing

### Security Testing Checklist
- [ ] Password hashing works correctly
- [ ] Encryption/decryption successful
- [ ] Auto-lock triggers after timeout
- [ ] Session expires after 24 hours
- [ ] Password change updates encryption
- [ ] Settings persist correctly
- [ ] No password logged to console
- [ ] Salt is unique per user

## Troubleshooting

### "Web Crypto API not available"
- **Solution**: Use a modern browser (Chrome, Firefox, Safari, Edge)
- **Note**: HTTPS required in production

### "Failed to decrypt data"
- **Cause**: Wrong password or corrupted data
- **Solution**: Verify password, check browser console

### "Auto-lock not working"
- **Cause**: Setting disabled or browser tab inactive
- **Solution**: Enable in settings, keep tab active

### App won't unlock
- **Cause**: Wrong password
- **Solution**: Enter correct password or reset app (loses data)

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: October 4, 2025  
**Security Level**: High (AES-256, PBKDF2, Client-side)

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Fingerprint } from 'lucide-react';
import { hashPassword, generateSalt, verifyPassword, validatePasswordStrength, isCryptoAvailable } from '../utils/encryption';
import { createUser, saveUser, loadUser, updateLastLogin } from '../utils/auth';
import { 
  isNativeApp, 
  isBiometricAvailable, 
  getBiometricType,
  saveBiometricCredentials,
  authenticateWithBiometrics 
} from '../utils/biometric';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  const existingUser = loadUser();
  const isFirstTimeSetup = !existingUser;

  const passwordStrength = isFirstTimeSetup ? validatePasswordStrength(password) : null;

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometric = async () => {
      if (isNativeApp()) {
        const available = await isBiometricAvailable();
        setBiometricAvailable(available);
        if (available) {
          const type = await getBiometricType();
          setBiometricType(type);
        }
      }
    };
    checkBiometric();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isCryptoAvailable()) {
        throw new Error('Web Crypto API is not available in your browser');
      }

      if (isFirstTimeSetup) {
        // Registration
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (!passwordStrength?.isValid) {
          throw new Error('Password does not meet security requirements');
        }

        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        const user = createUser(username || 'User', passwordHash, salt);
        saveUser(user);
        
        // Save credentials for biometric auth if available
        if (isNativeApp() && biometricAvailable && user.securitySettings.biometricEnabled) {
          try {
            await saveBiometricCredentials(user.username, password);
          } catch (err) {
            console.error('Failed to save biometric credentials:', err);
          }
        }
        
        updateLastLogin();
        onAuthenticated();
      } else {
        // Login
        if (!existingUser) {
          throw new Error('No user found. Please set up your account first.');
        }

        const isValid = await verifyPassword(password, existingUser.salt, existingUser.passwordHash);
        
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        updateLastLogin();
        onAuthenticated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!isNativeApp()) {
      setError('Biometric authentication is only available in the mobile app');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const credentials = await authenticateWithBiometrics();
      
      if (!credentials) {
        throw new Error('Biometric authentication failed');
      }

      if (!existingUser) {
        throw new Error('No user found. Please set up your account first.');
      }

      // Verify the stored password
      const isValid = await verifyPassword(
        credentials.password, 
        existingUser.salt, 
        existingUser.passwordHash
      );
      
      if (!isValid) {
        throw new Error('Authentication failed');
      }

      updateLastLogin();
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isFirstTimeSetup ? 'Welcome to FinMan' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isFirstTimeSetup
              ? 'Set up your secure password to protect your financial data'
              : 'Enter your password to access your financial data'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username (for registration) */}
            {isFirstTimeSetup && (
              <div>
                <label className="label">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="Your name"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="label">
                <Lock className="inline w-4 h-4 mr-1" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (for registration) */}
            {isFirstTimeSetup && (
              <div>
                <label className="label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            {/* Password Strength Indicator */}
            {isFirstTimeSetup && password && passwordStrength && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength.strength === 'weak'
                          ? 'bg-red-500 w-1/3'
                          : passwordStrength.strength === 'medium'
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      passwordStrength.strength === 'weak'
                        ? 'text-red-600 dark:text-red-400'
                        : passwordStrength.strength === 'medium'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                  </span>
                </div>
                {passwordStrength.messages.length > 0 && (
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    {passwordStrength.messages.map((msg, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Security Features Notice (for registration) */}
            {isFirstTimeSetup && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Your data will be protected with:
                  </h4>
                </div>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-7">
                  <li>• AES-256 encryption for sensitive data</li>
                  <li>• PBKDF2 password hashing (100,000 iterations)</li>
                  <li>• Auto-lock after 5 minutes of inactivity</li>
                  <li>• Secure local storage</li>
                </ul>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isFirstTimeSetup ? (
                'Create Secure Account'
              ) : (
                'Unlock'
              )}
            </button>

            {/* Biometric Login (for existing users) */}
            {!isFirstTimeSetup && biometricAvailable && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-5 h-5" />
                Use {biometricType}
              </button>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {isFirstTimeSetup ? (
                <>
                  Your password is stored securely and encrypted.
                  <br />
                  Make sure to remember it - there is no password recovery.
                </>
              ) : (
                <>
                  Forgot your password?{' '}
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        'Password recovery is not available for security reasons. If you forgot your password, you will need to reset the app and lose all data.'
                      )
                    }
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Learn more
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <Lock className="inline w-3 h-3 mr-1" />
            End-to-end encrypted • No data leaves your device
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

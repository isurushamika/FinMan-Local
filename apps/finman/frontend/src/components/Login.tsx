import React, { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, AlertCircle, Server, Fingerprint } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../api/config';
import { 
  isBiometricAvailable, 
  getBiometricType, 
  authenticateWithBiometrics,
  saveBiometricCredentials,
  isNativeApp 
} from '../utils/biometric';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  // Check if biometric is available on mount
  useEffect(() => {
    const checkBiometric = async () => {
      if (isNativeApp()) {
        const available = await isBiometricAvailable();
        setBiometricAvailable(available);
        if (available) {
          const type = await getBiometricType();
          setBiometricType(type);
          // Optionally auto-trigger biometric auth on load
          // await handleBiometricLogin();
        }
      }
    };
    checkBiometric();
  }, []);

  const handleBiometricLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const credentials = await authenticateWithBiometrics();
      
      if (credentials) {
        await login(credentials.username, credentials.password);
      } else {
        setError('Biometric authentication failed or cancelled');
      }
    } catch (err: any) {
      console.error('Biometric login error:', err);
      setError('Biometric login failed. Please use email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      
      // After successful login, save credentials for biometric auth if available
      if (isNativeApp() && biometricAvailable) {
        try {
          await saveBiometricCredentials(email, password);
        } catch (err) {
          console.error('Failed to save biometric credentials:', err);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.message || err.error || 'Login failed. Please check your credentials and internet connection.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-green-600 p-3 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-white">Welcome Back</h1>
        <p className="text-gray-400 text-center mb-8">Sign in to continue to FinMan</p>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* API Status */}
        <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 mb-6 flex items-center text-xs">
          <Server className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-gray-300">API: {API_CONFIG.baseURL}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Biometric Login Button */}
          {biometricAvailable && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 dark:bg-gray-900 text-gray-400">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isLoading}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-5 h-5" />
                Sign in with {biometricType}
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-green-400 font-semibold hover:text-green-300"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

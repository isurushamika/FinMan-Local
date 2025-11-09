// Biometric Authentication Utility - Desktop Stub
// Note: Biometric authentication is not available on desktop
// This is a stub implementation for compatibility

/**
 * Check if biometric authentication is available on the device
 * Returns false on desktop platforms
 */
export async function isBiometricAvailable(): Promise<boolean> {
  // Biometric not supported on desktop Electron
  return false;
}

/**
 * Get the type of biometric authentication available
 * Returns 'Not Available' on desktop platforms
 */
export async function getBiometricType(): Promise<string> {
  return 'Not Available';
}

/**
 * Save credentials for biometric authentication
 * Not supported on desktop
 */
export async function saveBiometricCredentials(
  _username: string,
  _password: string
): Promise<void> {
  // Biometric not supported on desktop
  console.warn('Biometric authentication not available on desktop');
}

/**
 * Get credentials using biometric authentication
 * Not supported on desktop
 */
export async function getBiometricCredentials(): Promise<{
  username: string;
  password: string;
} | null> {
  // Biometric not supported on desktop
  return null;
}

/**
 * Delete saved biometric credentials
 * Not supported on desktop
 */
export async function deleteBiometricCredentials(): Promise<void> {
  // Biometric not supported on desktop
}

/**
 * Verify user identity using biometric authentication
 * Not supported on desktop
 */
export async function verifyBiometric(_reason?: string): Promise<boolean> {
  // Biometric not supported on desktop
  return false;
}

/**
 * Check if device is running on Capacitor (native app)
 */
export function isNativeApp(): boolean {
  return typeof (window as any).Capacitor !== 'undefined';
}

/**
 * Authenticate with biometrics and retrieve credentials
 * This combines verification and credential retrieval
 */
export async function authenticateWithBiometrics(): Promise<{
  username: string;
  password: string;
} | null> {
  try {
    // First verify the user's identity
    const verified = await verifyBiometric('Unlock FinMan');
    
    if (!verified) {
      return null;
    }
    
    // Then retrieve the credentials
    return await getBiometricCredentials();
  } catch (error) {
    console.error('Biometric authentication failed:', error);
    return null;
  }
}

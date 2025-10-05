// Biometric Authentication Utility for Capacitor
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';

/**
 * Check if biometric authentication is available on the device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch (error) {
    console.error('Biometric availability check failed:', error);
    return false;
  }
}

/**
 * Get the type of biometric authentication available
 */
export async function getBiometricType(): Promise<string> {
  try {
    const result = await NativeBiometric.isAvailable();
    
    switch (result.biometryType) {
      case BiometryType.FACE_ID:
        return 'Face ID';
      case BiometryType.TOUCH_ID:
        return 'Touch ID';
      case BiometryType.FINGERPRINT:
        return 'Fingerprint';
      case BiometryType.FACE_AUTHENTICATION:
        return 'Face Authentication';
      case BiometryType.IRIS_AUTHENTICATION:
        return 'Iris Authentication';
      default:
        return 'Biometric';
    }
  } catch (error) {
    console.error('Biometric type check failed:', error);
    return 'Biometric';
  }
}

/**
 * Save credentials for biometric authentication
 */
export async function saveBiometricCredentials(
  username: string,
  password: string
): Promise<void> {
  try {
    await NativeBiometric.setCredentials({
      username,
      password,
      server: 'finman.app'
    });
  } catch (error) {
    console.error('Failed to save biometric credentials:', error);
    throw new Error('Failed to save biometric credentials');
  }
}

/**
 * Get credentials using biometric authentication
 */
export async function getBiometricCredentials(): Promise<{
  username: string;
  password: string;
} | null> {
  try {
    const result = await NativeBiometric.getCredentials({
      server: 'finman.app'
    });
    
    return {
      username: result.username,
      password: result.password
    };
  } catch (error) {
    console.error('Failed to get biometric credentials:', error);
    return null;
  }
}

/**
 * Delete saved biometric credentials
 */
export async function deleteBiometricCredentials(): Promise<void> {
  try {
    await NativeBiometric.deleteCredentials({
      server: 'finman.app'
    });
  } catch (error) {
    console.error('Failed to delete biometric credentials:', error);
  }
}

/**
 * Verify user identity using biometric authentication
 */
export async function verifyBiometric(reason?: string): Promise<boolean> {
  try {
    const biometricType = await getBiometricType();
    
    await NativeBiometric.verifyIdentity({
      reason: reason || `Use ${biometricType} to unlock FinMan`,
      title: 'Biometric Authentication',
      subtitle: 'Secure login with biometrics',
      description: 'Place your finger on the sensor or look at the camera'
    });
    
    return true;
  } catch (error) {
    console.error('Biometric verification failed:', error);
    return false;
  }
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

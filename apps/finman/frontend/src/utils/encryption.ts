/**
 * Encryption utilities using Web Crypto API
 * Provides secure encryption/decryption for sensitive financial data
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

/**
 * Convert string to ArrayBuffer
 */
function stringToArrayBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert ArrayBuffer to string
 */
function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generate a random salt
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  return arrayBufferToBase64(salt);
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Derive a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: string): Promise<CryptoKey> {
  const passwordBuffer = stringToArrayBuffer(password);
  const saltBuffer = base64ToArrayBuffer(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const passwordBuffer = stringToArrayBuffer(password);
  const saltBuffer = base64ToArrayBuffer(salt);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer as BufferSource,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer as BufferSource,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  return arrayBufferToBase64(derivedBits);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  const computedHash = await hashPassword(password, salt);
  return computedHash === hash;
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, password: string, salt: string): Promise<string> {
  try {
    const key = await deriveKey(password, salt);
    const iv = generateIV();
    const dataBuffer = stringToArrayBuffer(data);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv as BufferSource,
      },
      key,
      dataBuffer as BufferSource
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return arrayBufferToBase64(combined);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  encryptedData: string,
  password: string,
  salt: string
): Promise<string> {
  try {
    const key = await deriveKey(password, salt);
    const combined = base64ToArrayBuffer(encryptedData);

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const data = combined.slice(IV_LENGTH);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );

    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - incorrect password or corrupted data');
  }
}

/**
 * Encrypt an object (e.g., transactions, budgets)
 */
export async function encryptObject<T>(
  obj: T,
  password: string,
  salt: string
): Promise<string> {
  const jsonString = JSON.stringify(obj);
  return encryptData(jsonString, password, salt);
}

/**
 * Decrypt an object
 */
export async function decryptObject<T>(
  encryptedData: string,
  password: string,
  salt: string
): Promise<T> {
  const jsonString = await decryptData(encryptedData, password, salt);
  return JSON.parse(jsonString);
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  messages: string[];
} {
  const messages: string[] = [];
  let score = 0;

  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    messages.push('Include lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    messages.push('Include uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    messages.push('Include numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    messages.push('Include special characters');
  }

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: password.length >= 8 && score >= 3,
    strength,
    messages,
  };
}

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * AES-256-GCM encryption service for credential storage.
 *
 * Uses Node.js built-in crypto module — no external dependencies.
 * Each encryption uses a random IV, ensuring different ciphertexts for the same plaintext.
 * Authenticated encryption provides both confidentiality and integrity.
 */
export class EncryptionService {
  private readonly key: Buffer;

  constructor(keyHex: string) {
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('Encryption key must be a 32-byte hex string (64 characters)');
    }
    this.key = Buffer.from(keyHex, 'hex');
  }

  /**
   * Encrypt plaintext string.
   * Returns base64-encoded string: iv (12 bytes) + authTag (16 bytes) + ciphertext
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Combine: iv + authTag + ciphertext
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
  }

  /**
   * Decrypt base64-encoded encrypted string.
   * Input format: iv (12 bytes) + authTag (16 bytes) + ciphertext
   */
  decrypt(encryptedData: string): string {
    const buf = Buffer.from(encryptedData, 'base64');

    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      throw new Error('Invalid encrypted data: too short');
    }

    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return decrypted.toString('utf8');
  }

  /**
   * Encrypt a JSON object.
   * Serializes to JSON string, then encrypts.
   */
  encryptObject(data: Record<string, unknown>): string {
    return this.encrypt(JSON.stringify(data));
  }

  /**
   * Decrypt to a JSON object.
   * Decrypts, then parses JSON string.
   */
  decryptObject<T = Record<string, unknown>>(encryptedData: string): T {
    const json = this.decrypt(encryptedData);
    return JSON.parse(json) as T;
  }
}

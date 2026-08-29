import { describe, it, expect } from 'vitest';
import * as crypto from 'crypto';
import { EncryptionService } from './encryption';

// Generate a test key
function generateTestKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    service = new EncryptionService(generateTestKey());
  });

  describe('constructor', () => {
    it('should accept a valid 64-character hex key', () => {
      const key = generateTestKey();
      expect(() => new EncryptionService(key)).not.toThrow();
    });

    it('should reject a key that is too short', () => {
      expect(() => new EncryptionService('abc123')).toThrow(
        'Encryption key must be a 32-byte hex string',
      );
    });

    it('should reject an empty key', () => {
      expect(() => new EncryptionService('')).toThrow(
        'Encryption key must be a 32-byte hex string',
      );
    });
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt correctly', () => {
      const plaintext = 'my-secret-api-key-12345';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for the same plaintext', () => {
      const plaintext = 'same-secret';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);
      // Different IVs mean different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should reject tampered ciphertext', () => {
      const plaintext = 'sensitive-data';
      const encrypted = service.encrypt(plaintext);

      // Tamper with the ciphertext
      const buf = Buffer.from(encrypted, 'base64');
      buf[buf.length - 1] ^= 0xff; // Flip last byte
      const tampered = buf.toString('base64');

      expect(() => service.decrypt(tampered)).toThrow();
    });

    it('should reject wrong key', () => {
      const plaintext = 'secret-data';
      const encrypted = service.encrypt(plaintext);

      const wrongService = new EncryptionService(generateTestKey());
      expect(() => wrongService.decrypt(encrypted)).toThrow();
    });

    it('should handle empty string', () => {
      const encrypted = service.encrypt('');
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle unicode strings', () => {
      const plaintext = '🔑 secret-key-日本語-test';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle long strings', () => {
      const plaintext = 'x'.repeat(10000);
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('encryptObject/decryptObject', () => {
    it('should encrypt and decrypt JSON objects', () => {
      const data = { apiKey: 'secret-123', token: 'bearer-abc' };
      const encrypted = service.encryptObject(data);
      const decrypted = service.decryptObject(encrypted);
      expect(decrypted).toEqual(data);
    });

    it('should handle nested objects', () => {
      const data = {
        oauth: {
          clientId: 'client-123',
          clientSecret: 'secret-456',
          tokens: { access: 'acc-789', refresh: 'ref-012' },
        },
      };
      const encrypted = service.encryptObject(data);
      const decrypted = service.decryptObject(encrypted);
      expect(decrypted).toEqual(data);
    });
  });
});

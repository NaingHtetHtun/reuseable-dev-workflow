import { describe, it, expect } from 'vitest';
import { PkceHelper } from './pkce-helper';

describe('PkceHelper', () => {
  describe('generateCodeVerifier', () => {
    it('should generate a string of the specified length', () => {
      const verifier = PkceHelper.generateCodeVerifier(64);
      expect(verifier).toHaveLength(64);
    });

    it('should generate a base64url-encoded string', () => {
      const verifier = PkceHelper.generateCodeVerifier();
      // Base64url characters: A-Z, a-z, 0-9, -, _
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate different verifiers on each call', () => {
      const v1 = PkceHelper.generateCodeVerifier();
      const v2 = PkceHelper.generateCodeVerifier();
      expect(v1).not.toBe(v2);
    });

    it('should generate verifiers between 43-128 characters', () => {
      for (let i = 0; i < 10; i++) {
        const verifier = PkceHelper.generateCodeVerifier();
        expect(verifier.length).toBeGreaterThanOrEqual(43);
        expect(verifier.length).toBeLessThanOrEqual(128);
      }
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate S256 challenge (SHA-256)', () => {
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const challenge = PkceHelper.generateCodeChallenge(verifier, 'S256');
      // SHA-256 produces 32 bytes = 43 base64url characters
      expect(challenge).toHaveLength(43);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate plain challenge (same as verifier)', () => {
      const verifier = 'some-random-verifier-string';
      const challenge = PkceHelper.generateCodeChallenge(verifier, 'plain');
      expect(challenge).toBe(verifier);
    });

    it('should default to S256 method', () => {
      const verifier = 'test-verifier';
      const challenge = PkceHelper.generateCodeChallenge(verifier);
      // Should be different from verifier (SHA-256, not plain)
      expect(challenge).not.toBe(verifier);
    });

    it('should be deterministic for same input', () => {
      const verifier = 'same-verifier';
      const c1 = PkceHelper.generateCodeChallenge(verifier, 'S256');
      const c2 = PkceHelper.generateCodeChallenge(verifier, 'S256');
      expect(c1).toBe(c2);
    });
  });

  describe('generate', () => {
    it('should return a complete PkceChallenge', () => {
      const challenge = PkceHelper.generate();
      expect(challenge).toHaveProperty('codeVerifier');
      expect(challenge).toHaveProperty('codeChallenge');
      expect(challenge).toHaveProperty('method');
      expect(challenge.method).toBe('S256');
    });

    it('should produce matching verifier and challenge', () => {
      const { codeVerifier, codeChallenge } = PkceHelper.generate();
      // Challenge should be SHA-256 of verifier
      const expectedChallenge = PkceHelper.generateCodeChallenge(codeVerifier, 'S256');
      expect(codeChallenge).toBe(expectedChallenge);
    });

    it('should generate unique pairs', () => {
      const p1 = PkceHelper.generate();
      const p2 = PkceHelper.generate();
      expect(p1.codeVerifier).not.toBe(p2.codeVerifier);
      expect(p1.codeChallenge).not.toBe(p2.codeChallenge);
    });
  });
});

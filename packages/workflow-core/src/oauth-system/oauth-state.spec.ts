import { describe, it, expect, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import { OAuthStateManager } from './oauth-state';

describe('OAuthStateManager', () => {
  let manager: OAuthStateManager;
  const secret = crypto.randomBytes(32).toString('hex');

  beforeEach(() => {
    manager = new OAuthStateManager(secret, 10 * 60 * 1000); // 10 minutes
  });

  describe('generateState', () => {
    it('should generate a state token', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
      });

      expect(state).toBeTruthy();
      expect(typeof state).toBe('string');
    });

    it('should include payload and signature separated by dot', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
      });

      const parts = state.split('.');
      expect(parts).toHaveLength(2);
    });

    it('should generate different tokens for different data', () => {
      const s1 = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
      });
      const s2 = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-2',
      });

      expect(s1).not.toBe(s2);
    });
  });

  describe('validateState', () => {
    it('should validate a valid state token', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
      });

      const data = manager.validateState(state);
      expect(data).not.toBeNull();
      expect(data?.providerType).toBe('google-oauth2');
      expect(data?.projectId).toBe('proj-1');
    });

    it('should include credentialId when provided', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        credentialId: 'cred-123',
      });

      const data = manager.validateState(state);
      expect(data?.credentialId).toBe('cred-123');
    });

    it('should include returnUrl when provided', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        returnUrl: 'https://example.com/callback',
      });

      const data = manager.validateState(state);
      expect(data?.returnUrl).toBe('https://example.com/callback');
    });

    it('should reject null/empty state', () => {
      expect(manager.validateState('')).toBeNull();
      expect(manager.validateState('invalid')).toBeNull();
    });

    it('should reject tampered state', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
      });

      // Tamper with the payload
      const parts = state.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ providerType: 'github', projectId: 'proj-2' }),
      ).toString('base64url');
      const tampered = `${tamperedPayload}.${parts[1]}`;

      expect(manager.validateState(tampered)).toBeNull();
    });

    it('should reject state with wrong signature', () => {
      const state = manager.generateState({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
      });

      const parts = state.split('.');
      const fakeSignature = crypto.randomBytes(32).toString('base64url');
      const forged = `${parts[0]}.${fakeSignature}`;

      expect(manager.validateState(forged)).toBeNull();
    });

    it('should reject expired state', () => {
      const shortLivedManager = new OAuthStateManager(secret, 1); // 1ms

      // Manually create expired state by using a past timestamp
      const payload = JSON.stringify({
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        createdAt: Date.now() - 10000, // 10 seconds ago
      });
      const payloadBase64 = Buffer.from(payload).toString('base64url');
      const signature = crypto
        .createHmac('sha256', Buffer.from(secret, 'hex'))
        .update(payloadBase64)
        .digest('base64url');
      const expiredState = `${payloadBase64}.${signature}`;

      const data = shortLivedManager.validateState(expiredState);
      expect(data).toBeNull();
    });
  });

  describe('isExpired', () => {
    it('should return false for recent state', () => {
      const data = {
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        createdAt: Date.now(),
      };
      expect(manager.isExpired(data)).toBe(false);
    });

    it('should return true for old state', () => {
      const data = {
        providerType: 'google-oauth2',
        projectId: 'proj-1',
        createdAt: Date.now() - 20 * 60 * 1000, // 20 minutes ago
      };
      expect(manager.isExpired(data)).toBe(true);
    });
  });
});

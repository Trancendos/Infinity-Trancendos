import { describe, it, expect, beforeAll } from '@jest/globals';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyAccessToken, 
  verifyRefreshToken,
  decodeToken 
} from '../utils/jwt.util.js';

describe('JWT Utility Tests', () => {
  let testPayload;

  beforeAll(() => {
    testPayload = {
      userId: 'user_123',
      tenantId: 'tenant_abc',
      role: 'user',
      email: 'test@example.com',
    };
  });

  describe('generateAccessToken', () => {
    it('should generate valid access token', () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should throw error without userId', () => {
      expect(() => {
        generateAccessToken({ tenantId: 'tenant_abc' });
      }).toThrow('userId and tenantId are required');
    });

    it('should throw error without tenantId', () => {
      expect(() => {
        generateAccessToken({ userId: 'user_123' });
      }).toThrow('userId and tenantId are required');
    });

    it('should sanitize payload values', () => {
      const longPayload = {
        userId: 'a'.repeat(200),
        tenantId: 'b'.repeat(200),
        role: 'c'.repeat(100),
        email: 'd'.repeat(300),
      };
      
      const token = generateAccessToken(longPayload);
      const decoded = decodeToken(token);
      
      expect(decoded.userId.length).toBeLessThanOrEqual(100);
      expect(decoded.tenantId.length).toBeLessThanOrEqual(100);
      expect(decoded.role.length).toBeLessThanOrEqual(50);
      expect(decoded.email.length).toBeLessThanOrEqual(255);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include tokenVersion in payload', () => {
      const payload = { ...testPayload, tokenVersion: 5 };
      const token = generateRefreshToken(payload);
      const decoded = decodeToken(token);
      
      expect(decoded.tokenVersion).toBe(5);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.tenantId).toBe(testPayload.tenantId);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyAccessToken('not-a-jwt');
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.tenantId).toBe(testPayload.tenantId);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        verifyRefreshToken('invalid.token.here');
      }).toThrow('Invalid refresh token');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.tenantId).toBe(testPayload.tenantId);
    });

    it('should return null for invalid token', () => {
      const decoded = decodeToken('not-a-jwt');
      expect(decoded).toBeNull();
    });
  });

  describe('Token Security', () => {
    it('should generate different tokens for same payload', () => {
      const token1 = generateAccessToken(testPayload);
      const token2 = generateAccessToken(testPayload);
      
      // Tokens should be different due to timestamp
      expect(token1).not.toBe(token2);
    });

    it('should include issuer in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      
      expect(decoded.iss).toBe('trancendos-auth');
    });

    it('should include audience (tenantId) in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      
      expect(decoded.aud).toBe(testPayload.tenantId);
    });

    it('should include expiration time', () => {
      const token = generateAccessToken(testPayload);
      const decoded = decodeToken(token);
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });
});

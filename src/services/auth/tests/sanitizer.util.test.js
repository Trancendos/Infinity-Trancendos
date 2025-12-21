import { describe, it, expect } from '@jest/globals';
import {
  sanitizeInput,
  sanitizeEmail,
  validateEmail,
  validatePassword,
  sanitizeTenantId,
  sanitizeUserId,
  sanitizeRole,
  hasSQLInjection,
  hasXSS,
} from '../utils/sanitizer.util.js';

describe('Sanitizer Utility Tests', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should remove null bytes', () => {
      expect(sanitizeInput('test\0value')).toBe('testvalue');
    });

    it('should escape HTML entities', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;');
    });

    it('should limit length', () => {
      const longString = 'a'.repeat(300);
      const result = sanitizeInput(longString, 100);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should handle null and undefined', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email', () => {
      const result = validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const result = validateEmail('not-an-email');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
    });

    it('should normalize email to lowercase', () => {
      const result = validateEmail('Test@Example.COM');
      expect(result.sanitized).toBe('test@example.com');
    });

    it('should reject email exceeding max length', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.valid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
    });

    it('should reject short password', () => {
      const result = validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123');
      expect(result.valid).toBe(false);
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('UPPERCASE123');
      expect(result.valid).toBe(false);
    });

    it('should reject password without number', () => {
      const result = validatePassword('NoNumbersHere');
      expect(result.valid).toBe(false);
    });

    it('should reject password exceeding max length', () => {
      const longPassword = 'A1' + 'a'.repeat(130);
      const result = validatePassword(longPassword);
      expect(result.valid).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(validatePassword(null).valid).toBe(false);
      expect(validatePassword(undefined).valid).toBe(false);
    });
  });

  describe('sanitizeTenantId', () => {
    it('should allow alphanumeric and hyphens', () => {
      expect(sanitizeTenantId('tenant-123_abc')).toBe('tenant-123_abc');
    });

    it('should remove special characters', () => {
      expect(sanitizeTenantId('tenant@#$123')).toBe('tenant123');
    });

    it('should limit length', () => {
      const longId = 'a'.repeat(150);
      expect(sanitizeTenantId(longId).length).toBeLessThanOrEqual(100);
    });

    it('should handle empty input', () => {
      expect(sanitizeTenantId('')).toBe('');
      expect(sanitizeTenantId(null)).toBe('');
    });
  });

  describe('sanitizeRole', () => {
    it('should accept valid roles', () => {
      expect(sanitizeRole('user')).toBe('user');
      expect(sanitizeRole('admin')).toBe('admin');
      expect(sanitizeRole('moderator')).toBe('moderator');
    });

    it('should default to user for invalid role', () => {
      expect(sanitizeRole('invalid')).toBe('user');
      expect(sanitizeRole('hacker')).toBe('user');
    });

    it('should normalize to lowercase', () => {
      expect(sanitizeRole('ADMIN')).toBe('admin');
      expect(sanitizeRole('User')).toBe('user');
    });

    it('should handle empty input', () => {
      expect(sanitizeRole('')).toBe('user');
      expect(sanitizeRole(null)).toBe('user');
    });
  });

  describe('hasSQLInjection', () => {
    it('should detect SQL keywords', () => {
      expect(hasSQLInjection('SELECT * FROM users')).toBe(true);
      expect(hasSQLInjection('DROP TABLE users')).toBe(true);
      expect(hasSQLInjection("' OR '1'='1")).toBe(true);
    });

    it('should detect SQL comment syntax', () => {
      expect(hasSQLInjection('test--comment')).toBe(true);
      expect(hasSQLInjection('test/*comment*/')).toBe(true);
    });

    it('should allow safe input', () => {
      expect(hasSQLInjection('normal text')).toBe(false);
      expect(hasSQLInjection('user@example.com')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(hasSQLInjection('')).toBe(false);
      expect(hasSQLInjection(null)).toBe(false);
    });
  });

  describe('hasXSS', () => {
    it('should detect script tags', () => {
      expect(hasXSS('<script>alert("xss")</script>')).toBe(true);
      expect(hasXSS('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true);
    });

    it('should detect javascript protocol', () => {
      expect(hasXSS('javascript:alert("xss")')).toBe(true);
      expect(hasXSS('JAVASCRIPT:alert("xss")')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(hasXSS('onclick=alert("xss")')).toBe(true);
      expect(hasXSS('onload=malicious()')).toBe(true);
    });

    it('should allow safe input', () => {
      expect(hasXSS('normal text')).toBe(false);
      expect(hasXSS('user@example.com')).toBe(false);
    });

    it('should handle empty input', () => {
      expect(hasXSS('')).toBe(false);
      expect(hasXSS(null)).toBe(false);
    });
  });
});

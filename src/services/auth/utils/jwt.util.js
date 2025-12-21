import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWT Utility for multi-tenant authentication
 * Zero-trust security model with tenant isolation
 */

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate access token with tenant context
 * @param {Object} payload - User and tenant data
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  if (!payload.userId || !payload.tenantId) {
    throw new Error('userId and tenantId are required');
  }

  const sanitizedPayload = {
    userId: String(payload.userId).slice(0, 100),
    tenantId: String(payload.tenantId).slice(0, 100),
    role: String(payload.role || 'user').slice(0, 50),
    email: String(payload.email || '').slice(0, 255),
  };

  return jwt.sign(sanitizedPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'trancendos-auth',
    audience: sanitizedPayload.tenantId,
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - User and tenant data
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  if (!payload.userId || !payload.tenantId) {
    throw new Error('userId and tenantId are required');
  }

  const sanitizedPayload = {
    userId: String(payload.userId).slice(0, 100),
    tenantId: String(payload.tenantId).slice(0, 100),
    tokenVersion: payload.tokenVersion || 0,
  };

  return jwt.sign(sanitizedPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'trancendos-auth',
    audience: sanitizedPayload.tenantId,
  });
};

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'trancendos-auth',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'trancendos-auth',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

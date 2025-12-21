import { verifyAccessToken } from '../utils/jwt.util.js';
import { sanitizeInput } from '../utils/sanitizer.util.js';

/**
 * Authentication middleware with tenant isolation
 * Implements zero-trust security model
 */

/**
 * Authenticate JWT token and attach user context
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const token = authHeader.substring(7);

    if (!token || token.length > 2048) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'AUTH_TOKEN_INVALID',
      });
    }

    const decoded = verifyAccessToken(token);

    // Attach sanitized user context to request
    req.user = {
      userId: sanitizeInput(decoded.userId),
      tenantId: sanitizeInput(decoded.tenantId),
      role: sanitizeInput(decoded.role),
      email: sanitizeInput(decoded.email),
    };

    // Tenant isolation: Ensure tenant context is always present
    req.tenantId = req.user.tenantId;

    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: sanitizeInput(decoded.userId),
      tenantId: sanitizeInput(decoded.tenantId),
      role: sanitizeInput(decoded.role),
      email: sanitizeInput(decoded.email),
    };

    req.tenantId = req.user.tenantId;
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

/**
 * Tenant isolation middleware
 * Ensures all requests are scoped to a tenant
 */
export const requireTenant = (req, res, next) => {
  if (!req.tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Tenant context required',
      code: 'TENANT_REQUIRED',
    });
  }

  next();
};

/**
 * Validate tenant access
 * Ensures user can only access their own tenant data
 */
export const validateTenantAccess = (req, res, next) => {
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

  if (requestedTenantId && requestedTenantId !== req.tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to tenant resources',
      code: 'TENANT_ACCESS_DENIED',
    });
  }

  next();
};

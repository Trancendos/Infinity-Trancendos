/**
 * Auth Service Entry Point
 * Multi-tenant authentication with JWT and RBAC
 */

export { authenticate, optionalAuth, requireTenant, validateTenantAccess } from './middleware/auth.middleware.js';
export { requireRole, requireMinRole, requirePermission, requireOwnershipOrAdmin } from './middleware/rbac.middleware.js';
export { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from './utils/jwt.util.js';
export { sanitizeInput, validateEmail, validatePassword } from './utils/sanitizer.util.js';
export { default as authRoutes } from './routes/auth.routes.js';

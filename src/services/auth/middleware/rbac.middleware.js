/**
 * Role-Based Access Control (RBAC) Middleware
 * Implements hierarchical role permissions
 */

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY = ['guest', 'user', 'moderator', 'admin', 'superadmin'];

// Permission matrix
const PERMISSIONS = {
  guest: ['read:public'],
  user: ['read:public', 'read:own', 'write:own'],
  moderator: ['read:public', 'read:own', 'write:own', 'read:tenant', 'moderate:content'],
  admin: ['read:public', 'read:own', 'write:own', 'read:tenant', 'write:tenant', 'manage:users'],
  superadmin: ['*'], // All permissions
};

/**
 * Check if role has permission
 * @param {string} role - User role
 * @param {string} permission - Required permission
 * @returns {boolean}
 */
const hasPermission = (role, permission) => {
  const rolePerms = PERMISSIONS[role] || [];
  
  // Superadmin has all permissions
  if (rolePerms.includes('*')) {
    return true;
  }

  return rolePerms.includes(permission);
};

/**
 * Check if role is at least the required level
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
const hasRoleLevel = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

  return userLevel >= requiredLevel && userLevel !== -1 && requiredLevel !== -1;
};

/**
 * Require specific role (exact match)
 * @param {string|string[]} roles - Required role(s)
 */
export const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        required: allowedRoles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Require minimum role level (hierarchical)
 * @param {string} minRole - Minimum required role
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!hasRoleLevel(req.user.role, minRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient role level',
        code: 'ROLE_LEVEL_DENIED',
        required: minRole,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * Require specific permission
 * @param {string|string[]} permissions - Required permission(s)
 */
export const requirePermission = (permissions) => {
  const requiredPerms = Array.isArray(permissions) ? permissions : [permissions];

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const hasAllPermissions = requiredPerms.every(perm => 
      hasPermission(req.user.role, perm)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED',
        required: requiredPerms,
        role: req.user.role,
      });
    }

    next();
  };
};

/**
 * Require resource ownership or admin role
 */
export const requireOwnershipOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    const isOwner = resourceUserId === req.user.userId;
    const isAdmin = hasRoleLevel(req.user.role, 'admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: ownership or admin role required',
        code: 'OWNERSHIP_DENIED',
      });
    }

    next();
  };
};

/**
 * Export role hierarchy and permissions for reference
 */
export const getRoleHierarchy = () => ROLE_HIERARCHY;
export const getPermissions = () => PERMISSIONS;

import validator from 'validator';

/**
 * Input sanitization utilities
 * OWASP standards compliance
 */

/**
 * Sanitize generic string input
 * @param {any} input - Input to sanitize
 * @param {number} maxLength - Maximum length
 * @returns {string}
 */
export const sanitizeInput = (input, maxLength = 255) => {
  if (input === null || input === undefined) {
    return '';
  }

  let sanitized = String(input).trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Escape HTML entities
  sanitized = validator.escape(sanitized);
  
  // Limit length
  sanitized = sanitized.slice(0, maxLength);
  
  return sanitized;
};

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string}
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  const normalized = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
  });
  
  return normalized ? validator.escape(normalized.toLowerCase()) : '';
};

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, sanitized: string, error?: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Email is required' };
  }

  const sanitized = sanitizeEmail(email);
  
  if (!validator.isEmail(sanitized)) {
    return { valid: false, sanitized, error: 'Invalid email format' };
  }

  if (sanitized.length > 255) {
    return { valid: false, sanitized, error: 'Email too long' };
  }

  return { valid: true, sanitized };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password too long (max 128 characters)' };
  }

  // Check for at least one uppercase, one lowercase, one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { 
      valid: false, 
      error: 'Password must contain uppercase, lowercase, and number' 
    };
  }

  return { valid: true };
};

/**
 * Sanitize tenant ID
 * @param {string} tenantId - Tenant ID to sanitize
 * @returns {string}
 */
export const sanitizeTenantId = (tenantId) => {
  if (!tenantId) return '';
  
  // Allow only alphanumeric, hyphens, and underscores
  const sanitized = String(tenantId)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 100);
  
  return sanitized;
};

/**
 * Sanitize user ID
 * @param {string} userId - User ID to sanitize
 * @returns {string}
 */
export const sanitizeUserId = (userId) => {
  if (!userId) return '';
  
  // Allow only alphanumeric, hyphens, and underscores
  const sanitized = String(userId)
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 100);
  
  return sanitized;
};

/**
 * Sanitize role
 * @param {string} role - Role to sanitize
 * @returns {string}
 */
export const sanitizeRole = (role) => {
  if (!role) return 'user';
  
  const validRoles = ['guest', 'user', 'moderator', 'admin', 'superadmin'];
  const sanitized = String(role).trim().toLowerCase();
  
  return validRoles.includes(sanitized) ? sanitized : 'user';
};

/**
 * Sanitize object by applying sanitization to all string values
 * @param {Object} obj - Object to sanitize
 * @param {number} maxLength - Maximum length for strings
 * @returns {Object}
 */
export const sanitizeObject = (obj, maxLength = 255) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, maxLength);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item, maxLength) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, maxLength);
    }
  }
  
  return sanitized;
};

/**
 * Prevent SQL injection in raw queries (use parameterized queries instead)
 * @param {string} input - Input to check
 * @returns {boolean}
 */
export const hasSQLInjection = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\;|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Prevent XSS attacks
 * @param {string} input - Input to check
 * @returns {boolean}
 */
export const hasXSS = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

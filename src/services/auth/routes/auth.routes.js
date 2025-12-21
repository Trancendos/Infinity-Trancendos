import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { validateEmail, validatePassword, sanitizeInput, sanitizeTenantId } from '../utils/sanitizer.util.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// In-memory user store (replace with database in production)
const users = new Map();
const refreshTokens = new Map();

/**
 * POST /auth/register
 * Register new user with tenant isolation
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
  body('tenantId').isLength({ min: 1, max: 100 }),
  body('role').optional().isIn(['guest', 'user', 'moderator', 'admin']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, tenantId, role = 'user' } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        error: emailValidation.error,
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.error,
      });
    }

    const sanitizedEmail = emailValidation.sanitized;
    const sanitizedTenantId = sanitizeTenantId(tenantId);
    const userKey = `${sanitizedTenantId}:${sanitizedEmail}`;

    // Check if user exists
    if (users.has(userKey)) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      userId,
      email: sanitizedEmail,
      password: hashedPassword,
      tenantId: sanitizedTenantId,
      role: sanitizeInput(role, 50),
      tokenVersion: 0,
      createdAt: new Date().toISOString(),
    };

    users.set(userKey, user);

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userId,
      tenantId: user.tenantId,
      tokenVersion: user.tokenVersion,
    });

    refreshTokens.set(refreshToken, {
      userId: user.userId,
      tenantId: user.tenantId,
      createdAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('tenantId').isLength({ min: 1, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, tenantId } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const sanitizedEmail = emailValidation.sanitized;
    const sanitizedTenantId = sanitizeTenantId(tenantId);
    const userKey = `${sanitizedTenantId}:${sanitizedEmail}`;

    const user = users.get(userKey);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userId,
      tenantId: user.tenantId,
      tokenVersion: user.tokenVersion,
    });

    refreshTokens.set(refreshToken, {
      userId: user.userId,
      tenantId: user.tenantId,
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', [
  body('refreshToken').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists and is valid
    const tokenData = refreshTokens.get(refreshToken);
    if (!tokenData || tokenData.userId !== decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Find user
    const user = Array.from(users.values()).find(u => 
      u.userId === decoded.userId && u.tenantId === decoded.tenantId
    );

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    });

    res.json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

/**
 * POST /auth/logout
 * Invalidate refresh token
 */
router.post('/logout', authenticate, [
  body('refreshToken').notEmpty(),
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Remove refresh token
    refreshTokens.delete(refreshToken);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

export default router;

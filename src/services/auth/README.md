# Multi-Tenant Authentication Service

Enterprise-grade authentication microservice with JWT, RBAC, and tenant isolation for the Trancendos SaaS platform.

## Features

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Multi-Tenant Isolation**: Complete tenant data separation with zero-trust security
- **Role-Based Access Control (RBAC)**: Hierarchical permissions system
- **Input Sanitization**: OWASP-compliant input validation and sanitization
- **Password Security**: Bcrypt hashing with configurable rounds
- **Token Refresh**: Secure token rotation mechanism
- **Rate Limiting**: Built-in protection against brute force attacks

## Architecture

```
src/services/auth/
├── middleware/
│   ├── auth.middleware.js      # JWT authentication & tenant isolation
│   └── rbac.middleware.js      # Role-based access control
├── routes/
│   └── auth.routes.js          # Auth endpoints (login, register, etc.)
├── utils/
│   ├── jwt.util.js             # JWT generation & validation
│   └── sanitizer.util.js       # Input sanitization & validation
├── tests/
│   ├── jwt.util.test.js        # JWT utility tests
│   └── sanitizer.util.test.js  # Sanitizer tests
└── index.js                    # Service exports
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update JWT secrets in `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

### 3. Integrate with Express

```javascript
import express from 'express';
import { authRoutes } from './services/auth/index.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
```

## API Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "tenantId": "tenant_abc",
  "role": "user"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "tenantId": "tenant_abc"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Middleware Usage

### Protect Routes with Authentication

```javascript
import { authenticate } from './services/auth/index.js';

app.get('/api/protected', authenticate, (req, res) => {
  res.json({ user: req.user, tenantId: req.tenantId });
});
```

### Require Specific Role

```javascript
import { authenticate, requireRole } from './services/auth/index.js';

app.post('/api/admin', authenticate, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin only endpoint' });
});
```

### Require Minimum Role Level

```javascript
import { authenticate, requireMinRole } from './services/auth/index.js';

app.get('/api/moderate', authenticate, requireMinRole('moderator'), (req, res) => {
  res.json({ message: 'Moderator or higher' });
});
```

### Require Specific Permission

```javascript
import { authenticate, requirePermission } from './services/auth/index.js';

app.put('/api/content', authenticate, requirePermission('write:tenant'), (req, res) => {
  res.json({ message: 'Content updated' });
});
```

### Tenant Isolation

```javascript
import { authenticate, requireTenant, validateTenantAccess } from './services/auth/index.js';

app.get('/api/tenant/:tenantId/data', 
  authenticate, 
  requireTenant, 
  validateTenantAccess, 
  (req, res) => {
    // User can only access their own tenant data
    res.json({ tenantId: req.tenantId });
  }
);
```

## Role Hierarchy

```
guest < user < moderator < admin < superadmin
```

### Permissions by Role

- **guest**: `read:public`
- **user**: `read:public`, `read:own`, `write:own`
- **moderator**: `read:public`, `read:own`, `write:own`, `read:tenant`, `moderate:content`
- **admin**: `read:public`, `read:own`, `write:own`, `read:tenant`, `write:tenant`, `manage:users`
- **superadmin**: `*` (all permissions)

## Security Features

### Input Sanitization
- HTML entity escaping
- SQL injection prevention
- XSS attack prevention
- Null byte removal
- Length limiting

### Password Requirements
- Minimum 8 characters
- Maximum 128 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Special characters recommended

### Token Security
- Short-lived access tokens (15 minutes default)
- Long-lived refresh tokens (7 days default)
- Token versioning for invalidation
- Issuer and audience validation
- Tenant-scoped tokens

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Production Deployment

### Environment Variables

```env
NODE_ENV=production
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12
```

### Generate Secure Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Integration

Replace in-memory storage in [`auth.routes.js`](auth.routes.js:10) with your database:

```javascript
// Replace Map with database queries
import { UserModel } from '../models/user.model.js';

// Example: Find user
const user = await UserModel.findOne({ 
  email: sanitizedEmail, 
  tenantId: sanitizedTenantId 
});
```

## Performance Optimization

- Token caching with Redis
- Database connection pooling
- Rate limiting per tenant
- Horizontal scaling support
- Stateless authentication

## Monitoring

Log authentication events:
```javascript
import winston from 'winston';

logger.info('User login', { 
  userId: user.userId, 
  tenantId: user.tenantId,
  timestamp: new Date().toISOString()
});
```

## License

MIT

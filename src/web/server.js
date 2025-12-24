import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'"],
    },
  },
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', apiLimiter);

// Separate rate limiter for health checks (more permissive for monitoring)
const healthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Allow more frequent health checks for monitoring systems
  message: 'Too many health check requests.',
});
app.use('/health', healthLimiter);

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Pre-sorted resources (sorted once at startup, not on every request)
const RESOURCES = [
  {
    id: 2,
    title: 'Breathing Exercises',
    description: 'Simple techniques to reduce anxiety',
    url: '/exercises/breathing'
  },
  {
    id: 1,
    title: 'Crisis Helpline',
    description: 'Available 24/7 for immediate support',
    contact: '988 (US Suicide & Crisis Lifeline)'
  },
  {
    id: 3,
    title: 'Mood Tracking',
    description: 'Track your mental health journey',
    url: '/tools/mood-tracker'
  }
].sort((a, b) => a.title.localeCompare(b.title));

// API endpoint for mental health resources
app.get('/api/resources', (req, res) => {
  res.json({
    resources: RESOURCES
  });
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).sendFile(join(__dirname, 'public', '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Infinity-Trancendos Server is Running on port ${PORT}!`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));


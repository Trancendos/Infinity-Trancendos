import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// API endpoint for mental health resources
app.get('/api/resources', (req, res) => {
  const resources = [
    {
      id: 1,
      title: 'Crisis Helpline',
      description: 'Available 24/7 for immediate support',
      contact: '988 (US Suicide & Crisis Lifeline)'
    },
    {
      id: 2,
      title: 'Breathing Exercises',
      description: 'Simple techniques to reduce anxiety',
      url: '/exercises/breathing'
    },
    {
      id: 3,
      title: 'Mood Tracking',
      description: 'Track your mental health journey',
      url: '/tools/mood-tracker'
    }
  ];
  
  // Sort resources alphabetically by title
  const sortedResources = [...resources].sort((a, b) => a.title.localeCompare(b.title));
  
  res.json({
    resources: sortedResources
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


export { app };


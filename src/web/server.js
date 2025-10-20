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
    uptime: process.uptime()
  });
});

// API endpoint for mental health resources
app.get('/api/resources', (req, res) => {
  res.json({
    resources: [
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
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Infinity-Trancendos Server is Running on port ${PORT}!`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});


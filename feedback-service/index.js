import express from 'express';

export const app = express();
const PORT = process.env.FEEDBACK_PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

/**
 * @api {post} /api/feedback Submit new feedback
 * @apiName PostFeedback
 * @apiGroup Feedback
 *
 * @apiBody {String} source The source of the feedback (e.g., "App Store", "In-App Survey").
 * @apiBody {String} content The main content of the feedback.
 * @apiBody {Number} [rating] An optional numerical rating (e.g., 1-5).
 * @apiBody {String} [user_id] An optional identifier for the user.
 *
 * @apiSuccess {String} message Success message.
 * @apiSuccess {Object} feedback The feedback data that was received.
 */
app.post('/api/feedback', (req, res) => {
  const { source, content, rating, user_id } = req.body;

  if (!source || !content) {
    return res.status(400).json({ error: 'Missing required fields: source and content are required.' });
  }

  const feedbackData = {
    source,
    content,
    rating,
    user_id,
    receivedAt: new Date().toISOString(),
  };

  // For now, we just log the feedback.
  // In the future, this will be saved to a database.
  console.log('Received new feedback:', JSON.stringify(feedbackData, null, 2));

  res.status(201).json({
    message: 'Feedback received successfully.',
    feedback: feedbackData,
  });
});

// Wrapper function to start the server only if this file is run directly
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Feedback Service is running on port ${PORT}!`);
  });
};

// This allows the app to be imported for testing without starting the server
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

import request from 'supertest';
import { app } from '../index.js';
import assert from 'assert';

describe('POST /api/feedback', () => {
  it('should return 201 Created for a valid feedback submission', (done) => {
    const feedbackData = {
      source: 'Unit Test',
      content: 'This is a test feedback entry.',
      rating: 5,
      user_id: 'test-user-123',
    };

    request(app)
      .post('/api/feedback')
      .send(feedbackData)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.message, 'Feedback received successfully.');
        assert.deepStrictEqual(res.body.feedback.source, feedbackData.source);
        assert.deepStrictEqual(res.body.feedback.content, feedbackData.content);
        done();
      });
  });

  it('should return 400 Bad Request if required fields are missing', (done) => {
    const feedbackData = {
      rating: 5,
      user_id: 'test-user-123',
    };

    request(app)
      .post('/api/feedback')
      .send(feedbackData)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        assert.strictEqual(res.body.error, 'Missing required fields: source and content are required.');
        done();
      });
  });
});

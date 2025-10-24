import request from 'supertest';
import { app } from '../src/web/server.js';
import assert from 'assert';

const expectedSortedResources = [
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
];

describe('GET /api/resources', () => {
  it('should return a sorted list of resources', (done) => {
    request(app)
      .get('/api/resources')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        assert.deepStrictEqual(res.body.resources, expectedSortedResources);
        done();
      });
  });
});

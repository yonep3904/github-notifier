import app from '@/index';
import { describe, expect, it } from 'vitest';

describe('GET /', () => {
  it('returns 200', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
  });
});

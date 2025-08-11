import { handler } from './handler';

describe('Lambda Handler', () => {
  it('should return success response', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/hello',
      headers: {},
      queryStringParameters: null,
      body: null
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toHaveProperty('message');
    expect(JSON.parse(result.body).message).toContain('Hello');
  });

  it('should handle different HTTP methods', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/hello',
      headers: {},
      queryStringParameters: null,
      body: JSON.stringify({ test: 'data' })
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers['Content-Type']).toBe('application/json');
  });
});
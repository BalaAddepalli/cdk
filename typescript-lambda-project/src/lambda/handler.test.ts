import { handler } from './handler';

describe('Lambda Handler', () => {
  const mockContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: 'test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  } as any;

  it('should return success response', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/hello',
      headers: {},
      queryStringParameters: null,
      body: null
    } as any;

    const result = await handler(event, mockContext);

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
    } as any;

    const result = await handler(event, mockContext);

    expect(result.statusCode).toBe(200);
    expect(result.headers && result.headers['Content-Type']).toBe('application/json');
  });
});
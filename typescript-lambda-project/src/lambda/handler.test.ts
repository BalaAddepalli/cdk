import { handler } from './handler';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Mock context
const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test-function',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:eu-central-1:123456789012:function:test-function',
  memoryLimitInMB: '256',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2024/01/01/[$LATEST]test',
  getRemainingTimeInMillis: () => 30000,
  done: () => {},
  fail: () => {},
  succeed: () => {}
};

describe('Lambda Handler', () => {
  it('should return 200 with correct response structure', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/hello',
      headers: { 'User-Agent': 'test-agent' },
      requestContext: {
        requestId: 'api-request-id'
      } as any
    };

    const result = await handler(mockEvent as any, mockContext);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    expect(result.headers).toHaveProperty('X-Request-ID');
    
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'Hello from TypeScript Lambda - Monorepo Working!');
    expect(body).toHaveProperty('requestId');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('processingTime');
  });

  it('should handle direct invocation without API Gateway context', async () => {
    const mockEvent = { test: 'data' };

    const result = await handler(mockEvent as any, mockContext);

    expect(result.statusCode).toBe(200);
    
    const body = JSON.parse(result.body);
    expect(body.requestId).toBe('test-request-id'); // Should use context.awsRequestId
  });

  it('should handle errors gracefully', async () => {
    const mockEvent = {}; // Empty event instead of null

    const result = await handler(mockEvent as any, mockContext);

    // Should still return a valid response structure
    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
  });

  it('should handle null event gracefully', async () => {
    const result = await handler(null as any, mockContext);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'Hello from TypeScript Lambda - Monorepo Working!');
  });

  it('should log request details', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      httpMethod: 'GET',
      path: '/hello',
      headers: { 'User-Agent': 'test-agent' }
    };

    await handler(mockEvent as any, mockContext);

    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should measure processing time', async () => {
    const mockEvent = { test: 'data' };

    const result = await handler(mockEvent as any, mockContext);
    
    const body = JSON.parse(result.body);
    expect(body.processingTime).toBeGreaterThanOrEqual(0);
    expect(typeof body.processingTime).toBe('number');
  });
});
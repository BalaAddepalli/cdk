import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

interface LogEntry {
  timestamp: string;
  requestId: string;
  level: 'INFO' | 'ERROR' | 'WARN';
  message: string;
  details?: any;
}

const log = (level: LogEntry['level'], message: string, details?: any, requestId?: string) => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    requestId: requestId || 'unknown',
    level,
    message,
    ...(details && { details })
  };
  console.log(JSON.stringify(logEntry));
};

export const handler = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
  const requestId = event?.requestContext?.requestId || context.awsRequestId;
  
  try {
    log('INFO', 'Lambda invocation started', { 
      httpMethod: event?.httpMethod,
      path: event?.path,
      userAgent: event?.headers?.['User-Agent']
    }, requestId);

    // Simulate some processing
    const startTime = Date.now();
    
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      body: JSON.stringify({
        message: 'Hello from TypeScript Lambda - Monorepo Working!',
        requestId: requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      })
    };

    log('INFO', 'Lambda invocation completed successfully', {
      statusCode: response.statusCode,
      processingTime: Date.now() - startTime
    }, requestId);

    return response;
    
  } catch (error) {
    log('ERROR', 'Lambda invocation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, requestId);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        requestId: requestId
      })
    };
  }
};
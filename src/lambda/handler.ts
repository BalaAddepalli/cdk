import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const handler = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId || context.awsRequestId;
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from TypeScript Lambda!',
      requestId: requestId,
      event: event
    })
  };
};
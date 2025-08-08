import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'TypeScriptLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda/handler.handler',
      code: lambda.Code.fromAsset('dist'),
      environment: {
        NODE_ENV: 'production'
      }
    });

    new apigateway.LambdaRestApi(this, 'LambdaApi', {
      handler: lambdaFunction
    });
  }
}
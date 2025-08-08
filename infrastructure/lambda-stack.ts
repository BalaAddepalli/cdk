import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

const LAMBDA_RUNTIME = lambda.Runtime.NODEJS_22_X;

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'TypeScriptLambda', {
      runtime: LAMBDA_RUNTIME,
      handler: 'lambda/handler.handler',
      code: lambda.Code.fromAsset('dist'),
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256, // Better price/performance ratio
      timeout: cdk.Duration.seconds(10),
      reservedConcurrentExecutions: 10, // Prevent runaway costs
      retryAttempts: 0, // No retries for sync invocations
      environment: {
        NODE_ENV: 'production',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1' // Reuse HTTP connections
      },
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK, // Cost optimization
      tracing: lambda.Tracing.ACTIVE // X-Ray tracing
    });

    const api = new apigateway.LambdaRestApi(this, 'LambdaApi', {
      handler: lambdaFunction,
      proxy: false,
      deployOptions: {
        stageName: 'prod',
        throttle: {
          rateLimit: 100,
          burstLimit: 200
        },
        loggingLevel: apigateway.MethodLoggingLevel.ERROR,
        dataTraceEnabled: false,
        metricsEnabled: true,
        cachingEnabled: true, // Enable caching for better performance
        cacheClusterEnabled: true,
        cacheClusterSize: '0.5', // Smallest cache size for cost optimization
        cacheTtl: cdk.Duration.minutes(5) // 5-minute cache TTL
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://*.yourdomain.com'], // Restrict origins for security
        allowMethods: ['GET'],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1)
      },
      binaryMediaTypes: ['image/*', 'application/pdf'] // Support binary content
    });

    // Add specific resource instead of proxy
    const resource = api.root.addResource('hello');
    resource.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    }));

    // CloudWatch Alarms for monitoring
    const errorAlarm = new cdk.aws_cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
      metric: lambdaFunction.metricErrors(),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING
    });

    const durationAlarm = new cdk.aws_cloudwatch.Alarm(this, 'LambdaDurationAlarm', {
      metric: lambdaFunction.metricDuration(),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 2
    });

    // API Gateway resource policy for IP restrictions
    const resourcePolicy = new cdk.aws_iam.PolicyDocument({
      statements: [
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          principals: [new cdk.aws_iam.AnyPrincipal()],
          actions: ['execute-api:Invoke'],
          resources: ['*'],
          conditions: {
            'IpAddress': {
              'aws:SourceIp': ['0.0.0.0/0'] // Replace with your IP ranges
            }
          }
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.DENY,
          principals: [new cdk.aws_iam.AnyPrincipal()],
          actions: ['execute-api:Invoke'],
          resources: ['*'],
          conditions: {
            'StringNotEquals': {
              'aws:RequestedRegion': 'eu-central-1'
            }
          }
        })
      ]
    });

    // Apply resource policy to API Gateway
    const cfnApi = api.node.defaultChild as cdk.aws_apigateway.CfnRestApi;
    cfnApi.policy = resourcePolicy;

    // CloudWatch Dashboard
    const dashboard = new cdk.aws_cloudwatch.Dashboard(this, 'LambdaDashboard', {
      dashboardName: 'TypeScriptLambda-Monitoring'
    });

    dashboard.addWidgets(
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Lambda Metrics',
        left: [lambdaFunction.metricInvocations(), lambdaFunction.metricErrors()],
        right: [lambdaFunction.metricDuration()]
      }),
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'API Gateway Metrics',
        left: [api.metricCount(), api.metricClientError(), api.metricServerError()],
        right: [api.metricLatency()]
      })
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url + 'hello',
      description: 'Lambda API URL'
    });

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=${dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL'
    });
  }
}
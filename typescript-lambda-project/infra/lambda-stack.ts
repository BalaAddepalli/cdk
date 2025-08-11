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
        loggingLevel: apigateway.MethodLoggingLevel.ERROR,
        dataTraceEnabled: false,
        metricsEnabled: true,
        cachingEnabled: true,
        cacheClusterEnabled: true,
        cacheClusterSize: '0.5',
        cacheTtl: cdk.Duration.minutes(5)
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://*.yourdomain.com'],
        allowMethods: ['GET'],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: cdk.Duration.hours(1)
      },
      binaryMediaTypes: ['image/*', 'application/pdf']
    });

    // Add specific resource
    const resource = api.root.addResource('hello');
    resource.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    }));

    // Security-focused CloudWatch Alarms
    const securityErrorAlarm = new cdk.aws_cloudwatch.Alarm(this, 'SecurityErrorAlarm', {
      alarmName: 'TypeScriptLambda-SecurityErrors',
      alarmDescription: 'High error rate indicating potential security issues',
      metric: lambdaFunction.metricErrors(),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cdk.aws_cloudwatch.TreatMissingData.NOT_BREACHING
    });

    const apiSecurityAlarm = new cdk.aws_cloudwatch.Alarm(this, 'ApiSecurityAlarm', {
      alarmName: 'TypeScriptLambda-ApiSecurityEvents',
      alarmDescription: 'High 4XX error rate indicating potential security attacks',
      metric: api.metricClientError(),
      threshold: 10,
      evaluationPeriods: 2
    });

    const performanceSecurityAlarm = new cdk.aws_cloudwatch.Alarm(this, 'PerformanceSecurityAlarm', {
      alarmName: 'TypeScriptLambda-PerformanceAnomaly',
      alarmDescription: 'Unusual performance patterns that may indicate security issues',
      metric: lambdaFunction.metricDuration(),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 2
    });

    const throttleSecurityAlarm = new cdk.aws_cloudwatch.Alarm(this, 'ThrottleSecurityAlarm', {
      alarmName: 'TypeScriptLambda-ThrottleEvents',
      alarmDescription: 'Lambda throttling events that may indicate DDoS or abuse',
      metric: lambdaFunction.metricThrottles(),
      threshold: 1,
      evaluationPeriods: 1
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

    // Security Dashboard
    const securityDashboard = new cdk.aws_cloudwatch.Dashboard(this, 'SecurityDashboard', {
      dashboardName: 'TypeScriptLambda-Security'
    });

    securityDashboard.addWidgets(
      new cdk.aws_cloudwatch.TextWidget({
        markdown: '# 🛡️ Security Dashboard\n\n**Real-time security monitoring and threat detection**',
        width: 24,
        height: 2
      }),
      
      // Security KPIs
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Security Score (%)',
        metrics: [
          new cdk.aws_cloudwatch.MathExpression({
            expression: 'IF(m2 > 0, 100 - ((m1 / m2) * 100), 100)',
            usingMetrics: {
              m1: api.metricServerError({ statistic: 'Sum', period: cdk.Duration.hours(1) }),
              m2: api.metricCount({ statistic: 'Sum', period: cdk.Duration.hours(1) })
            },
            label: 'Security Score'
          })
        ],
        width: 6,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Threat Events (24h)',
        metrics: [
          api.metricClientError({ statistic: 'Sum', period: cdk.Duration.hours(24), label: '4XX Attacks' }),
          api.metricServerError({ statistic: 'Sum', period: cdk.Duration.hours(24), label: '5XX Errors' })
        ],
        width: 6,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Security Incidents',
        metrics: [
          lambdaFunction.metricErrors({ statistic: 'Sum', period: cdk.Duration.hours(24) }),
          lambdaFunction.metricThrottles({ statistic: 'Sum', period: cdk.Duration.hours(24) })
        ],
        width: 6,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Attack Success Rate (%)',
        metrics: [
          new cdk.aws_cloudwatch.MathExpression({
            expression: 'IF(m2 > 0, (m1 / m2) * 100, 0)',
            usingMetrics: {
              m1: api.metricServerError({ statistic: 'Sum' }),
              m2: api.metricClientError({ statistic: 'Sum' })
            },
            label: 'Attack Success Rate'
          })
        ],
        width: 6,
        height: 6
      }),
      
      // Security Events Timeline
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Security Threat Timeline',
        left: [
          api.metricClientError({ label: 'Client Attacks (4XX)' }),
          api.metricServerError({ label: 'Server Errors (5XX)' }),
          lambdaFunction.metricErrors({ label: 'Lambda Security Events' })
        ],
        width: 24,
        height: 6,
        stacked: false
      }),
      
      // Security Analysis
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'DDoS & Abuse Detection',
        left: [lambdaFunction.metricThrottles({ label: 'Throttling Events' })],
        right: [lambdaFunction.metricInvocations({ label: 'Invocation Rate' })],
        width: 12,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Cache Security Analysis',
        left: [
          api.metricCacheHitCount({ label: 'Cache Hits' }),
          api.metricCacheMissCount({ label: 'Cache Misses' })
        ],
        width: 12,
        height: 6
      })
    );

    // Operations Dashboard
    const operationsDashboard = new cdk.aws_cloudwatch.Dashboard(this, 'OperationsDashboard', {
      dashboardName: 'TypeScriptLambda-Operations'
    });

    operationsDashboard.addWidgets(
      new cdk.aws_cloudwatch.TextWidget({
        markdown: '# ⚙️ Operations Dashboard\n\n**Operational excellence monitoring and performance metrics**',
        width: 24,
        height: 2
      }),
      
      // Operational KPIs
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Invocations (24h)',
        metrics: [
          lambdaFunction.metricInvocations({ statistic: 'Sum', period: cdk.Duration.hours(24) })
        ],
        width: 6,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Avg Duration (ms)',
        metrics: [
          lambdaFunction.metricDuration({ statistic: 'Average' })
        ],
        width: 6,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'Success Rate (%)',
        metrics: [
          new cdk.aws_cloudwatch.MathExpression({
            expression: 'IF(m2 > 0, ((m2 - m1) / m2) * 100, 100)',
            usingMetrics: {
              m1: lambdaFunction.metricErrors({ statistic: 'Sum' }),
              m2: lambdaFunction.metricInvocations({ statistic: 'Sum' })
            },
            label: 'Success Rate'
          })
        ],
        width: 6,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.SingleValueWidget({
        title: 'API Requests (24h)',
        metrics: [
          api.metricCount({ statistic: 'Sum', period: cdk.Duration.hours(24) })
        ],
        width: 6,
        height: 6
      }),
      
      // Performance Trends
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Lambda Performance Metrics',
        left: [
          lambdaFunction.metricInvocations({ label: 'Invocations' }),
          lambdaFunction.metricErrors({ label: 'Errors' })
        ],
        right: [
          lambdaFunction.metricDuration({ label: 'Duration (ms)' })
        ],
        width: 12,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'API Gateway Performance',
        left: [
          api.metricCount({ label: 'Requests' }),
          api.metricLatency({ label: 'Latency (ms)' })
        ],
        width: 12,
        height: 6
      }),
      
      // Resource Utilization
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Resource Utilization',
        left: [
          lambdaFunction.metricInvocations({ label: 'Invocations' })
        ],
        right: [
          new cdk.aws_cloudwatch.MathExpression({
            expression: '(m1 / 600) * 100',
            usingMetrics: {
              m1: lambdaFunction.metricInvocations({ statistic: 'Sum', period: cdk.Duration.minutes(1) })
            },
            label: 'Invocation Rate (per min)'
          })
        ],
        width: 12,
        height: 6
      }),
      
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Cost Optimization Metrics',
        left: [
          api.metricCacheHitCount({ label: 'Cache Hits (Cost Savings)' }),
          lambdaFunction.metricInvocations({ label: 'Billable Invocations' })
        ],
        width: 12,
        height: 6
      })
    );

    // Add ENVIRONMENT tags to all resources
    cdk.Tags.of(lambdaFunction).add('ENVIRONMENT', 'SANDBOX');
    cdk.Tags.of(api).add('ENVIRONMENT', 'SANDBOX');
    cdk.Tags.of(securityDashboard).add('ENVIRONMENT', 'SANDBOX');
    cdk.Tags.of(operationsDashboard).add('ENVIRONMENT', 'SANDBOX');

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url + 'hello',
      description: 'Lambda API URL'
    });

    new cdk.CfnOutput(this, 'SecurityDashboardUrl', {
      value: `https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=${securityDashboard.dashboardName}`,
      description: 'Security Dashboard - Threat Detection & Security Metrics'
    });

    new cdk.CfnOutput(this, 'OperationsDashboardUrl', {
      value: `https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=${operationsDashboard.dashboardName}`,
      description: 'Operations Dashboard - Performance & Operational Excellence'
    });

    new cdk.CfnOutput(this, 'SecurityAlarmsUrl', {
      value: `https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#alarmsV2:`,
      description: 'Security Alarms Console URL'
    });
  }
}
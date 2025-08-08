#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from './lambda-stack';
import { PipelineStack } from './pipeline-stack';

const app = new cdk.App();

const cicdAccountId = '123456789012';
const workloadAccountId = '123456789013';
const githubOwner = 'your-github-username';
const githubRepo = 'typescript-lambda-project';

// Deploy pipeline in CI/CD account
new PipelineStack(app, 'TypeScriptLambdaPipeline', {
  env: { account: cicdAccountId, region: 'us-east-1' },
  workloadAccountId,
  githubOwner,
  githubRepo,
});

// Deploy Lambda in workload account
new LambdaStack(app, 'TypeScriptLambdaStack', {
  env: { account: workloadAccountId, region: 'us-east-1' },
});
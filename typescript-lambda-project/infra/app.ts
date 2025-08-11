#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from './lambda-stack';
import { PipelineStack } from './pipeline-stack';

const app = new cdk.App();

const cicdAccountId = '642244225184';
const workloadAccountId = '685385421611';
const githubOwner = 'BalaAddepalli';
const githubRepo = 'cdk';

// Deploy pipeline in CI/CD account
new PipelineStack(app, 'TypeScriptLambdaPipeline', {
  env: { account: cicdAccountId, region: 'eu-central-1' },
  workloadAccountId,
  githubOwner,
  githubRepo,
});

// Deploy Lambda in workload account
new LambdaStack(app, 'TypeScriptLambdaStack', {
  env: { account: workloadAccountId, region: 'eu-central-1' },
});
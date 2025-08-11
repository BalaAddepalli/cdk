#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EC2Stack } from './ec2-stack';
import { PipelineStack } from './pipeline-stack';

const app = new cdk.App();

const cicdAccountId = '642244225184';
const workloadAccountId = '685385421611';
const githubOwner = 'BalaAddepalli';
const githubRepo = 'cdk';

// Deploy pipeline in CI/CD account
new PipelineStack(app, 'TypeScriptEC2Pipeline', {
  env: { account: cicdAccountId, region: 'eu-central-1' },
  workloadAccountId,
  githubOwner,
  githubRepo,
});

// Deploy EC2 in workload account
new EC2Stack(app, 'TypeScriptEC2Stack', {
  env: { account: workloadAccountId, region: 'eu-central-1' },
});
# TypeScript Lambda Project

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptLambda-Pipeline/view)
[![Coverage](https://img.shields.io/badge/coverage-84.61%25-yellow)](https://eu-central-1.console.aws.amazon.com/codebuild/)
[![Security](https://img.shields.io/badge/security-scanned-blue)](https://eu-central-1.console.aws.amazon.com/codebuild/)

## Overview
Serverless Lambda function with automated CI/CD pipeline, comprehensive testing, and security scanning.

## Architecture
- **Lambda Function**: HTTP API handler with structured logging
- **CI/CD Pipeline**: CodePipeline with build, test, and deploy stages
- **Security**: npm audit, dependency scanning
- **Monitoring**: CloudWatch dashboards and alarms

## Quick Start
```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build project
npm run build

# Deploy infrastructure
cdk deploy TypeScriptLambdaStack
```

## Pipeline Features
- ✅ **Automated Testing**: Jest with 84.61% coverage
- ✅ **Security Scanning**: npm audit, dependency checks
- ✅ **Coverage Reports**: Visual graphs in CodeBuild
- ✅ **Auto Deployment**: Cross-account deployment to workload account
- ✅ **Monitoring**: CloudWatch dashboards and alarms

## Project Structure
```
├── src/lambda/          # Lambda function code
├── infra/              # CDK infrastructure
├── tests/              # Unit tests
├── coverage/           # Coverage reports
└── docs/               # Documentation
```

## Testing
```bash
npm test                # Run all tests
npm run test:coverage   # Generate coverage report
```

## Deployment
Pipeline automatically deploys on push to main branch:
1. **Build**: Install deps, compile TypeScript
2. **Test**: Run Jest tests, generate coverage
3. **Security**: npm audit, vulnerability scanning
4. **Deploy**: Deploy to AWS using CDK

## Monitoring
- **Pipeline**: [CodePipeline Console](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/)
- **Coverage**: [CodeBuild Reports](https://eu-central-1.console.aws.amazon.com/codebuild/)
- **Lambda**: CloudWatch dashboards and logs
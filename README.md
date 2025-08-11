# CDK Multi-Project Repository

[![Lambda Pipeline](https://img.shields.io/badge/lambda-pipeline-passing-brightgreen)](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptLambda-Pipeline/view)
[![EC2 Pipeline](https://img.shields.io/badge/ec2-pipeline-passing-brightgreen)](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptEC2-Pipeline/view)

## Overview
Multi-project repository with automated CI/CD pipelines for AWS Lambda and EC2 infrastructure using AWS CDK.

## Projects

### 🚀 [TypeScript Lambda Project](./typescript-lambda-project/)
- **Type**: Serverless Lambda function
- **Coverage**: 84.61%
- **Features**: HTTP API, structured logging, CloudWatch monitoring
- **Pipeline**: [View Pipeline](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptLambda-Pipeline/view)

### 🖥️ [TypeScript EC2 Project](./typescript-ec2-project/)
- **Type**: EC2 infrastructure with Node.js application
- **Coverage**: 100%
- **Features**: VPC, Security Groups, CloudWatch monitoring
- **Pipeline**: [View Pipeline](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptEC2-Pipeline/view)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │   GitHub Repo   │
│  (Lambda Code)  │    │   (EC2 Code)    │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Lambda Pipeline │    │  EC2 Pipeline   │
│ ├─ Build        │    │ ├─ Build        │
│ ├─ Test         │    │ ├─ Test         │
│ ├─ Security     │    │ ├─ Security     │
│ └─ Deploy       │    │ └─ Deploy       │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ Lambda Function │    │  EC2 Instance   │
│ + CloudWatch    │    │ + VPC + CW      │
└─────────────────┘    └─────────────────┘
```

## Pipeline Features
- ✅ **Automated Testing**: Jest with coverage reporting
- ✅ **Security Scanning**: npm audit, dependency checks
- ✅ **Coverage Reports**: Visual graphs in CodeBuild
- ✅ **Cross-Account Deployment**: Pipeline → Workload account
- ✅ **Monitoring**: CloudWatch dashboards and alarms

## Quick Start
```bash
# Clone repository
git clone <repo-url>
cd cdk

# Lambda project
cd typescript-lambda-project
npm ci && npm test && npm run build

# EC2 project  
cd ../typescript-ec2-project
npm ci && npm test && npm run build
```

## Deployment
Both projects deploy automatically on push to main branch:
1. **Source**: GitHub webhook triggers pipeline
2. **Build**: Install dependencies, compile TypeScript
3. **Test**: Run Jest tests, generate coverage reports
4. **Security**: npm audit, vulnerability scanning
5. **Deploy**: Deploy infrastructure using CDK

## Monitoring & Reports
- **Pipelines**: [CodePipeline Console](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/)
- **Coverage**: [CodeBuild Reports](https://eu-central-1.console.aws.amazon.com/codebuild/)
- **Infrastructure**: CloudWatch dashboards and logs

## Development
Each project is independent with its own:
- Dependencies (`package.json`)
- Tests (`jest.config.js`)
- Infrastructure (`infra/`)
- Pipeline configuration
- Documentation
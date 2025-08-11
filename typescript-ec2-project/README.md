# TypeScript EC2 Project

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptEC2-Pipeline/view)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://eu-central-1.console.aws.amazon.com/codebuild/)
[![Security](https://img.shields.io/badge/security-scanned-blue)](https://eu-central-1.console.aws.amazon.com/codebuild/)

## Overview
Enterprise-grade EC2 infrastructure with automated CI/CD pipeline, comprehensive testing, and security scanning.

## Architecture
- **VPC**: Custom VPC with public/private subnets
- **EC2**: t3.micro instance with Node.js application
- **Security**: Security groups, IAM roles, CloudWatch monitoring
- **CI/CD Pipeline**: CodePipeline with build, test, and deploy stages

## Quick Start
```bash
# Install dependencies
npm ci

# Run tests
npm test

# Build project
npm run build

# Deploy infrastructure
cdk deploy TypeScriptEC2Stack
```

## Pipeline Features
- ✅ **Automated Testing**: Jest with 100% coverage
- ✅ **Security Scanning**: npm audit, dependency checks
- ✅ **Coverage Reports**: Visual graphs in CodeBuild
- ✅ **Auto Deployment**: Cross-account deployment to workload account
- ✅ **Infrastructure**: VPC, EC2, Security Groups, IAM roles

## Project Structure
```
├── src/                # Source code
├── infra/              # CDK infrastructure
│   ├── ec2-stack.ts    # EC2 infrastructure
│   └── pipeline-stack.ts # CI/CD pipeline
├── tests/              # Unit tests
├── coverage/           # Coverage reports
└── docs/               # Architecture documentation
```

## Infrastructure Components
- **VPC**: Custom VPC with CIDR 10.0.0.0/16
- **Subnets**: Public subnet for EC2 instance
- **Security Group**: HTTP (80), HTTPS (443), SSH (22)
- **EC2 Instance**: t3.micro with Node.js application
- **IAM Role**: CloudWatch monitoring permissions
- **User Data**: Automated Node.js setup and application deployment

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
- **Pipeline**: [CodePipeline Console](https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/TypeScriptEC2-Pipeline/view)
- **Coverage**: [CodeBuild Reports](https://eu-central-1.console.aws.amazon.com/codebuild/)
- **EC2**: CloudWatch metrics and logs

## Security Features
- **Network**: VPC isolation, security groups
- **IAM**: Least privilege access
- **Monitoring**: CloudWatch agent, system metrics
- **Scanning**: Automated security and dependency scans
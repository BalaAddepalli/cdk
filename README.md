# TypeScript Lambda CI/CD Project

A complete TypeScript Lambda function with automated CI/CD pipeline using AWS CDK, CodePipeline, and cross-account deployment.

## Architecture

- **CI/CD Account**: 642244225184 (hosts the pipeline)
- **Workload Account**: 685385421611 (hosts the Lambda function)
- **Pipeline**: Automatically deploys on push to `main` branch
- **Runtime**: Node.js 20.x (latest LTS)

## Project Structure

```
├── src/
│   └── lambda/
│       └── handler.ts          # Lambda function code
├── infrastructure/
│   ├── lambda-stack.ts         # Lambda and API Gateway resources
│   └── pipeline-stack.ts       # CI/CD pipeline resources
├── buildspec.yml               # CodeBuild build specification
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── cdk.json                   # CDK configuration
```

## Features

- ✅ TypeScript Lambda function with API Gateway
- ✅ Automated CI/CD pipeline with GitHub integration
- ✅ Cross-account deployment (CI/CD → Workload)
- ✅ Automated testing and building
- ✅ Latest Node.js 20.x runtime

## Prerequisites

- AWS CLI configured with appropriate profiles
- Node.js 20+ installed
- CDK CLI installed globally

## Setup

### 1. Bootstrap Accounts

**CI/CD Account (642244225184):**
```bash
cdk bootstrap aws://642244225184/eu-central-1 --profile velliv-sb-bala
```

**Workload Account (685385421611):**
```bash
cdk bootstrap aws://685385421611/eu-central-1 --profile velliv-sb-arch \
  --trust 642244225184 --trust-for-lookup 642244225184 \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

### 2. Deploy Pipeline

```bash
cdk deploy TypeScriptLambdaPipeline --profile velliv-sb-bala
```

## Development Workflow

1. **Make changes** to your code
2. **Commit and push** to `main` branch
3. **Pipeline automatically**:
   - Pulls code from GitHub
   - Installs dependencies (`npm ci`)
   - Runs tests (`npm run test`)
   - Builds TypeScript (`npm run build`)
   - Synthesizes CDK (`npm run synth`)
   - Deploys to workload account

## Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm run test

# Synthesize CDK templates
npm run synth
```

## API Endpoints

After deployment, the Lambda function is accessible via API Gateway:
- **Endpoint**: Check AWS Console → API Gateway → LambdaApi
- **Method**: GET (returns JSON response with message and requestId)

## Monitoring

- **CloudWatch Logs**: `/aws/lambda/TypeScriptLambdaStack-TypeScriptLambda*`
- **CloudWatch Metrics**: Lambda function metrics in workload account
- **Pipeline Status**: CodePipeline console in CI/CD account

## Troubleshooting

### Pipeline Fails
- Check CodeBuild logs in CI/CD account
- Verify GitHub connection is active
- Ensure all IAM roles have proper permissions

### Lambda Fails
- Check CloudWatch logs in workload account
- Verify handler path matches compiled output
- Test function manually in Lambda console

## Security

- Cross-account roles use least privilege principles
- CDK bootstrap roles handle secure deployments
- No hardcoded credentials in code
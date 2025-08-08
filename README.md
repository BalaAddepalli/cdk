# TypeScript Lambda CI/CD Project

AWS TypeScript Lambda function with cross-account CI/CD deployment using CodePipeline.

## Architecture

- **CI/CD Account**: `642244225184` - Hosts CodePipeline
- **Workload Account**: `685385421611` - Hosts Lambda function
- **Source**: GitHub repository `BalaAddepalli/cdk`

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Deploy Pipeline** (in CI/CD account)
   ```bash
   cdk bootstrap
   cdk deploy TypeScriptLambdaPipeline
   ```

3. **Deploy Lambda** (in workload account)
   ```bash
   cdk deploy TypeScriptLambdaStack
   ```

## Project Structure

```
├── src/lambda/          # TypeScript Lambda code
├── infrastructure/      # CDK stacks
├── scripts/            # Deployment scripts
├── tests/              # Unit tests
└── buildspec.yml       # CodeBuild configuration
```

## Development

- **Build**: `npm run build`
- **Test**: `npm run test`
- **Deploy**: `npm run deploy`
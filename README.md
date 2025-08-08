# TypeScript Lambda CI/CD Project

AWS TypeScript Lambda function with cross-account CI/CD deployment using CodePipeline.

## Architecture

- **CI/CD Account**: `642244225184` - Hosts CodePipeline
- **Workload Account**: `685385421611` - Hosts Lambda function
- **Source**: GitHub repository `BalaAddepalli/cdk`

## Setup

1. **Create GitHub Personal Access Token**
   ```bash
   aws secretsmanager create-secret --name github-token --secret-string "your-token"
   ```

2. **Setup Cross-Account Role** (in workload account)
   ```bash
   ./scripts/setup-cross-account-role.sh
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Deploy Pipeline** (in CI/CD account)
   ```bash
   cdk bootstrap
   cdk deploy TypeScriptLambdaPipeline
   ```

5. **Deploy Lambda** (in workload account)
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
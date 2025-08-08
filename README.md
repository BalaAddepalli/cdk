# TypeScript Lambda CI/CD Project

A production-ready TypeScript Lambda function with automated CI/CD pipeline using AWS CDK, implementing AWS Well-Architected Framework principles.

## 🏗️ Architecture Overview

- **CI/CD Account**: 642244225184 (hosts the pipeline)
- **Workload Account**: 685385421611 (hosts the Lambda function)
- **Pipeline**: Automatically deploys on push to `main` branch
- **Runtime**: Node.js 22.x (latest), ARM64 architecture
- **Monitoring**: CloudWatch Dashboard, Alarms, X-Ray tracing

## 📁 Project Structure

```
├── src/
│   └── lambda/
│       └── handler.ts          # Lambda function code
├── infrastructure/
│   ├── lambda-stack.ts         # Lambda and API Gateway resources
│   └── pipeline-stack.ts       # CI/CD pipeline resources
├── docs/                       # Comprehensive documentation
│   ├── architecture/           # Architecture documentation
│   ├── security/              # Security documentation
│   ├── operations/            # Operations documentation
│   └── diagrams/              # Architecture diagrams
├── buildspec.yml              # CodeBuild build specification
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── cdk.json                  # CDK configuration
```

## 🚀 Quick Start

### Prerequisites
- AWS CLI configured with appropriate profiles
- Node.js 22+ installed
- CDK CLI installed globally

### Deployment
```bash
# Install dependencies
npm install

# Deploy pipeline (one-time setup)
cdk deploy TypeScriptLambdaPipeline --profile velliv-sb-bala

# Development workflow: just push to main
git push origin main
```

## 📊 Features & Benefits

### Performance Optimization
- ✅ **ARM64 Architecture**: 20% better price/performance
- ✅ **Node.js 22**: Latest runtime with performance improvements
- ✅ **Optimized Memory**: 256MB for better price/performance ratio
- ✅ **Connection Reuse**: HTTP connection pooling enabled
- ✅ **API Gateway Caching**: 5-minute TTL for better response times

### Cost Optimization
- ✅ **Reserved Concurrency**: Prevents runaway costs (max 10 concurrent)
- ✅ **Log Retention**: 1 week retention policy
- ✅ **ARM64**: Lower compute costs
- ✅ **Efficient Caching**: Reduces Lambda invocations

### Security
- ✅ **Cross-Account Deployment**: Separation of CI/CD and workload
- ✅ **IAM Least Privilege**: Minimal required permissions
- ✅ **API Gateway Security**: CORS, resource policies, IP restrictions
- ✅ **No Hardcoded Secrets**: Environment-based configuration
- ✅ **X-Ray Tracing**: Security monitoring and debugging

### Reliability
- ✅ **Automated Testing**: Unit tests in CI/CD pipeline
- ✅ **CloudWatch Monitoring**: Comprehensive metrics and alarms
- ✅ **Error Handling**: Structured error responses
- ✅ **Structured Logging**: JSON-based logging for better observability

### Operational Excellence
- ✅ **Infrastructure as Code**: CDK for reproducible deployments
- ✅ **Automated CI/CD**: GitHub integration with CodePipeline
- ✅ **Monitoring Dashboard**: Real-time operational insights
- ✅ **Comprehensive Documentation**: Multi-stakeholder documentation

## 📚 Documentation

### For Different Stakeholders
- **[Cloud Architect](docs/architecture/cloud-architect.md)**: Architecture decisions and patterns
- **[CISO](docs/security/ciso-security-overview.md)**: Security controls and compliance
- **[Privacy Manager](docs/security/privacy-data-protection.md)**: Data protection and privacy
- **[Head of IT Operations](docs/operations/it-operations-guide.md)**: Operational procedures and monitoring
- **[Head of Architecture](docs/architecture/enterprise-architecture.md)**: Enterprise architecture alignment

### Technical Documentation
- **[Architecture Diagrams](docs/diagrams/)**: Visual system architecture
- **[Security Controls](docs/security/)**: Detailed security documentation
- **[Operations Runbook](docs/operations/)**: Day-to-day operations guide

## 🔗 API Endpoints

After deployment, access the Lambda function via:
- **Endpoint**: `https://{api-id}.execute-api.eu-central-1.amazonaws.com/prod/hello`
- **Method**: GET
- **Response**: JSON with message, requestId, and timestamp

## 📈 Monitoring & Observability

- **CloudWatch Dashboard**: Real-time metrics visualization
- **CloudWatch Alarms**: Error rate and duration monitoring
- **X-Ray Tracing**: Request flow analysis
- **Structured Logging**: JSON logs for easy querying
- **API Gateway Metrics**: Request count, latency, errors

## 🛠️ Development Workflow

1. **Make changes** to your code
2. **Commit and push** to `main` branch
3. **Pipeline automatically**:
   - Pulls code from GitHub
   - Installs dependencies
   - Runs tests
   - Builds TypeScript
   - Deploys to workload account
   - Updates monitoring

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm run test

# Synthesize CDK templates
npm run synth

# Deploy locally (for testing)
cdk deploy TypeScriptLambdaStack --profile velliv-sb-arch
```

## 🚨 Troubleshooting

### Pipeline Issues
- Check CodeBuild logs in CI/CD account
- Verify GitHub connection status
- Ensure IAM roles have proper permissions

### Lambda Issues
- Check CloudWatch logs: `/aws/lambda/TypeScriptLambdaStack-TypeScriptLambda*`
- Use X-Ray for performance debugging
- Test function manually in Lambda console

### API Gateway Issues
- Check API Gateway logs in CloudWatch
- Verify CORS configuration
- Test endpoints with proper headers

## 🏛️ AWS Well-Architected Framework Alignment

This project implements all six pillars of the AWS Well-Architected Framework:

1. **Operational Excellence**: Automated CI/CD, monitoring, documentation
2. **Security**: Cross-account deployment, IAM least privilege, encryption
3. **Reliability**: Error handling, monitoring, automated recovery
4. **Performance Efficiency**: ARM64, latest runtime, caching, optimized memory
5. **Cost Optimization**: Reserved concurrency, ARM64, log retention, caching
6. **Sustainability**: ARM64 for lower carbon footprint, efficient resource usage

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review CloudWatch logs and metrics
- Consult the stakeholder-specific documentation in `/docs`
- Use X-Ray traces for performance analysis

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintained By**: DevOps Team
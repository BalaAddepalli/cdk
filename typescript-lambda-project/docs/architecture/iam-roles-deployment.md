# IAM Roles for Cross-Account Deployment

## Overview

This document details **only the IAM roles required for deployment** across the CI/CD and workload accounts. Runtime roles (Lambda execution, etc.) are not covered here.

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│ CI/CD Account (642244225184)                           │
│ ┌─────────────────┐    ┌─────────────────┐             │
│ │   CodePipeline  │    │   CodeBuild     │             │
│ │                 │    │                 │             │
│ │ Pipeline Role   │    │ Deploy Role     │             │
│ └─────────────────┘    └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Cross-Account
                           │ AssumeRole
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Workload Account (685385421611)                        │
│ ┌─────────────────┐    ┌─────────────────┐             │
│ │ CDK Bootstrap   │    │ CDK Bootstrap   │             │
│ │                 │    │                 │             │
│ │ Deploy Role     │    │ File Pub Role   │             │
│ └─────────────────┘    └─────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

## CDK Bootstrap Roles (Workload Account)

CDK bootstrap creates **5 roles** with the `cdk-hnb659fds` prefix:

### 1. CDK Deploy Role
**Role Name**: `cdk-hnb659fds-deploy-role-685385421611-eu-central-1`
**Account**: 685385421611 (Workload)
**Purpose**: Deploys CloudFormation stacks and creates AWS resources (deployment-time only)

#### Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::642244225184:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "hnb659fds"
        }
      }
    },
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudformation.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Deployment Permissions (Resource Creation Only)
- **CloudFormation**: Create/update/delete stacks
- **IAM**: Create service roles for deployed resources
- **Lambda**: Create/update function definitions (not execute)
- **API Gateway**: Create/configure API resources (not invoke)
- **CloudWatch**: Create dashboards, alarms, log groups (not write logs)
- **X-Ray**: Enable tracing configuration (not write traces)
- **S3**: Access CDK bootstrap assets

**Note**: These permissions are for **deploying/creating** resources, not **running** them.

### 2. CDK File Publishing Role
**Role Name**: `cdk-hnb659fds-file-publishing-role-685385421611-eu-central-1`
**Account**: 685385421611 (Workload)
**Purpose**: Publishes CDK assets (Lambda code, templates) to S3

#### Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::642244225184:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "hnb659fds"
        }
      }
    }
  ]
}
```

#### Permissions
- **S3**: Upload/manage CDK assets in bootstrap bucket
- **KMS**: Encrypt/decrypt assets

### 3. CDK Image Publishing Role
**Role Name**: `cdk-hnb659fds-image-publishing-role-685385421611-eu-central-1`
**Purpose**: Publishes Docker images to ECR (not used in this Lambda project)
**Used By**: CDK for container-based deployments

### 4. CDK Lookup Role
**Role Name**: `cdk-hnb659fds-lookup-role-685385421611-eu-central-1`
**Purpose**: Performs context lookups during CDK synthesis
**Used By**: CDK CLI for environment discovery

#### Permissions
- **EC2**: Describe VPCs, subnets, security groups
- **Route53**: List hosted zones
- **SSM**: Get parameters

### 5. CDK CloudFormation Execution Role
**Role Name**: `cdk-hnb659fds-cfn-exec-role-685385421611-eu-central-1`
**Purpose**: CloudFormation service role for stack operations
**Used By**: CloudFormation service during stack deployment

## CI/CD Account Roles (642244225184)

### 1. CodePipeline Service Role
**Role Name**: `TypeScriptLambdaPipeline-Pipeline-ServiceRole`
**Account**: 642244225184 (CI/CD)
**Purpose**: Orchestrates the CI/CD pipeline

#### Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codepipeline.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Permissions
- **S3**: Access pipeline artifacts bucket
- **CodeBuild**: Start/stop build projects
- **CodeConnections**: Access GitHub repository
- **CloudWatch**: Write logs and metrics
- **KMS**: Encrypt/decrypt pipeline artifacts

### 2. CodeBuild Deploy Role
**Role Name**: `TypeScriptLambdaPipeline-DeployProject-ServiceRole`
**Account**: 642244225184 (CI/CD)
**Purpose**: Deploys to workload account via cross-account roles

#### Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Cross-Account Assume Role Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Resource": [
        "arn:aws:iam::685385421611:role/cdk-hnb659fds-deploy-role-685385421611-eu-central-1",
        "arn:aws:iam::685385421611:role/cdk-hnb659fds-file-publishing-role-685385421611-eu-central-1"
      ]
    }
  ]
}
```

## Bootstrap Process

### 1. Workload Account Bootstrap
```bash
# Bootstrap workload account with CI/CD account trust
cdk bootstrap aws://685385421611/eu-central-1 \
  --profile velliv-sb-arch \
  --trust 642244225184 \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

**Creates**:
- CDK Deploy Role with trust to CI/CD account
- CDK File Publishing Role
- S3 bucket for CDK assets
- KMS key for encryption

### 2. CI/CD Account Bootstrap
```bash
# Bootstrap CI/CD account (self-trust)
cdk bootstrap aws://642244225184/eu-central-1 \
  --profile velliv-sb-bala
```

**Creates**:
- Standard CDK bootstrap resources
- S3 bucket for pipeline artifacts

## Deployment Flow

### Cross-Account Deployment Process
```
1. CodePipeline (CI/CD) → Triggers CodeBuild
2. CodeBuild (CI/CD) → AssumeRole → CDK Deploy Role (Workload)
3. CDK Deploy Role → Creates/Updates CloudFormation Stack
4. CloudFormation → Creates AWS resources (Lambda, API Gateway, etc.)
5. CodeBuild (CI/CD) → AssumeRole → CDK File Publishing Role (Workload)
6. File Publishing Role → Uploads Lambda code to S3
```

## Security Controls

### 1. External ID Protection
- **External ID**: `hnb659fds` (CDK-generated)
- **Purpose**: Prevents confused deputy attacks
- **Usage**: Required for all cross-account role assumptions

### 2. Least Privilege Access
- **Deploy Role**: Only CloudFormation and resource management
- **File Publishing**: Only S3 asset operations
- **Pipeline Role**: Only pipeline orchestration
- **CodeBuild Role**: Only deployment operations

## Troubleshooting Deployment Issues

### Common Bootstrap Issues
**Symptoms**: CDK deployment fails with missing roles
**Resolution**:
```bash
# Re-bootstrap with correct trust
cdk bootstrap aws://685385421611/eu-central-1 \
  --profile velliv-sb-arch \
  --trust 642244225184 \
  --force
```

### Cross-Account Role Assumption Failures
**Symptoms**: `AccessDenied` during deployment
**Resolution**:
```bash
# Verify trust policy
aws iam get-role --role-name cdk-hnb659fds-deploy-role-685385421611-eu-central-1 \
  --profile velliv-sb-arch
```

## Deployment Role ARNs

### CI/CD Account (642244225184)
```
Pipeline Role:
arn:aws:iam::642244225184:role/TypeScriptLambdaPipeline-Pipeline-ServiceRole

Deploy Role:
arn:aws:iam::642244225184:role/TypeScriptLambdaPipeline-DeployProject-ServiceRole
```

### Workload Account (685385421611)
```
CDK Deploy Role:
arn:aws:iam::685385421611:role/cdk-hnb659fds-deploy-role-685385421611-eu-central-1

CDK File Publishing Role:
arn:aws:iam::685385421611:role/cdk-hnb659fds-file-publishing-role-685385421611-eu-central-1

CDK Image Publishing Role:
arn:aws:iam::685385421611:role/cdk-hnb659fds-image-publishing-role-685385421611-eu-central-1

CDK Lookup Role:
arn:aws:iam::685385421611:role/cdk-hnb659fds-lookup-role-685385421611-eu-central-1

CDK CloudFormation Execution Role:
arn:aws:iam::685385421611:role/cdk-hnb659fds-cfn-exec-role-685385421611-eu-central-1
```

---

**Document Version**: 1.0
**Last Updated**: $(date)
**Focus**: Deployment roles only (excludes runtime workload roles)
**Owner**: DevOps Team
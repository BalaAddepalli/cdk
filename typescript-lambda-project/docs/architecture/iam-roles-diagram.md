# IAM Roles and Policies - Diagrammatic Representation

## Complete Roles and Policies Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ CI/CD Account (642244225184)                                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────┐         ┌─────────────────────────┐               │
│  │     CodePipeline        │         │      CodeBuild          │               │
│  │                         │         │                         │               │
│  │  Pipeline-ServiceRole   │────────▶│  DeployProject-         │               │
│  │                         │         │  ServiceRole            │               │
│  │  Permissions:           │         │                         │               │
│  │  • S3 (artifacts)       │         │  Cross-Account Policy:  │               │
│  │  • CodeBuild (trigger)  │         │  • AssumeRole →         │               │
│  │  • CodeConnections      │         │    Workload Account     │               │
│  │  • CloudWatch (logs)    │         │                         │               │
│  └─────────────────────────┘         └─────────────────────────┘               │
│                                                │                                │
└────────────────────────────────────────────────┼────────────────────────────────┘
                                                 │
                                                 │ sts:AssumeRole
                                                 │ (External ID: hnb659fds)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Workload Account (685385421611) - CDK Bootstrap Roles                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │   Deploy Role       │  │ File Publishing     │  │   Lookup Role       │     │
│  │                     │  │ Role                │  │                     │     │
│  │ Permissions:        │  │                     │  │ Permissions:        │     │
│  │ • CloudFormation    │  │ Permissions:        │  │ • EC2 (describe)    │     │
│  │ • IAM (create)      │  │ • S3 (upload)       │  │ • Route53 (list)    │     │
│  │ • Lambda (create)   │  │ • KMS (encrypt)     │  │ • SSM (get params)  │     │
│  │ • API Gateway       │  │                     │  │                     │     │
│  │ • CloudWatch        │  │ Trust Policy:       │  │ Trust Policy:       │     │
│  │ • S3 (assets)       │  │ • CI/CD Account     │  │ • CI/CD Account     │     │
│  │                     │  │ • External ID       │  │ • External ID       │     │
│  │ Trust Policy:       │  │                     │  │                     │     │
│  │ • CI/CD Account     │  └─────────────────────┘  └─────────────────────┘     │
│  │ • CloudFormation    │                                                       │
│  │ • External ID       │                                                       │
│  └─────────────────────┘                                                       │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐                             │
│  │ Image Publishing    │  │ CloudFormation      │                             │
│  │ Role                │  │ Execution Role      │                             │
│  │                     │  │                     │                             │
│  │ Purpose:            │  │ Purpose:            │                             │
│  │ • ECR (not used)    │  │ • CFN operations    │                             │
│  │                     │  │                     │                             │
│  │ Trust Policy:       │  │ Trust Policy:       │                             │
│  │ • CI/CD Account     │  │ • CloudFormation    │                             │
│  │ • External ID       │  │ • CI/CD Account     │                             │
│  └─────────────────────┘  └─────────────────────┘                             │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Role Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Deployment Process Flow                                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. GitHub Push                                                                 │
│     │                                                                           │
│     ▼                                                                           │
│  2. CodePipeline (Pipeline-ServiceRole)                                        │
│     │ • Pulls from GitHub                                                       │
│     │ • Triggers CodeBuild                                                      │
│     ▼                                                                           │
│  3. CodeBuild (DeployProject-ServiceRole)                                      │
│     │ • Builds application                                                      │
│     │ • Assumes cross-account roles                                             │
│     ▼                                                                           │
│  4. Cross-Account Role Assumption                                               │
│     │                                                                           │
│     ├─── AssumeRole ──▶ CDK Deploy Role ──▶ CloudFormation                    │
│     │                   │                    │                                 │
│     │                   │                    ▼                                 │
│     │                   │                 Creates:                             │
│     │                   │                 • Lambda Function                    │
│     │                   │                 • API Gateway                        │
│     │                   │                 • CloudWatch Resources               │
│     │                   │                 • IAM Roles (runtime)                │
│     │                   │                                                      │
│     └─── AssumeRole ──▶ CDK File Publishing Role ──▶ S3                       │
│                         │                             │                       │
│                         │                             ▼                       │
│                         │                          Uploads:                   │
│                         │                          • Lambda Code              │
│                         │                          • CDK Assets               │
│                         │                                                     │
│                         └─── Uses ──▶ CDK Lookup Role ──▶ Environment Info   │
│                                       │                    │                  │
│                                       │                    ▼                  │
│                                       │                 Discovers:            │
│                                       │                 • VPC Info            │
│                                       │                 • Existing Resources  │
│                                       │                                       │
│                                       └─── Delegates ──▶ CFN Execution Role  │
│                                                           │                   │
│                                                           ▼                   │
│                                                        Executes:              │
│                                                        • Stack Operations     │
│                                                        • Resource Updates     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Trust Relationships Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Trust Relationships and External ID Requirements                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Role Name                    │ Trusted By              │ External ID Required  │
│  ────────────────────────────────────────────────────────────────────────────  │
│  Pipeline-ServiceRole         │ codepipeline.amazonaws  │ No                    │
│  DeployProject-ServiceRole    │ codebuild.amazonaws     │ No                    │
│  ────────────────────────────────────────────────────────────────────────────  │
│  cdk-deploy-role              │ CI/CD Account (642...)  │ Yes (hnb659fds)       │
│                               │ cloudformation.aws      │ No                    │
│  ────────────────────────────────────────────────────────────────────────────  │
│  cdk-file-publishing-role     │ CI/CD Account (642...)  │ Yes (hnb659fds)       │
│  ────────────────────────────────────────────────────────────────────────────  │
│  cdk-image-publishing-role    │ CI/CD Account (642...)  │ Yes (hnb659fds)       │
│  ────────────────────────────────────────────────────────────────────────────  │
│  cdk-lookup-role              │ CI/CD Account (642...)  │ Yes (hnb659fds)       │
│  ────────────────────────────────────────────────────────────────────────────  │
│  cdk-cfn-exec-role            │ cloudformation.aws      │ No                    │
│                               │ CI/CD Account (642...)  │ Yes (hnb659fds)       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Permissions Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Role Permissions Summary                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Service/Resource     │ Deploy │ File   │ Image  │ Lookup │ CFN    │ Pipeline │
│                       │ Role   │ Pub    │ Pub    │ Role   │ Exec   │ Role     │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  CloudFormation       │   ✓    │        │        │        │   ✓    │          │
│  IAM                  │   ✓    │        │        │        │   ✓    │          │
│  Lambda               │   ✓    │        │        │        │   ✓    │          │
│  API Gateway          │   ✓    │        │        │        │   ✓    │          │
│  CloudWatch           │   ✓    │        │        │        │   ✓    │   ✓      │
│  X-Ray                │   ✓    │        │        │        │   ✓    │          │
│  S3 (Bootstrap)       │   ✓    │   ✓    │        │        │        │   ✓      │
│  S3 (Pipeline)        │        │        │        │        │        │   ✓      │
│  KMS                  │   ✓    │   ✓    │        │        │        │   ✓      │
│  ECR                  │        │        │   ✓    │        │        │          │
│  EC2 (Describe)       │        │        │        │   ✓    │        │          │
│  Route53              │        │        │        │   ✓    │        │          │
│  SSM                  │        │        │        │   ✓    │        │          │
│  CodeBuild            │        │        │        │        │        │   ✓      │
│  CodeConnections      │        │        │        │        │        │   ✓      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Security Controls Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Security Controls and Boundaries                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Account Boundary (642244225184 → 685385421611)                         │   │
│  │                                                                         │   │
│  │  External ID: hnb659fds                                                 │   │
│  │  ├─ Prevents Confused Deputy Attack                                     │   │
│  │  ├─ Required for all cross-account assumptions                          │   │
│  │  └─ CDK-generated unique identifier                                     │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Least Privilege Principle                                               │   │
│  │                                                                         │   │
│  │  Deploy Role:        Only resource creation (not execution)            │   │
│  │  File Pub Role:      Only S3 uploads (not downloads)                   │   │
│  │  Lookup Role:        Only read operations (no modifications)           │   │
│  │  Pipeline Role:      Only pipeline operations (no direct AWS access)   │   │
│  │  CodeBuild Role:     Only cross-account assumptions (no direct access) │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Separation of Concerns                                                  │   │
│  │                                                                         │   │
│  │  CI/CD Account:      Pipeline orchestration only                       │   │
│  │  Workload Account:   Resource hosting and management                   │   │
│  │  Bootstrap Roles:    Deployment-time operations only                   │   │
│  │  Runtime Roles:      Application execution only (not documented here)  │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0
**Last Updated**: $(date)
**Purpose**: Visual representation of all deployment roles and their relationships
**Owner**: DevOps Team
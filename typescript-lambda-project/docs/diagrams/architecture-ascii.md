# Architecture Diagrams (ASCII Format)

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    TypeScript Lambda CI/CD System Architecture                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────────────┐
│   Developer     │    │      CI/CD Account          │    │    Workload Account         │
│   Environment   │    │    (642244225184)           │    │    (685385421611)           │
│                 │    │                             │    │                             │
│  ┌───────────┐  │    │  ┌─────────────────────┐    │    │  ┌─────────────────────┐    │
│  │  GitHub   │──┼────┼─→│    CodePipeline     │────┼────┼─→│   Lambda Function   │    │
│  │Repository │  │    │  │                     │    │    │  │  (Node.js 22/ARM64) │    │
│  └───────────┘  │    │  └─────────────────────┘    │    │  └─────────────────────┘    │
│                 │    │                             │    │            │                │
│                 │    │  ┌─────────────────────┐    │    │            ▼                │
│                 │    │  │    CodeBuild        │    │    │  ┌─────────────────────┐    │
│                 │    │  │   Build & Deploy    │    │    │  │    API Gateway      │    │
│                 │    │  └─────────────────────┘    │    │  │    (REST API)       │    │
│                 │    │                             │    │  └─────────────────────┘    │
│                 │    │  ┌─────────────────────┐    │    │            │                │
│                 │    │  │   S3 Artifacts      │    │    │            ▼                │
│                 │    │  │     Bucket          │    │    │  ┌─────────────────────┐    │
│                 │    │  └─────────────────────┘    │    │  │   CloudWatch        │    │
│                 │    │                             │    │  │ Logs & Monitoring   │    │
│                 │    │                             │    │  └─────────────────────┘    │
└─────────────────┘    └─────────────────────────────┘    └─────────────────────────────┘
        │                           │                                    │
        │                           │                                    │
        ▼                           ▼                                    ▼
   git push                   Cross-Account                        API Requests
   (main branch)              IAM Roles                          (HTTPS/JSON)
```

## CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD Pipeline Flow                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

Developer Push → GitHub Webhook → CodePipeline → CodeBuild (Build) → CodeBuild (Deploy)
      │               │                │               │                    │
      │               │                │               │                    │
      ▼               ▼                ▼               ▼                    ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐   ┌─────────────────┐
│   Git    │   │ Webhook  │   │Pipeline  │   │Build Steps:  │   │Deploy Steps:    │
│ Commit   │   │Triggered │   │ Started  │   │• npm ci      │   │• Assume Role    │
│          │   │          │   │          │   │• npm test    │   │• cdk deploy     │
│          │   │          │   │          │   │• npm build   │   │• Update Lambda  │
│          │   │          │   │          │   │• cdk synth   │   │• Update API GW  │
└──────────┘   └──────────┘   └──────────┘   └──────────────┘   └─────────────────┘
      │               │                │               │                    │
      └───────────────┼────────────────┼───────────────┼────────────────────┘
                      │                │               │
                      ▼                ▼               ▼
                 ~30 seconds      ~2 minutes      ~3 minutes
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   Production    │
                                              │    Lambda       │
                                              │   Function      │
                                              └─────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              Security Architecture                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

Internet Users                CI/CD Account                    Workload Account
      │                           │                                 │
      │ HTTPS/TLS                 │ Cross-Account                   │
      │                           │ IAM Roles                       │
      ▼                           ▼                                 ▼
┌──────────┐                ┌──────────┐                     ┌──────────┐
│   API    │◄──────────────►│CodeBuild │────────────────────►│ Lambda   │
│ Gateway  │   Resource     │   Role   │   Assume Role       │   Role   │
│          │   Policies     │          │   (External ID)     │          │
└──────────┘                └──────────┘                     └──────────┘
      │                           │                                 │
      │ CORS                      │ Least Privilege                 │ CloudWatch
      │ Rate Limiting             │ Temporary Creds                 │ Logs Only
      │ IP Restrictions           │ Audit Logging                   │
      ▼                           ▼                                 ▼
┌──────────┐                ┌──────────┐                     ┌──────────┐
│Security  │                │Pipeline  │                     │   X-Ray  │
│Controls: │                │Security: │                     │ Tracing  │
│• WAF     │                │• GitHub  │                     │          │
│• Shield  │                │• S3 Enc  │                     │          │
│• Certs   │                │• KMS     │                     │          │
└──────────┘                └──────────┘                     └──────────┘
```

## Network Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               Network Flow                                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

External User Request Flow:
┌─────────┐    HTTPS     ┌─────────────┐    Invoke    ┌─────────────┐
│  User   │─────────────►│API Gateway  │─────────────►│   Lambda    │
│         │              │             │              │  Function   │
└─────────┘              └─────────────┘              └─────────────┘
                                │                            │
                                │ Logs                       │ Logs
                                ▼                            ▼
                         ┌─────────────┐              ┌─────────────┐
                         │ CloudWatch  │              │   X-Ray     │
                         │    Logs     │              │  Tracing    │
                         └─────────────┘              └─────────────┘

CI/CD Deployment Flow:
┌─────────┐   Webhook   ┌─────────────┐   Artifacts  ┌─────────────┐
│ GitHub  │────────────►│CodePipeline │─────────────►│ CodeBuild   │
│         │             │             │              │   Deploy    │
└─────────┘             └─────────────┘              └─────────────┘
                                                            │
                                                            │ Cross-Account
                                                            │ Deployment
                                                            ▼
                                                     ┌─────────────┐
                                                     │ CloudForm   │
                                                     │   Stack     │
                                                     └─────────────┘
```

## Monitoring and Observability

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        Monitoring and Observability                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

Application Layer:
┌─────────────┐    Metrics    ┌─────────────┐    Alarms    ┌─────────────┐
│   Lambda    │──────────────►│ CloudWatch  │─────────────►│   SNS       │
│  Function   │               │   Metrics   │              │Notifications│
└─────────────┘               └─────────────┘              └─────────────┘
       │                             │                            │
       │ Logs                        │ Dashboard                  │ Alerts
       ▼                             ▼                            ▼
┌─────────────┐               ┌─────────────┐              ┌─────────────┐
│ CloudWatch  │               │   Visual    │              │ Operations  │
│    Logs     │               │ Dashboard   │              │    Team     │
└─────────────┘               └─────────────┘              └─────────────┘

Infrastructure Layer:
┌─────────────┐    Traces     ┌─────────────┐   Analysis   ┌─────────────┐
│API Gateway  │──────────────►│    X-Ray    │─────────────►│Performance  │
│             │               │   Service   │              │  Insights   │
└─────────────┘               └─────────────┘              └─────────────┘

Key Metrics Monitored:
• Lambda: Invocations, Duration, Errors, Throttles
• API Gateway: Request Count, Latency, 4XX/5XX Errors
• System: Memory Usage, Cold Starts, Concurrent Executions
```

## Cost Optimization Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           Cost Optimization                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘

Compute Optimization:
┌─────────────┐    20% Less    ┌─────────────┐    Optimal    ┌─────────────┐
│    ARM64    │──────────────►│    Cost     │──────────────►│   256MB     │
│Architecture │               │  Reduction  │               │   Memory    │
└─────────────┘               └─────────────┘               └─────────────┘

Storage Optimization:
┌─────────────┐    7 Days     ┌─────────────┐   Automatic   ┌─────────────┐
│ CloudWatch  │──────────────►│ Retention   │──────────────►│   Cleanup   │
│    Logs     │               │   Policy    │               │             │
└─────────────┘               └─────────────┘               └─────────────┘

Concurrency Control:
┌─────────────┐   Reserved    ┌─────────────┐   Prevents    ┌─────────────┐
│   Lambda    │──────────────►│Concurrency  │──────────────►│  Runaway    │
│  Function   │      10       │   Limit     │               │   Costs     │
└─────────────┘               └─────────────┘               └─────────────┘

Monthly Cost Breakdown:
┌─────────────────────────────────────────┐
│ Service          │ Cost Range          │
├─────────────────────────────────────────┤
│ Lambda Compute   │ $5-15/month         │
│ API Gateway      │ $3-10/month         │
│ CloudWatch       │ $1-3/month          │
│ X-Ray Tracing    │ $1-2/month          │
│ Data Transfer    │ $1-2/month          │
├─────────────────────────────────────────┤
│ Total            │ $11-32/month        │
│ vs Traditional   │ $200+/month (85%↓)  │
└─────────────────────────────────────────┘
```

## Well-Architected Framework Alignment

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    AWS Well-Architected Framework                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Operational    │  │    Security     │  │  Reliability    │  │  Performance    │
│   Excellence    │  │                 │  │                 │  │   Efficiency    │
│                 │  │                 │  │                 │  │                 │
│ • IaC (CDK)     │  │ • IAM Roles     │  │ • Auto Scaling  │  │ • ARM64 Arch    │
│ • CI/CD Auto    │  │ • Encryption    │  │ • Error Handle  │  │ • Node.js 22    │
│ • Monitoring    │  │ • Audit Logs    │  │ • Health Checks │  │ • Caching       │
│ • Documentation │  │ • Least Priv    │  │ • Rollback      │  │ • Memory Opt    │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│      Cost       │  │ Sustainability  │
│  Optimization   │  │                 │
│                 │  │                 │
│ • ARM64 (20%↓)  │  │ • ARM64 Arch    │
│ • Serverless    │  │ • Efficient     │
│ • Right-sizing  │  │ • Auto Scaling  │
│ • Reserved Conc │  │ • Minimal Waste │
└─────────────────┘  └─────────────────┘
```

---

**Note**: These ASCII diagrams provide a text-based representation of the system architecture. For detailed visual diagrams, use the Draw.io files or create them using your preferred diagramming tool.

**Last Updated**: $(date)
**Format**: ASCII Art
**Maintained By**: Architecture Team
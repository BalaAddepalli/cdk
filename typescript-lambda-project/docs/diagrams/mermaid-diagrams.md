# Architecture Diagrams (Mermaid Format)

## System Architecture

```mermaid
graph TB
    subgraph "Developer Environment"
        DEV[Developer]
        GH[GitHub Repository]
        DEV --> GH
    end
    
    subgraph "CI/CD Account (642244225184)"
        CP[CodePipeline]
        CB1[CodeBuild Build]
        CB2[CodeBuild Deploy]
        S3[S3 Artifacts]
        
        GH -->|webhook| CP
        CP --> CB1
        CB1 --> S3
        CB1 --> CB2
    end
    
    subgraph "Workload Account (685385421611)"
        LF[Lambda Function<br/>Node.js 22 ARM64]
        AG[API Gateway]
        CW[CloudWatch]
        XR[X-Ray Tracing]
        
        CB2 -->|CDK Deploy| LF
        AG --> LF
        LF --> CW
        LF --> XR
    end
    
    USER[API Users] --> AG
    
    classDef devEnv fill:#e1d5e7,stroke:#9673a6
    classDef cicdEnv fill:#fff2cc,stroke:#d6b656
    classDef workloadEnv fill:#f5f5f5,stroke:#666666
    classDef awsService fill:#dae8fc,stroke:#6c8ebf
    classDef appService fill:#d5e8d4,stroke:#82b366
    
    class DEV,GH devEnv
    class CP,CB1,CB2,S3 cicdEnv
    class LF,AG,CW,XR workloadEnv
```

## CI/CD Pipeline Flow

```mermaid
flowchart LR
    subgraph "Source Stage"
        A[Git Push] --> B[GitHub Webhook]
    end
    
    subgraph "Build Stage"
        C[CodeBuild Start]
        D[npm ci]
        E[npm test]
        F[npm run build]
        G[cdk synth]
        H[Store Artifacts]
        
        C --> D --> E --> F --> G --> H
    end
    
    subgraph "Deploy Stage"
        I[CodeBuild Deploy]
        J[Assume Cross-Account Role]
        K[cdk deploy]
        L[Update Lambda]
        
        I --> J --> K --> L
    end
    
    subgraph "Verification"
        M[Health Check]
        N[Smoke Tests]
        O[Monitor Metrics]
        
        L --> M --> N --> O
    end
    
    B --> C
    H --> I
    
    classDef sourceStage fill:#e1d5e7,stroke:#9673a6
    classDef buildStage fill:#fff2cc,stroke:#d6b656
    classDef deployStage fill:#d5e8d4,stroke:#82b366
    classDef verifyStage fill:#f8cecc,stroke:#b85450
    
    class A,B sourceStage
    class C,D,E,F,G,H buildStage
    class I,J,K,L deployStage
    class M,N,O verifyStage
```

## Security Architecture

```mermaid
graph TB
    subgraph "External Access"
        USER[API Users]
        INTERNET[Internet]
    end
    
    subgraph "Security Layers"
        WAF[Web Application Firewall]
        CORS[CORS Policies]
        RATE[Rate Limiting]
        IP[IP Restrictions]
    end
    
    subgraph "API Gateway Security"
        AG[API Gateway]
        RP[Resource Policies]
        TLS[TLS Encryption]
    end
    
    subgraph "Lambda Security"
        LF[Lambda Function]
        IAM[IAM Execution Role]
        VPC[VPC Optional]
    end
    
    subgraph "Cross-Account Security"
        CICD[CI/CD Account]
        ROLE[Cross-Account Role]
        EID[External ID]
        TEMP[Temporary Credentials]
    end
    
    subgraph "Monitoring Security"
        CT[CloudTrail]
        CW[CloudWatch Logs]
        XR[X-Ray Tracing]
        ALARM[Security Alarms]
    end
    
    USER --> INTERNET
    INTERNET --> WAF
    WAF --> CORS
    CORS --> RATE
    RATE --> IP
    IP --> AG
    AG --> RP
    AG --> TLS
    TLS --> LF
    LF --> IAM
    LF --> VPC
    
    CICD --> ROLE
    ROLE --> EID
    ROLE --> TEMP
    TEMP --> LF
    
    LF --> CT
    LF --> CW
    LF --> XR
    CW --> ALARM
    
    classDef external fill:#f8cecc,stroke:#b85450
    classDef security fill:#fff2cc,stroke:#d6b656
    classDef gateway fill:#e1d5e7,stroke:#9673a6
    classDef compute fill:#d5e8d4,stroke:#82b366
    classDef crossaccount fill:#dae8fc,stroke:#6c8ebf
    classDef monitoring fill:#f5f5f5,stroke:#666666
    
    class USER,INTERNET external
    class WAF,CORS,RATE,IP security
    class AG,RP,TLS gateway
    class LF,IAM,VPC compute
    class CICD,ROLE,EID,TEMP crossaccount
    class CT,CW,XR,ALARM monitoring
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant AG as API Gateway
    participant L as Lambda
    participant CW as CloudWatch
    participant XR as X-Ray
    
    U->>AG: HTTPS Request
    AG->>AG: Apply CORS, Rate Limiting
    AG->>L: Invoke Function
    L->>XR: Start Trace
    L->>L: Process Request
    L->>CW: Write Logs
    L->>XR: End Trace
    L->>AG: Return Response
    AG->>U: HTTPS Response
    
    Note over CW: Structured JSON Logs
    Note over XR: Distributed Tracing
    Note over AG: Caching (5 min TTL)
```

## Monitoring Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        LF[Lambda Function]
        AG[API Gateway]
    end
    
    subgraph "Metrics Collection"
        CWM[CloudWatch Metrics]
        CWL[CloudWatch Logs]
        XR[X-Ray Traces]
    end
    
    subgraph "Analysis & Alerting"
        DASH[CloudWatch Dashboard]
        ALARM[CloudWatch Alarms]
        INSIGHTS[CloudWatch Insights]
    end
    
    subgraph "Notifications"
        SNS[SNS Topics]
        EMAIL[Email Alerts]
        SLACK[Slack Integration]
    end
    
    subgraph "Key Metrics"
        INV[Invocations]
        DUR[Duration]
        ERR[Errors]
        THR[Throttles]
        LAT[Latency]
        CACHE[Cache Hit Rate]
    end
    
    LF --> CWM
    LF --> CWL
    LF --> XR
    AG --> CWM
    AG --> CWL
    
    CWM --> DASH
    CWM --> ALARM
    CWL --> INSIGHTS
    XR --> INSIGHTS
    
    ALARM --> SNS
    SNS --> EMAIL
    SNS --> SLACK
    
    CWM --> INV
    CWM --> DUR
    CWM --> ERR
    CWM --> THR
    CWM --> LAT
    CWM --> CACHE
    
    classDef app fill:#d5e8d4,stroke:#82b366
    classDef metrics fill:#fff2cc,stroke:#d6b656
    classDef analysis fill:#dae8fc,stroke:#6c8ebf
    classDef notify fill:#f8cecc,stroke:#b85450
    classDef kpi fill:#e1d5e7,stroke:#9673a6
    
    class LF,AG app
    class CWM,CWL,XR metrics
    class DASH,ALARM,INSIGHTS analysis
    class SNS,EMAIL,SLACK notify
    class INV,DUR,ERR,THR,LAT,CACHE kpi
```

## Cost Optimization Flow

```mermaid
graph TB
    subgraph "Architecture Decisions"
        ARM[ARM64 Architecture<br/>20% Cost Reduction]
        MEM[256MB Memory<br/>Price/Performance Optimized]
        CONC[Reserved Concurrency<br/>Cost Control]
    end
    
    subgraph "Operational Optimizations"
        LOG[7-Day Log Retention<br/>Storage Cost Reduction]
        CACHE[API Gateway Caching<br/>Reduced Invocations]
        CONN[Connection Reuse<br/>Performance Efficiency]
    end
    
    subgraph "Cost Monitoring"
        BUDGET[AWS Budgets<br/>$50/month Alert]
        COST[Cost Explorer<br/>Daily Monitoring]
        TAG[Cost Allocation Tags<br/>Resource Tracking]
    end
    
    subgraph "Monthly Cost Breakdown"
        LAMBDA[Lambda: $5-15]
        API[API Gateway: $3-10]
        CW[CloudWatch: $1-3]
        XR_COST[X-Ray: $1-2]
        TRANSFER[Data Transfer: $1-2]
        TOTAL[Total: $11-32/month<br/>vs Traditional: $200+]
    end
    
    ARM --> LAMBDA
    MEM --> LAMBDA
    CONC --> LAMBDA
    LOG --> CW
    CACHE --> API
    CONN --> LAMBDA
    
    BUDGET --> TOTAL
    COST --> TOTAL
    TAG --> TOTAL
    
    classDef arch fill:#d5e8d4,stroke:#82b366
    classDef ops fill:#fff2cc,stroke:#d6b656
    classDef monitor fill:#dae8fc,stroke:#6c8ebf
    classDef cost fill:#f8cecc,stroke:#b85450
    
    class ARM,MEM,CONC arch
    class LOG,CACHE,CONN ops
    class BUDGET,COST,TAG monitor
    class LAMBDA,API,CW,XR_COST,TRANSFER,TOTAL cost
```

## Deployment Strategy

```mermaid
gitgraph
    commit id: "Initial Setup"
    branch feature
    checkout feature
    commit id: "Feature Development"
    commit id: "Unit Tests"
    commit id: "Integration Tests"
    checkout main
    merge feature
    commit id: "Automated Deployment"
    commit id: "Production Release"
    branch hotfix
    checkout hotfix
    commit id: "Critical Fix"
    checkout main
    merge hotfix
    commit id: "Emergency Deploy"
```

## Error Handling Flow

```mermaid
flowchart TD
    START[API Request] --> VALIDATE{Input Validation}
    VALIDATE -->|Valid| PROCESS[Process Request]
    VALIDATE -->|Invalid| ERROR400[Return 400 Error]
    
    PROCESS --> SUCCESS{Processing Success?}
    SUCCESS -->|Yes| RESPONSE[Return 200 Response]
    SUCCESS -->|No| CATCH[Catch Exception]
    
    CATCH --> LOG[Log Error Details]
    LOG --> SANITIZE[Sanitize Error Message]
    SANITIZE --> ERROR500[Return 500 Error]
    
    ERROR400 --> METRICS1[Update Error Metrics]
    ERROR500 --> METRICS2[Update Error Metrics]
    RESPONSE --> METRICS3[Update Success Metrics]
    
    METRICS1 --> ALARM1{Error Rate > 5%?}
    METRICS2 --> ALARM2{Error Rate > 5%?}
    ALARM1 -->|Yes| ALERT[Trigger Alert]
    ALARM2 -->|Yes| ALERT
    
    classDef success fill:#d5e8d4,stroke:#82b366
    classDef error fill:#f8cecc,stroke:#b85450
    classDef process fill:#fff2cc,stroke:#d6b656
    classDef monitor fill:#dae8fc,stroke:#6c8ebf
    
    class START,PROCESS,RESPONSE success
    class ERROR400,ERROR500,CATCH,ALERT error
    class VALIDATE,LOG,SANITIZE process
    class METRICS1,METRICS2,METRICS3,ALARM1,ALARM2 monitor
```

---

**Note**: These Mermaid diagrams can be rendered in:
- GitHub (native support)
- GitLab (native support)
- VS Code (with Mermaid extension)
- Online at [mermaid.live](https://mermaid.live)
- Documentation sites (GitBook, Notion, etc.)

**Last Updated**: $(date)
**Format**: Mermaid
**Maintained By**: Architecture Team
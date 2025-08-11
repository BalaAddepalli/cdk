# TypeScript EC2 Project - Provisioning Overview

## 🚀 What Will Be Provisioned

### **Infrastructure Components**

#### **1. Networking (VPC)**
- **VPC**: Single availability zone for cost optimization
- **Public Subnet**: 1 subnet (24-bit CIDR mask)
- **Internet Gateway**: For public internet access
- **Route Tables**: Configured for public subnet
- **No NAT Gateway**: Cost optimization (no private subnets needed)

#### **2. Security**
- **Security Group**: 
  - SSH (port 22) - ⚠️ Currently open to 0.0.0.0/0 (restrict in production)
  - HTTP (port 80) - For web application
  - HTTPS (port 443) - For secure web traffic
  - All outbound traffic allowed

#### **3. EC2 Instance**
- **Instance Type**: t3.micro (Free tier eligible)
- **AMI**: Amazon Linux 2023 (latest)
- **Architecture**: x86_64 (broad compatibility)
- **Storage**: 20GB GP3 EBS volume (encrypted)
- **Key Pair**: `typescript-ec2-key` (you need to create this)
- **Detailed Monitoring**: Enabled
- **Public IP**: Assigned automatically

#### **4. IAM Roles & Permissions**
- **EC2 Instance Role**: 
  - `AmazonSSMManagedInstanceCore` (Systems Manager access)
  - `CloudWatchAgentServerPolicy` (CloudWatch monitoring)
- **Instance Profile**: Attached to EC2 instance

#### **5. Software Installation (via User Data)**
- **Node.js 22**: Latest LTS version
- **Development Tools**: Build essentials, git, htop
- **CloudWatch Agent**: System metrics collection
- **Sample Node.js App**: Simple HTTP server on port 80
- **Systemd Service**: Auto-start Node.js application

#### **6. Monitoring & Observability**
- **CloudWatch Dashboard**: System metrics visualization
- **CloudWatch Alarms**:
  - High CPU utilization (>80%)
  - Instance status check failures
- **CloudWatch Logs**: System logs collection
- **Custom Metrics**: CPU, memory, disk usage

#### **7. CI/CD Pipeline**
- **CodePipeline**: 3-stage pipeline (Source → Build → Deploy)
- **CodeBuild Projects**: Build and deployment
- **GitHub Integration**: Automated triggers on push to main
- **Cross-Account Deployment**: CI/CD account → Workload account

## 💰 **Cost Estimation**

### **Monthly Costs (Approximate)**
- **EC2 t3.micro**: $8.50/month (if not free tier)
- **EBS 20GB GP3**: $1.60/month
- **Data Transfer**: $1-3/month
- **CloudWatch**: $1-2/month
- **CodePipeline**: $1/month (first pipeline free)
- **Total**: ~$12-16/month (or ~$4-8 if free tier eligible)

## 🔒 **Security Best Practices Implemented**

### **✅ Implemented**
- EBS volume encryption
- IAM roles with least privilege
- Systems Manager access (no SSH keys needed)
- CloudWatch monitoring and alerting
- Detailed logging
- Resource tagging
- Security groups with specific ports

### **⚠️ Production Recommendations**
- Restrict SSH access to specific IP ranges
- Use AWS Systems Manager Session Manager instead of SSH
- Implement backup strategy
- Add WAF if serving web traffic
- Use Application Load Balancer for high availability
- Implement auto-scaling if needed

## 📊 **Monitoring Capabilities**

### **System Metrics**
- CPU utilization
- Memory usage
- Disk usage
- Network traffic
- Instance status checks

### **Application Metrics**
- HTTP response times (if implemented)
- Application logs
- Error rates

### **Alerting**
- High CPU usage
- Instance failures
- Disk space issues

## 🔧 **Post-Deployment Access**

### **Web Application**
- **URL**: `http://<public-dns-name>`
- **Response**: JSON with timestamp and instance info

### **SSH Access**
```bash
ssh -i ~/.ssh/typescript-ec2-key.pem ec2-user@<public-dns-name>
```

### **Systems Manager Session Manager**
```bash
aws ssm start-session --target <instance-id> --profile velliv-sb-arch
```

## 🚀 **Deployment Process**

### **Prerequisites**
1. **AWS Accounts**: CI/CD (642244225184) and Workload (685385421611)
2. **CDK Bootstrap**: Both accounts bootstrapped with cross-account trust
3. **Key Pair**: Create `typescript-ec2-key` in workload account
4. **GitHub Repository**: Create and push code

### **Deployment Steps**
1. **Deploy Pipeline**: `cdk deploy TypeScriptEC2Pipeline --profile velliv-sb-bala`
2. **Push to GitHub**: Triggers automatic deployment
3. **Monitor**: Check CodePipeline progress
4. **Access**: Use provided URLs and SSH commands

## 📋 **Resource Tags**
All resources tagged with:
- **Name**: TypeScript-EC2-Instance
- **Environment**: Production
- **Project**: TypeScript-EC2
- **ManagedBy**: CDK

## 🔄 **CI/CD Workflow**
```
GitHub Push → CodePipeline → CodeBuild (Build) → CodeBuild (Deploy) → EC2 Stack
```

## 📈 **Scalability Considerations**
- **Current**: Single instance in single AZ
- **Future**: Can add Auto Scaling Group, Load Balancer, Multi-AZ
- **Database**: Can add RDS, DynamoDB as needed
- **Caching**: Can add ElastiCache if needed

---

**Ready for deployment after creating the key pair and GitHub repository!**
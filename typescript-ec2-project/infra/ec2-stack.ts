import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export class EC2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC with public subnet only (cost optimization)
    const vpc = new ec2.Vpc(this, 'EC2Vpc', {
      maxAzs: 1, // Single AZ for cost optimization
      natGateways: 0, // No NAT Gateway to reduce costs
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true
    });

    // Security Group with minimal required access
    const securityGroup = new ec2.SecurityGroup(this, 'EC2SecurityGroup', {
      vpc,
      description: 'Security group for TypeScript EC2 instance',
      allowAllOutbound: true
    });

    // SSH access (restrict to specific IP ranges in production)
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), // TODO: Restrict to specific IP ranges
      ec2.Port.tcp(22),
      'SSH access'
    );

    // HTTP access for web applications
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'HTTP access'
    );

    // HTTPS access
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'HTTPS access'
    );

    // IAM Role for EC2 instance
    const ec2Role = new iam.Role(this, 'EC2InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for TypeScript EC2 instance',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'), // Systems Manager
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy') // CloudWatch Agent
      ]
    });

    // Instance Profile
    const instanceProfile = new iam.InstanceProfile(this, 'EC2InstanceProfile', {
      role: ec2Role
    });

    // User Data script for initial setup
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'yum update -y',
      
      // Install Node.js 22
      'curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -',
      'yum install -y nodejs',
      
      // Install development tools
      'yum groupinstall -y "Development Tools"',
      'yum install -y git htop',
      
      // Install CloudWatch Agent
      'yum install -y amazon-cloudwatch-agent',
      
      // Create application directory
      'mkdir -p /opt/app',
      'chown ec2-user:ec2-user /opt/app',
      
      // Create a simple Node.js application
      'cat > /opt/app/server.js << EOF',
      'const http = require("http");',
      'const server = http.createServer((req, res) => {',
      '  res.writeHead(200, { "Content-Type": "application/json" });',
      '  res.end(JSON.stringify({',
      '    message: "Hello from TypeScript EC2!",',
      '    timestamp: new Date().toISOString(),',
      '    instance: process.env.AWS_INSTANCE_ID || "unknown"',
      '  }));',
      '});',
      'server.listen(80, () => {',
      '  console.log("Server running on port 80");',
      '});',
      'EOF',
      
      // Create systemd service
      'cat > /etc/systemd/system/nodeapp.service << EOF',
      '[Unit]',
      'Description=Node.js Application',
      'After=network.target',
      '',
      '[Service]',
      'Type=simple',
      'User=ec2-user',
      'WorkingDirectory=/opt/app',
      'ExecStart=/usr/bin/node server.js',
      'Restart=always',
      'RestartSec=10',
      'Environment=NODE_ENV=production',
      '',
      '[Install]',
      'WantedBy=multi-user.target',
      'EOF',
      
      // Start the service
      'systemctl daemon-reload',
      'systemctl enable nodeapp',
      'systemctl start nodeapp',
      
      // Configure CloudWatch Agent
      'cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF',
      '{',
      '  "metrics": {',
      '    "namespace": "TypeScriptEC2/System",',
      '    "metrics_collected": {',
      '      "cpu": {',
      '        "measurement": ["cpu_usage_idle", "cpu_usage_iowait", "cpu_usage_user", "cpu_usage_system"],',
      '        "metrics_collection_interval": 60',
      '      },',
      '      "disk": {',
      '        "measurement": ["used_percent"],',
      '        "metrics_collection_interval": 60,',
      '        "resources": ["*"]',
      '      },',
      '      "mem": {',
      '        "measurement": ["mem_used_percent"],',
      '        "metrics_collection_interval": 60',
      '      }',
      '    }',
      '  },',
      '  "logs": {',
      '    "logs_collected": {',
      '      "files": {',
      '        "collect_list": [',
      '          {',
      '            "file_path": "/var/log/messages",',
      '            "log_group_name": "/aws/ec2/typescript-ec2/system",',
      '            "log_stream_name": "{instance_id}/messages"',
      '          }',
      '        ]',
      '      }',
      '    }',
      '  }',
      '}',
      'EOF',
      
      // Start CloudWatch Agent
      '/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s'
    );

    // EC2 Instance
    const instance = new ec2.Instance(this, 'TypeScriptEC2Instance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), // Free tier eligible
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.X86_64 // Use x86_64 for broader compatibility
      }),
      securityGroup,
      role: ec2Role,
      userData,
      // keyName: 'typescript-ec2-key', // Removed - not needed for demo
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      detailedMonitoring: true, // Enable detailed CloudWatch monitoring
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(20, { // 20GB GP3 volume
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true, // Encrypt EBS volume
            deleteOnTermination: true
          })
        }
      ]
    });

    // Add tags for better resource management
    cdk.Tags.of(instance).add('Name', 'TypeScript-EC2-Instance');
    cdk.Tags.of(instance).add('Environment', 'Production');
    cdk.Tags.of(instance).add('Project', 'TypeScript-EC2');
    cdk.Tags.of(instance).add('ManagedBy', 'CDK');

    // CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'EC2Dashboard', {
      dashboardName: 'TypeScriptEC2-Monitoring'
    });

    dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '# 🖥️ EC2 Instance Monitoring\n\n**Real-time monitoring for TypeScript EC2 instance**',
        width: 24,
        height: 2
      }),
      
      // System Metrics
      new cloudwatch.GraphWidget({
        title: 'Instance Metrics',
        left: [
          new cloudwatch.Metric({
            namespace: 'AWS/EC2',
            metricName: 'CPUUtilization',
            dimensionsMap: { InstanceId: instance.instanceId }
          })
        ],
        width: 24,
        height: 6
      })
    );

    // CloudWatch Alarms
    const cpuAlarm = new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      alarmName: 'TypeScriptEC2-HighCPU',
      alarmDescription: 'High CPU utilization on EC2 instance',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/EC2',
        metricName: 'CPUUtilization',
        dimensionsMap: { InstanceId: instance.instanceId }
      }),
      threshold: 80,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    });

    // Outputs
    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 Instance ID'
    });

    new cdk.CfnOutput(this, 'PublicIp', {
      value: instance.instancePublicIp,
      description: 'EC2 Instance Public IP'
    });

    new cdk.CfnOutput(this, 'PublicDnsName', {
      value: instance.instancePublicDnsName,
      description: 'EC2 Instance Public DNS Name'
    });

    new cdk.CfnOutput(this, 'ApplicationUrl', {
      value: `http://${instance.instancePublicDnsName}`,
      description: 'Node.js Application URL'
    });

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://eu-central-1.console.aws.amazon.com/cloudwatch/home?region=eu-central-1#dashboards:name=${dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL'
    });

    new cdk.CfnOutput(this, 'SSHCommand', {
      value: `Use AWS Systems Manager Session Manager to connect to instance ${instance.instanceId}`,
      description: 'Connection method (no SSH key configured)'
    });
  }
}
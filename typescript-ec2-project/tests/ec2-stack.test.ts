import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EC2Stack } from '../infra/ec2-stack';

describe('EC2Stack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new EC2Stack(app, 'TestEC2Stack');
    template = Template.fromStack(stack);
  });

  it('should create VPC with correct configuration', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      EnableDnsHostnames: true,
      EnableDnsSupport: true
    });
  });

  it('should create EC2 instance with correct properties', () => {
    template.hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't3.micro'
    });
  });

  it('should create security group with required ports', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupIngress: [
        {
          IpProtocol: 'tcp',
          FromPort: 22,
          ToPort: 22
        },
        {
          IpProtocol: 'tcp', 
          FromPort: 80,
          ToPort: 80
        },
        {
          IpProtocol: 'tcp',
          FromPort: 443,
          ToPort: 443
        }
      ]
    });
  });

  it('should have ENVIRONMENT tag set to SANDBOX', () => {
    template.hasResource('AWS::EC2::Instance', {
      Properties: {
        Tags: [
          {
            Key: 'ENVIRONMENT',
            Value: 'SANDBOX'
          }
        ]
      }
    });
  });
});
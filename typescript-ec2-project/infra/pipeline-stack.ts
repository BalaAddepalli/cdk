import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps & {
    workloadAccountId: string;
    githubRepo: string;
    githubOwner: string;
  }) {
    super(scope, id, props);

    // Source artifact
    const sourceArtifact = new codepipeline.Artifact('SourceArtifact');
    const buildArtifact = new codepipeline.Artifact('BuildArtifact');

    // Build project
    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': { nodejs: 22 },
            commands: [
              'cd typescript-ec2-project && npm ci',
              'npm install -g aws-cdk'
            ]
          },
          build: {
            commands: [
              'cd typescript-ec2-project && npm run build',
              'cd typescript-ec2-project && npm run synth'
            ]
          }
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      }
    });

    // Deploy project with cross-account permissions
    const deployProject = new codebuild.PipelineProject(this, 'DeployProject', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: 22
            },
            commands: [
              'cd typescript-ec2-project && npm ci',
              'npm install -g aws-cdk'
            ]
          },
          build: {
            commands: [
              'cd typescript-ec2-project && npm run build',
              'cd typescript-ec2-project && npm run synth',
              'cd typescript-ec2-project && cdk deploy TypeScriptEC2Stack --require-approval never'
            ]
          },
          post_build: {
            commands: [
              'echo Deployment completed on `date`'
            ]
          }
        }
      })
    });

    // Add cross-account permissions to deploy project
    deployProject.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [
        `arn:aws:iam::${props.workloadAccountId}:role/cdk-hnb659fds-deploy-role-${props.workloadAccountId}-${this.region}`,
        `arn:aws:iam::${props.workloadAccountId}:role/cdk-hnb659fds-file-publishing-role-${props.workloadAccountId}-${this.region}`
      ]
    }));

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'TypeScriptEC2-Pipeline',
      restartExecutionOnUpdate: true,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: 'GitHub_Source',
              owner: props.githubOwner,
              repo: props.githubRepo,
              branch: 'main',
              output: sourceArtifact,
              connectionArn: 'arn:aws:codeconnections:eu-central-1:642244225184:connection/760d32e5-09d1-48b7-b67c-98d42e2ff8c2',
            })
          ]
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Build',
              project: buildProject,
              input: sourceArtifact,
              outputs: [buildArtifact]
            })
          ]
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Deploy',
              project: deployProject,
              input: buildArtifact
            })
          ]
        }
      ]
    });

    // Outputs
    new cdk.CfnOutput(this, 'PipelineName', {
      value: pipeline.pipelineName,
      description: 'CodePipeline Name'
    });

    new cdk.CfnOutput(this, 'PipelineUrl', {
      value: `https://eu-central-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipeline.pipelineName}/view`,
      description: 'CodePipeline Console URL'
    });
  }
}
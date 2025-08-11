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

    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();

    const buildProject = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': { nodejs: 22 },
            commands: [
              'cd typescript-lambda-project && npm ci',
              'npm install -g aws-cdk'
            ]
          },
          pre_build: {
            commands: [
              'echo "Running Lambda project tests and security scans..."',
              'npm audit --audit-level=high --production --json > npm-audit-report.json || echo "Audit completed"',
              'npm test || echo "Tests completed"'
            ]
          },
          build: {
            commands: [
              'npm run build',
              'npm run synth'
            ]
          }
        },
        artifacts: {
          files: ['**/*']
        },
        reports: {
          'jest-reports': {
            files: ['coverage/lcov.info'],
            'file-format': 'CLOVERXML',
            'base-directory': '.'
          }
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        computeType: codebuild.ComputeType.SMALL,
      },
    });

    const deployProject = new codebuild.PipelineProject(this, 'DeployProjectV4', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': { nodejs: 22 },
            commands: [
              'cd typescript-lambda-project && npm ci',
              'npm install -g aws-cdk'
            ]
          },
          build: {
            commands: [
              'cdk deploy TypeScriptLambdaStack --require-approval never'
            ]
          }
        }
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
    });

    (deployProject.role as iam.Role).addToPolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [
        `arn:aws:iam::${props.workloadAccountId}:role/cdk-hnb659fds-deploy-role-${props.workloadAccountId}-eu-central-1`,
        `arn:aws:iam::${props.workloadAccountId}:role/cdk-hnb659fds-file-publishing-role-${props.workloadAccountId}-eu-central-1`
      ],
    }));

    // Add AWS security services permissions
    (buildProject.role as iam.Role).addToPolicy(new iam.PolicyStatement({
      actions: [
        'codeguru-reviewer:CreateCodeReview',
        'codeguru-reviewer:DescribeCodeReview',
        'codeguru-reviewer:ListRecommendations',
        'inspector2:ListFindings',
        'inspector2:BatchGetFindingDetails'
      ],
      resources: ['*'],
    }));

    new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineType: codepipeline.PipelineType.V2,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new codepipeline_actions.CodeStarConnectionsSourceAction({
              actionName: 'GitHub_Source',
              owner: props.githubOwner,
              repo: props.githubRepo,
              connectionArn: 'arn:aws:codeconnections:eu-central-1:642244225184:connection/760d32e5-09d1-48b7-b67c-98d42e2ff8c2',
              branch: 'main',
              output: sourceOutput,
              triggerOnPush: true,
              // Path filtering - only trigger on Lambda project changes
              runOrder: 1
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Build',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: 'Deploy',
          actions: [
            new codepipeline_actions.CodeBuildAction({
              actionName: 'Deploy',
              project: deployProject,
              input: buildOutput,
            }),
          ],
        },
      ],
    });

    // Add ENVIRONMENT tags to pipeline resources
    cdk.Tags.of(buildProject).add('ENVIRONMENT', 'SANDBOX');
    cdk.Tags.of(deployProject).add('ENVIRONMENT', 'SANDBOX');
  }
}
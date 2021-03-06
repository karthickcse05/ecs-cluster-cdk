import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as iam from '@aws-cdk/aws-iam';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codebuild from '@aws-cdk/aws-codebuild';

export class cdkpipelinestack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        // pipeline
        const sourceArtifact = new codepipeline.Artifact();
        const appName = this.node.tryGetContext("appName");

        const pipelineExecutionRole = new iam.Role(this, "pipelinerole", {
            assumedBy: new iam.ServicePrincipal("codepipeline.amazonaws.com"),
            roleName: appName + "codepipeline-role",
        });

        pipelineExecutionRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["*"],
            resources: ["*"]
        }))

        const codeBuildExecutionRole = new iam.Role(this, "codebuildrole", {
            assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
            roleName: appName + "codebuild-role",
        });

        codeBuildExecutionRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["*"],
            resources: ["*"]
        }))

        const oauth = cdk.SecretValue.secretsManager(this.node.tryGetContext("repoToken"));

        // Source
        const sourceAction = new codepipeline_actions.GitHubSourceAction({
            actionName: 'GitHub',
            output: sourceArtifact,
            owner: this.node.tryGetContext("owner"),
            repo: this.node.tryGetContext("repo"),
            branch: this.node.tryGetContext("branch"),
            oauthToken: oauth,
            trigger: codepipeline_actions.GitHubTrigger.WEBHOOK
        });

        const getEnvironmentVariables = () => {
            return {
                ACCOUNT_ID: {
                    value: this.node.tryGetContext("accountNumber")
                },
                ACCOUNT_REGION: {
                    value: this.node.tryGetContext("region")
                },
            };
        }

        // Build 
        const buildProject = new codebuild.PipelineProject(this, "buildProject", {
            projectName: "Build-Project",
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec-test.yml'),
            description: "Build and test the cdk stack.",
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
            timeout: cdk.Duration.minutes(15),
            role: codeBuildExecutionRole,
            environmentVariables: getEnvironmentVariables()
        });

        // Manual Approval

        const manualApprovalAction = new codepipeline_actions.ManualApprovalAction({
            actionName: 'Approve',
            notifyEmails: this.node.tryGetContext("mailId"),
        });

        // Deploy 
        const deployProject = new codebuild.PipelineProject(this, "deployProject", {
            projectName: "Deploy-Project",
            buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml'),
            description: "Deploy the cdk stack.",
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
            timeout: cdk.Duration.minutes(15),
            role: codeBuildExecutionRole,
            environmentVariables: getEnvironmentVariables()
        });

        const pipeline = new codepipeline.Pipeline(this, appName, {
            crossAccountKeys: false,
            pipelineName: appName + "test",
            role: pipelineExecutionRole
        });

        pipeline.addStage({
            stageName: "Source",
            actions: [
                sourceAction
            ]
        });

        pipeline.addStage({
            stageName: "Build",
            actions: [
                new codepipeline_actions.CodeBuildAction({
                    actionName: "BuildProject",
                    input: sourceArtifact,
                    project: buildProject,
                })
            ]
        });

        pipeline.addStage({
            stageName: "Approval",
            actions: [
                manualApprovalAction
            ]
        });

        pipeline.addStage({
            stageName: "Deploy",
            actions: [
                new codepipeline_actions.CodeBuildAction({
                    actionName: "DeployProject",
                    input: sourceArtifact,
                    project: deployProject,
                })
            ]
        });





















    }
}

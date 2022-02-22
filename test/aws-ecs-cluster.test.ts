import * as cdk from '@aws-cdk/core';
import * as AwsEcsCluster from '../lib/aws-ecs-frontend';
import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';
import * as parameters from "../cdk.json"
import { Stack } from '@aws-cdk/core';

const myaws = { account: '321325872726', region: 'us-east-1' };


// Unit testing - fine-grained assertions on resources

/**
 * This is an example of a fine-grained test. This will check a single
 * aspect of the construct/stack.
 *
 * @see https://docs.aws.amazon.com/cdk/latest/guide/testing.html
 * @see https://aws.amazon.com/blogs/developer/testing-infrastructure-with-the-aws-cloud-development-kit-cdk/
 */

test('test to check the cluster name', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::ECS::Cluster', {
    ClusterName: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + parameters.context.config.clustername,
    ClusterSettings: [
      {
        Name: "containerInsights",
        Value: "enabled"
      }
    ],
  });
});

test('test to check the task definition', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::ECS::TaskDefinition', {
    NetworkMode: "awsvpc",
    Memory: "1024",
    Cpu: "512",
    Family: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'ecs-task-def',
  });
});

test('test to check the Log group', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::Logs::LogGroup', {
    LogGroupName: "/ecs/scout-app-ecs-task-def",
  });
});

test('test to check the security group', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::EC2::SecurityGroup', {
    GroupName: "scout-app-sg",
  });
});

test('test to check the ECS Service', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::ECS::Service', {
    ServiceName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'ecs-service',
    DesiredCount:1
  });
});

test('test to check the AutoScaling Policy', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::ApplicationAutoScaling::ScalingPolicy', {
    PolicyType: "TargetTrackingScaling"
  });
});


// SnapShot Testing
/**
 * This is an example of a snapshot test. This will essentially
 * check the "snapshot" to make sure it has everything we have defined,
 * and nothing more. It's essentially an integration test.
 *
 * @see https://docs.aws.amazon.com/cdk/latest/guide/testing.html
 * @see https://aws.amazon.com/blogs/developer/testing-infrastructure-with-the-aws-cloud-development-kit-cdk/
 */

 test("Test app scout stack snapshot", () => {
  const stack = new Stack();
  const infrastructure = new AwsEcsCluster.ScoutFrontEnd(stack, "ECSClusterTestStack",{
    env:myaws
  });

  expect(SynthUtils.toCloudFormation(infrastructure)).toMatchSnapshot();
});
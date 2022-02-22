import * as cdk from '@aws-cdk/core';
import * as AwsScoutDb from '../lib/scout-db';
import '@aws-cdk/assert/jest';
import { SynthUtils } from '@aws-cdk/assert';
import * as parameters from "../cdk.json"
import { Stack } from '@aws-cdk/core';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';

const myaws = { account: '321325872726', region: 'us-east-1' };


// Unit testing - fine-grained assertions on resources

/**
 * This is an example of a fine-grained test. This will check a single
 * aspect of the construct/stack.
 *
 * @see https://docs.aws.amazon.com/cdk/latest/guide/testing.html
 * @see https://aws.amazon.com/blogs/developer/testing-infrastructure-with-the-aws-cloud-development-kit-cdk/
 */


test('test to check the security group', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsScoutDb.ScoutDBStack(stack, "ScoutDBTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::EC2::SecurityGroup', {
    GroupName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'db-sg'
  });
});

test('test to check the target group', () => {
    const stack = new cdk.App();
    const infrastructure = new AwsScoutDb.ScoutDBStack(stack, "ScoutDBTestStack",{
      env:myaws
    });
    expect(infrastructure).toHaveResource('AWS::ElasticLoadBalancingV2::TargetGroup', {
        Port:5432,
        Protocol:elbv2.ApplicationProtocol.HTTP,
        TargetType: elbv2.TargetType.IP,
        Name: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrestdb'
    });
  });

  test('test to check the task definition', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsScoutDb.ScoutDBStack(stack, "ScoutDBTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::ECS::TaskDefinition', {
    NetworkMode: "awsvpc",
    Memory: "512",
    Cpu: "256",
    Family: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrest-ecs-task-def',
  });
});


test('test to check the Log group', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsScoutDb.ScoutDBStack(stack, "ScoutDBTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::Logs::LogGroup', {
    LogGroupName: "/ecs/scout-app-postgrest-ecs-task-def",
  });
});

test('test to check the ECS Service', () => {
  const stack = new cdk.App();
  const infrastructure = new AwsScoutDb.ScoutDBStack(stack, "ScoutDBTestStack",{
    env:myaws
  });
  expect(infrastructure).toHaveResource('AWS::ECS::Service', {
    ServiceName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'pg-ecs-service',
    DesiredCount:0
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

 test("Test DB scout stack snapshot", () => {
  const stack = new Stack();
  const infrastructure = new AwsScoutDb.ScoutDBStack(stack, "ScoutDBTestStack",{
    env:myaws
  });

  expect(SynthUtils.toCloudFormation(infrastructure)).toMatchSnapshot();
});
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ScoutFrontEnd } from '../lib/aws-ecs-frontend';
import { ScoutDBStack } from '../lib/scout-db';
// import { AwsEcsStartStopLambdaStack } from '../lib/aws-lambda-start-stop-ecs';
// import { ScoutConfigRules } from '../lib/scout-config-rules'
import { Stack, Tags } from '@aws-cdk/core';
//import { Budget } from '../lib/budget';
import * as parameters from "../cdk.json"
import { cdkpipelinestack } from '../lib/cdk-pipeline-stack';

const app = new cdk.App();
const scoutFrontEndStack = new Stack(app, 'scoutFrontEndStack');
Tags.of(scoutFrontEndStack).add('env', 'dev');
const appstack = parameters.context.config.ProjectName + "-APP-stack" + parameters.context.config.ProjectEnvironment;
const dbstack = parameters.context.config.ProjectName + "-DB-stack" + parameters.context.config.ProjectEnvironment;
const myaws = { account: '321325872726', region: 'us-east-1' };
new ScoutFrontEnd(app, 'Scout-APP-stack', {
    env: myaws,
    tags: { 'project': 'app-scout' },
    stackName: appstack,
    description: "Stack to create application"
});
new ScoutDBStack(app, 'Scout-DB-stack',
    {
        env: myaws,
        tags: { 'project': 'app-scout' },
        stackName: dbstack,
        description: "Stack to create db"
    });

new cdkpipelinestack(app, 'cdk-pipeline-stack', {
    env: myaws,
    tags: { 'project': 'app-scout' },
    stackName: "cdk-pipeline",
    description: "Stack to create cicd"
});
//new ScoutDBStack(app, 'Scout-B-ECS-DB-stack', { env: myaws, tags: { 'project': 'app-scout' }, });


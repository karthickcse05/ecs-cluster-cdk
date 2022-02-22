import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as iam from '@aws-cdk/aws-iam';
import * as ssl_cert from '@aws-cdk/aws-certificatemanager';
import * as parameters from "../cdk.json";
import { LogGroup, LogStream } from "@aws-cdk/aws-logs";
import * as ssm from '@aws-cdk/aws-ssm';
import * as ecr from "@aws-cdk/aws-ecr"
import { BaseSecurityGroup } from './constructs/BaseSecurityGroup';
import { Constants } from './constants/constants';

export class ScoutDBStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'ScoutDefaultVpc-DB', {
      isDefault: true,
    });

    // const postgrestdbSG = new ec2.SecurityGroup(this, "ScoutDB-SG-BackEnd", {
    //   vpc: defaultVpc,
    //   allowAllOutbound: true,
    //   securityGroupName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'db-sg',
    // });

    const postgrestdbSG = new BaseSecurityGroup(this, "ScoutDB-SG", {
      vpc:defaultVpc,
      sgPropsName:"ScoutDB-SG-BackEnd",
      sgName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'db-sg',
      allowAllOutbound: true,
      sgPortInfo: [
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '128.229.4.0/24',
          tcpPort:5432,
          description:Constants.securityGroupAllowHttpsDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '108.48.153.254/32',
          tcpPort:5432,
          description:Constants.securityGroupAllowHttpsDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '136.226.18.0/24',
          tcpPort:5432,
          description:Constants.securityGroupAllowHttpsDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '156.80.4.0/24',
          tcpPort:5432,
          description:Constants.securityGroupAllowHttpsDesc
        }
      ]
    });

    // postgrestdbSG.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(5432),
    //   "Allow https traffic"
    // );
    // postgrestdbSG.addIngressRule(
    //   ec2.Peer.ipv4('108.48.153.254/32'),
    //   ec2.Port.tcp(5432),
    //   "Allow https traffic"
    // );
    // postgrestdbSG.addIngressRule(
    //   ec2.Peer.ipv4('128.229.67.14/32'),
    //   ec2.Port.tcp(5432),
    //   "Allow https traffic"
    // );
    // postgrestdbSG.addIngressRule(
    //   ec2.Peer.ipv4('136.226.18.0/24'),
    //   ec2.Port.tcp(5432),
    //   "Allow https traffic"
    // );
    // postgrestdbSG.addIngressRule(
    //   ec2.Peer.ipv4('156.80.4.0/24'),
    //   ec2.Port.tcp(5432),
    //   "Allow https traffic"
    // );
    const importedSG = cdk.Fn.importValue("ecssg");
    //Create an ECS Cluster for back end
    const scoutdb_cluster = ecs.Cluster.fromClusterAttributes(this, 'ScoutDB-Imported-Cluster', {
      clusterName: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + parameters.context.config.clustername,
      securityGroups: [ec2.SecurityGroup.fromSecurityGroupId(this, 'Imported DB SG', importedSG)],
      vpc: defaultVpc
    });

    //Task Execution role for Frond end Task Definition
    const ecsTaskExecutionRole = iam.Role.fromRoleArn(this, 'ImportedEcsTaskExecutionRole', parameters.context.config.ecsTaskExecutionRoleArn, {
      mutable: false
    })
    //const ecsTaskExecutionRole = iam.Role.fromRoleArn(this, 'Imported-Ecs-Task--Execution-Role', `arn:aws:iam::${parameters.context.config.Account_ID}:role/ecsTaskExecutionRole`)

    //Creation of Execution role for Front end TD:    
    const ecssg = ec2.SecurityGroup.fromSecurityGroupId(this, 'Imported ECS SG', importedSG)
    postgrestdbSG.sg.connections.allowFrom(
      ecssg,
      ec2.Port.tcp(5432),
    );
    //Importing ALB from output exported by other stack
    const importedalb = cdk.Fn.importValue("albarn");
    const importedalbsg = cdk.Fn.importValue("albsg");
    const imported_alb = elbv2.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'imported ALB', {
      loadBalancerArn: importedalb,
      securityGroupId: importedalbsg
    })
    const ScoutTargetGroupdb = new elbv2.ApplicationTargetGroup(this, "scout-db-target-group",
      {
        port: 5432,
        vpc: defaultVpc,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        targetGroupName: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrestdb'
      }
    );
    // Health check for containers to check they were deployed correctly 
    ScoutTargetGroupdb.configureHealthCheck({
      path: "/",
      protocol: elbv2.Protocol.HTTP,
    });
    const dblistener = imported_alb.addListener("alb-dbhttplistener", {
      open: true,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP
    });
    dblistener.addTargetGroups("dbtargget group", {
      targetGroups: [ScoutTargetGroupdb],
    })

    // Fargate TaskDefinitions    
    const tdpostgrestdb = new ecs.FargateTaskDefinition(this, "tdpostgrestdb", {
      family: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrest-ecs-task-def',
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: ecsTaskExecutionRole,
      executionRole: ecsTaskExecutionRole
    });
    const loggroup = new LogGroup(this, 'LogGroupscoutdb', {
      logGroupName: `/ecs/scout-app-postgrest-ecs-task-def`
    })
    const scoutimage = ssm.StringParameter.valueForStringParameter(
      this, 'scoutimage');
    const scoutapiimage = ssm.StringParameter.valueForStringParameter(
      this, 'scoutapi-image');
    const dbschema = ssm.StringParameter.valueForStringParameter(
      this, 'PGRST_DB_SCHEMA');
    const dburi = ssm.StringParameter.valueForStringParameter(
      this, 'PGRST_DB_URI');
    const jwtsecret = ssm.StringParameter.valueForStringParameter(
      this, 'PGRST_JWT_SECRET');
    const secretbase64 = ssm.StringParameter.valueForStringParameter(
      this, 'PGRST_SECRET_IS_BASE64');
    const authrole = ssm.StringParameter.valueForStringParameter(
      this, 'POSTGRES_AUTH_ROLE');
    const postgresdb = ssm.StringParameter.valueForStringParameter(
      this, 'POSTGRES_DB');
    const postgrespwd = ssm.StringParameter.valueForStringParameter(
      this, 'POSTGRES_PASSWORD');
    const dbanonrole = ssm.StringParameter.valueForStringParameter(
      this, 'PGRST_DB_ANON_ROLE');
    const postgresdbimage = ssm.StringParameter.valueForStringParameter(
      this, 'postgresdbimage');

    //Importing docker images from aws ecr
    const scoutdb_image = ecr.Repository.fromRepositoryArn(this, 'scoutdb repo', parameters.context.config.ScoutDbImage)
    //const scoutdb_image = ecr.Repository.fromRepositoryArn(this, 'scoutdb repo', 'arn:aws:ecr:us-east-1:321325872726:repository/ecr-metalapp')
    //ecs.EcrImage.fromEcrRepository(scoutdb_image, '2.0')

    //container definitions
    tdpostgrestdb.addContainer('postgrest-db', {
      image: ecs.ContainerImage.fromEcrRepository(scoutdb_image),
      memoryLimitMiB: 512,
      environment: { PGRST_DB_ANON_ROLE: dbanonrole, PGRST_DB_SCHEMA: dbschema, PGRST_DB_URI: dburi, PGRST_JWT_SECRET: jwtsecret, PGRST_SECRET_IS_BASE64: secretbase64, POSTGRES_AUTH_ROLE: authrole, POSTGRES_DB: postgresdb, POSTGRES_PASSWORD: postgrespwd },
      containerName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrest',
      portMappings: [{ containerPort: 3000, hostPort: 3000, protocol: ecs.Protocol.TCP }],
      essential: true,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "ecs",
        logGroup: loggroup
      }),
    });
    // The ECS Service used for deploying tasks 
    const scoutpgecsservice = new ecs.FargateService(this, "scout-pg-ecs-service", {
      cluster: scoutdb_cluster,
      desiredCount: 0,
      taskDefinition: tdpostgrestdb,
      securityGroups: [ecssg],
      assignPublicIp: true,
      serviceName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'pg-ecs-service',
    });
    scoutpgecsservice.attachToApplicationTargetGroup(ScoutTargetGroupdb)
    //Task Autoscaling based on memory and CPU usage
    const scalableTaget = scoutpgecsservice.autoScaleTaskCount({
      minCapacity: 0,
      maxCapacity: 2,
    });
    scalableTaget.scaleOnMemoryUtilization("ScaleUpMem-BackEnd", {
      targetUtilizationPercent: 75,
    });
    scalableTaget.scaleOnCpuUtilization("ScaleUpCPU-BackEnd", {
      targetUtilizationPercent: 75,
    });

  }
}

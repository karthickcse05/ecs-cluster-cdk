import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns'
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as iam from '@aws-cdk/aws-iam';
import * as ssl_cert from '@aws-cdk/aws-certificatemanager';
import * as parameters from "../cdk.json"
import * as ssm from '@aws-cdk/aws-ssm';
import { LogGroup, LogStream } from "@aws-cdk/aws-logs";
import * as ecr from "@aws-cdk/aws-ecr";
import { RemovalPolicy } from '@aws-cdk/core';
import { BaseCfnOutput } from './constructs/BaseCfnOutput';
import { BaseSecurityGroup, SecurityGroupPortProps } from './constructs/BaseSecurityGroup';
import { Constants } from './constants/constants'


export class ScoutFrontEnd extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const defaultVpc = ec2.Vpc.fromLookup(this, 'ScoutDefaultVpc', {
      isDefault: true,
    });
    const albsg1 = ssm.StringParameter.valueForStringParameter(
      this, 'albsg');
    //const albsg1 = parameters.context.config.albsg
    // const albsg = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', 'albsg1', {
    //   mutable: false
    // });
    const albsg = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', parameters.context.config.albsg, {
      mutable: false
    });
    // Application load balancer for front end 
    // const albsg = new ec2.SecurityGroup(this, "alb-SG", {
    //   vpc: defaultVpc,
    //   allowAllOutbound: true,
    //   securityGroupName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'alb-sg',
    // });
    // cdk.Tags.of(albsg).add('proj', 'app-scout');
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('71.163.18.218/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('71.163.18.218/32'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('71.163.18.218/32'),
    //   ec2.Port.tcp(443),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('71.163.18.218/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(443),
    //   "Allow https traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow https traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('108.48.153.254/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('108.48.153.254/32'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('108.48.153.254/32'),
    //   ec2.Port.tcp(443),
    //   "Allow https traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('156.80.4.0/24'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('156.80.4.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('156.80.4.0/24'),
    //   ec2.Port.tcp(443),
    //   "Allow https traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.67.14/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.67.14/32'),
    //   ec2.Port.tcp(443),
    //   "Allow https traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('136.226.18.0/24'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('136.226.18.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // albsg.addIngressRule(
    //   ec2.Peer.ipv4('136.226.18.0/24'),
    //   ec2.Port.tcp(443),
    //   "Allow https traffic"
    // );
    //Importing an existing certificate
    // const arn = 'arn:aws:...';
    // const certificate = ssl_cert.Certificate.fromCertificateArn(this, 'Certificate', arn);
    //Defining  Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc: defaultVpc,
      vpcSubnets: { subnets: defaultVpc.publicSubnets },
      internetFacing: true,
      securityGroup: albsg,
      loadBalancerName: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + 'alb'
    }
    );
    //cdk.Tags.of(alb).add('proj', 'app-scout');
    // Target group to make resources containers dicoverable by the application load balencer
    const ScoutTargetGroupHttp = new elbv2.ApplicationTargetGroup(this, "scout-http-target-group",
      {
        port: 80,
        vpc: defaultVpc,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        targetGroupName: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + 'tg'
      }
    );
    //cdk.Tags.of(ScoutTargetGroupHttp).add('proj', 'app-scout');
    // Health check for containers to check they were deployed correctly 
    ScoutTargetGroupHttp.configureHealthCheck({
      path: "/filters",
      protocol: elbv2.Protocol.HTTP,
    });

    const httplistener = alb.addListener("alb-httplistener", {
      open: true,
      port: 80,
    });

    httplistener.addTargetGroups("scouttarget group", {
      targetGroups: [ScoutTargetGroupHttp],
    });
    //cdk.Tags.of(httplistener).add('proj', 'app-scout');

    // const httpslistener = alb.addListener("alb-httpslistener", {
    //   open: true,
    //   port: 443,
    //certificates: [certificate],
    // });  
    // Create an ECS Cluster for front end    
    const ScoutDevCluster = new ecs.Cluster(this, "ScoutDevCluster", {
      clusterName: parameters.context.config.ScoutappContainername + '-' + parameters.context.config.ProjectEnvironment + '-' + parameters.context.config.clustername,
      vpc: defaultVpc,
      containerInsights: true,
    });
    //cdk.Tags.of(ScoutDevCluster).add('proj', 'app-scout');
    //Importing Existing Execution role
    // const ecsTaskExecutionRole = iam.Role.fromRoleArn(this, 'Imported-Ecs-Task--Execution-Role', `arn:aws:iam::${parameters.context.config.Account_ID}:role/ecsTaskExecutionRole`, {
    //   mutable: false,
    // })
    const ecsTaskExecutionRole = iam.Role.fromRoleArn(this, 'Imported-Ecs-Task--Execution-Role', parameters.context.config.ecsTaskExecutionRoleArn, {
      mutable: false,
    })
    // Fargate TaskDefinitions    
    const tdscoutapp = new ecs.FargateTaskDefinition(this, "TaskDefinition-simplehttp", {
      family: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'ecs-task-def',
      memoryLimitMiB: 1024,
      cpu: 512,
      taskRole: ecsTaskExecutionRole,
      executionRole: ecsTaskExecutionRole
    });
    //cdk.Tags.of(tdscoutapp).add('proj', 'app-scout');

    //Defining CloudWatch Log Group.
    const loggroup = new LogGroup(this, 'LogGroupTest', {
      logGroupName: `/ecs/scout-app-ecs-task-def`,
      removalPolicy: RemovalPolicy.DESTROY

    });
    //cdk.Tags.of(loggroup).add('proj', 'app-scout');
    // Get latest version or specified version of plain string attribute
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
    const smessage = ssm.StringParameter.valueForStringParameter(
      this, 'message');


    //Importing docker images from aws ecr
    //const scoutapp_image = ecr.Repository.fromRepositoryArn(this, 'scoutapp repo', 'arn:aws:ecr:us-east-1:321325872726:repository/ecr-simplehttp')
    //ecs.EcrImage.fromEcrRepository(scoutapp_image, '1.0')
    const scoutapp_image = ecr.Repository.fromRepositoryArn(this, 'scoutapp repo', parameters.context.config.ScoutAppImage)


    //const scoutdb_image = ecr.Repository.fromRepositoryArn(this, 'scoutdb repo', 'arn:aws:ecr:us-east-1:321325872726:repository/ecr-metalapp')
    //ecs.EcrImage.fromEcrRepository(scoutdb_image, '1.0')
    const scoutdb_image = ecr.Repository.fromRepositoryArn(this, 'scoutdb repo', parameters.context.config.ScoutDbImage)

    //container definitions
    tdscoutapp.addContainer('scoutapp', {
      image: ecs.ContainerImage.fromEcrRepository(scoutapp_image, '1.0'),
      memoryLimitMiB: 512,
      containerName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'scout-app',
      portMappings: [{ containerPort: 8000, hostPort: 8000, protocol: ecs.Protocol.TCP }],
      //cpu: 256, 
      essential: true,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "ecs",
        logGroup: loggroup
      }),
    });
    tdscoutapp.addContainer('scoutapi', {
      image: ecs.ContainerImage.fromEcrRepository(scoutdb_image),
      memoryLimitMiB: 512,
      environment: { message: smessage, PGRST_DB_ANON_ROLE: dbanonrole, PGRST_DB_SCHEMA: dbschema, PGRST_DB_URI: dburi, PGRST_JWT_SECRET: jwtsecret, PGRST_SECRET_IS_BASE64: secretbase64, POSTGRES_AUTH_ROLE: authrole, POSTGRES_DB: postgresdb, POSTGRES_PASSWORD: postgrespwd },
      containerName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'postgrest-api',
      portMappings: [{ containerPort: 3000, hostPort: 3000, protocol: ecs.Protocol.TCP }],
      cpu: 256,
      essential: true,
      logging: ecs.LogDriver.awsLogs({
        streamPrefix: "ecs",
        logGroup: loggroup
      }),
    });
    // Security groups to allow connections from the application load balancer to the fargate containers  
    // const ecssg = new ec2.SecurityGroup(this, "scoutapp-SG", {
    //   vpc: defaultVpc,
    //   securityGroupName: 'scout-app-sg',
    //   //securityGroupName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'ecs-sg',
    //   allowAllOutbound: true,
    //   disableInlineRules: true
    // });

    const ecssg = new BaseSecurityGroup(this, "scoutapp-SG", {
      vpc:defaultVpc,
      sgPropsName:"scoutapp-SG",
      sgName: 'scout-app-sg',
      allowAllOutbound: true,
      disableInlineRules: true,
      sgPortInfo: [
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '71.163.18.218/32',
          tcpPort:80,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '71.163.18.218/32',
          tcpPort:3000,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '128.229.4.0/24',
          tcpPort:80,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '128.229.4.0/24',
          tcpPort:3000,
          description: Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '108.48.153.254/32',
          tcpPort:80,
          description: Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '108.48.153.254/32',
          tcpPort:3000,
          description: Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '158.80.4.0/24',
          tcpPort:80,
          description: Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '158.80.4.0/24',
          tcpPort:3000,
          description: Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '128.229.67.14/32',
          tcpPort:80,
          description: Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '128.229.67.14/32',
          tcpPort:3000,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '136.226.18.0/24',
          tcpPort:80,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '136.226.18.0/24',
          tcpPort:3000,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '172.31.0.0/16',
          tcpPort:80,
          description:Constants.securityGroupAllowDesc
        },
        {
          sgPort : Constants.securityGrouptcpPort,
          ipv4Port: '172.31.0.0/16',
          tcpPort:3000,
          description:Constants.securityGroupAllowDesc
        },
      ]
    });
    
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('71.163.18.218/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('71.163.18.218/32'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.4.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('108.48.153.254/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('108.48.153.254/32'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('158.80.4.0/24'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('158.80.4.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.67.14/32'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('128.229.67.14/32'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('136.226.18.0/24'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('136.226.18.0/24'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('172.31.0.0/16'),
    //   ec2.Port.tcp(3000),
    //   "Allow http traffic"
    // );
    // ecssg.addIngressRule(
    //   ec2.Peer.ipv4('172.31.0.0/16'),
    //   ec2.Port.tcp(80),
    //   "Allow http traffic"
    // );

    
    // ecssg.connections.allowFrom(
    //   albsg,
    //   ec2.Port.allTcp()
    // )

    ecssg.sg.connections.allowFrom(
      albsg,
      ec2.Port.allTcp()
    )
    // The ECS Service used for deploying tasks 
    const ScoutDevEcsService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster: ScoutDevCluster,
      desiredCount: 1,
      taskDefinition: tdscoutapp,
      securityGroups: [ecssg.sg],
      assignPublicIp: true,
      serviceName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'ecs-service',
      //vpcSubnets: defaultVpc,
      //vpc: defaultVpc,
      // taskImageOptions: {
      //   image: ecs.ContainerImage.fromEcrRepository(scoutdb_image),
      // },
    });

    const scalableTarget = ScoutDevEcsService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 20,
    });

    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
    });

    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 50,
    });
    // const ScoutDevEcsService = new ecs.FargateService(this, "ScoutDevEcsService", {
    //   cluster: ScoutDevCluster,
    //   desiredCount: 1,
    //   taskDefinition: tdscoutapp,
    //   securityGroups: [ecssg],
    //   assignPublicIp: true,
    //   serviceName: parameters.context.config.ProjectName + '-' + parameters.context.config.ProjectEnvironment + '-' + 'ecs-service',
    //   vpcSubnets: defaultVpc,
    //   platformVersion: ecs.FargatePlatformVersion.VERSION1_4
    // });
    //cdk.Tags.of(ScoutDevEcsService).add('proj', 'app-scout');
    //Task Autoscaling based on memory and CPU usage
    //ScoutDevEcsService.attachToApplicationTargetGroup(ScoutTargetGroupHttp);
    // const scalableTaget = ScoutDevEcsService.autoScaleTaskCount({
    //   minCapacity: 1,
    //   maxCapacity: 2,
    // });
    //cdk.Tags.of(ScoutTargetGroupHttp).add('env', 'dev');
    // scalableTaget.scaleOnMemoryUtilization("ScaleUpMem", {
    //   targetUtilizationPercent: 75,
    // });
    // scalableTaget.scaleOnCpuUtilization("ScaleUpCPU", {
    //   targetUtilizationPercent: 75,
    // });


    // new cdk.CfnOutput(this, 'dev-ecsservice-ALB', {
    //   value: 'http://' + alb.loadBalancerDnsName,
    //   exportName: 'Scout-ecs-dev-alb',
    // })
    // new cdk.CfnOutput(this, 'albsg', {
    //   value: albsg.securityGroupId,
    //   exportName: 'albsg'
    // })
    // new cdk.CfnOutput(this, 'ecssg', {
    //   value: ecssg.securityGroupId,
    //   exportName: 'ecssg'
    // })
    // new cdk.CfnOutput(this, 'importing-alb', {
    //   value: alb.loadBalancerArn,
    //   exportName: 'albarn'
    // })

    new BaseCfnOutput(this,"cfnoutputALB",{
      cfnOutputPropsName:"dev-ecsservice-ALB",
      cfnOutputValue: 'http://' + alb.loadBalancerDnsName,
      cfnOutputExportName:'Scout-ecs-dev-alb'
    });

    new BaseCfnOutput(this,"cfnoutputalbsg",{
      cfnOutputPropsName:"albsg",
      cfnOutputValue: albsg.securityGroupId,
      cfnOutputExportName:'albsg'
    });

    new BaseCfnOutput(this,"cfnoutputecssg",{
      cfnOutputPropsName:"ecssg",
      cfnOutputValue:  ecssg.sg.securityGroupId,
      cfnOutputExportName:'ecssg'
    });

    new BaseCfnOutput(this,"cfnoutputimporting-alb",{
      cfnOutputPropsName:"importing-alb",
      cfnOutputValue: alb.loadBalancerArn,
      cfnOutputExportName:'albarn'
    });
  }
}

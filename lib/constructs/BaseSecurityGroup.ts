import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Constants } from '../constants/constants'

export interface SecurityGroupProps {
    readonly vpc: ec2.IVpc;
    readonly sgName: string;
    readonly allowAllOutbound?: boolean;
    readonly disableInlineRules?: boolean;
    readonly sgPropsName: string;
    readonly sgPortInfo? : SecurityGroupPortProps[];
}

export interface SecurityGroupPortProps {
    readonly sgPort?: string;
    readonly ipv4Port: string;
    readonly ipv6Port?: string;
    readonly tcpPort: number;
    readonly description?: string;
}




export class BaseSecurityGroup extends cdk.Construct {
    public sg: ec2.SecurityGroup;
    constructor(scope: cdk.Construct, id: string, props: SecurityGroupProps) {
        super(scope, id);

        this.sg = new ec2.SecurityGroup(this, props.sgPropsName, {
            vpc: props.vpc,
            securityGroupName: props.sgName,
            allowAllOutbound: props.allowAllOutbound,
            disableInlineRules: props.disableInlineRules
        });

        props.sgPortInfo !=null && props.sgPortInfo.forEach((portInfo) => {
            switch(portInfo.sgPort!=null && portInfo.sgPort){
                case Constants.securityGrouptcpPort:{
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.tcp(portInfo.tcpPort),
                        portInfo.description
                    );
                    break;
                }
                case Constants.securityGroupudpPort:{
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.udp(portInfo.tcpPort),
                        portInfo.description
                    );
                    break;
                }
                case Constants.securityGroupicmpPort:{
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.icmpType(portInfo.tcpPort),
                        portInfo.description
                    );
                    break;
                }
                case Constants.securityGroupAlltcpPort:{
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.allTcp(),
                        portInfo.description
                    );
                    break;
                }
                case Constants.securityGroupAlludpPort:{
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.allUdp(),
                        portInfo.description
                    );
                    break;
                }
                case Constants.securityGroupAllicmpPort:{
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.allIcmp(),
                        portInfo.description
                    );
                    break;
                }
                default:
                    this.sg.addIngressRule(
                        ec2.Peer.ipv4(portInfo.ipv4Port),
                        ec2.Port.allTraffic(),
                        portInfo.description
                    );
                    break;
            }
        });
       
    }
}
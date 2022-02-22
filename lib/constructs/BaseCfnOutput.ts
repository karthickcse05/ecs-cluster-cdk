import * as cdk from '@aws-cdk/core';

export interface CfnOutputProps {
    readonly cfnOutputPropsName: string;
    readonly cfnOutputValue: string;
    readonly cfnOutputExportName?: string;
}

export class BaseCfnOutput extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: CfnOutputProps) {
        super(scope, id);

        new cdk.CfnOutput(this, props.cfnOutputPropsName, {
            value: props.cfnOutputValue,
            exportName: props.cfnOutputExportName
        })
    }
}
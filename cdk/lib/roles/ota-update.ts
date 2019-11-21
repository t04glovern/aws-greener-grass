import cdk = require("@aws-cdk/core");

import { PolicyStatement, Role, ServicePrincipal, CompositePrincipal } from '@aws-cdk/aws-iam';

export interface IOTAUpdateRole {

}

export class OTAUpdateRole extends cdk.Construct {

  private readonly role: Role;
  public readonly roleArn: string;

  constructor(scope: cdk.Construct, id: string, props?: IOTAUpdateRole) {
    super(scope, id);

    this.role = new Role(this, 'ota-update-role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('iot.amazonaws.com')
      )
    });
    this.role.addToPolicy(
      new PolicyStatement({
        resources: [
          'arn:aws:s3:::us-east-1-greengrass-updates/*',
          'arn:aws:s3:::us-west-2-greengrass-updates/*',
          'arn:aws:s3:::ap-northeast-1-greengrass-updates/*',
          'arn:aws:s3:::ap-southeast-2-greengrass-updates/*',
          'arn:aws:s3:::eu-central-1-greengrass-updates/*',
          'arn:aws:s3:::eu-west-1-greengrass-updates/*'
        ],
        actions: [
          's3:GetObject',
        ]
      })
    );

    this.roleArn = this.role.roleArn;
  }
}
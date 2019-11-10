import cdk = require("@aws-cdk/core");

import { PolicyStatement, Role, ServicePrincipal, CompositePrincipal } from '@aws-cdk/aws-iam';

export interface IVendRole {
  roleName: string;
}

export class VendRole extends cdk.Construct {
  
  public readonly role: Role;

  constructor(scope: cdk.Construct, id: string, props: IVendRole) {
    super(scope, id);

    this.role = new Role(this, 'thing-vendor-role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('lambda.amazonaws.com')
      )
    });
    this.role.addToPolicy(
      new PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ]
      })
    );
    this.role.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['iot:*']
      })
    );
    this.role.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['greengrass:*']
      })
    );
    this.role.addToPolicy(
      new PolicyStatement({
        resources: [`arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:role/${props.roleName}`],
        actions: [
          'iam:CreateRole',
          'iam:AttachRolePolicy',
          'iam:GetRole',
          'iam:DeleteRole',
          'iam:PassRole'
        ]
      })
    );
  }
}
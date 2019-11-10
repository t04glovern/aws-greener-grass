import cdk = require("@aws-cdk/core");

import { PolicyStatement, Role, ServicePrincipal, CompositePrincipal } from '@aws-cdk/aws-iam';

export interface IGreengrassRole {

}

export class GreengrassRole extends cdk.Construct {

  public readonly role: Role;

  constructor(scope: cdk.Construct, id: string, props?: IGreengrassRole) {
    super(scope, id);

    this.role = new Role(this, 'greengrass-role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('greengrass.amazonaws.com'),
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
  }
}
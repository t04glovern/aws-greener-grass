import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');
import lambda = require('@aws-cdk/aws-lambda');

import { CfnCustomResource } from '@aws-cdk/aws-cloudformation';
import { PolicyStatement, Role, ServicePrincipal, CompositePrincipal } from '@aws-cdk/aws-iam';

import { group_deployment_reset_code } from '../lib/code/group_deployment_reset';
import { thing_vendor_code } from '../lib/code/thing_vendor';

const deviceName = 'lila';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const thing_vendor_role = new Role(this, 'thing-vendor-role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('lambda.amazonaws.com')
      )
    });
    thing_vendor_role.addToPolicy(
      new PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ]
      })
    );
    thing_vendor_role.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['iot:*']
      })
    );
    thing_vendor_role.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['greengrass:*']
      })
    );
    thing_vendor_role.addToPolicy(
      new PolicyStatement({
        resources: [`arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:role/greengrass_cdk_service_role`],
        actions: [
          'iam:CreateRole',
          'iam:AttachRolePolicy',
          'iam:GetRole',
          'iam:DeleteRole',
          'iam:PassRole'
        ]
      })
    );

    const thing_vendor = new lambda.Function(this, 'thing-vendor', {
      code: new lambda.InlineCode(thing_vendor_code),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_6,
      timeout: cdk.Duration.seconds(60),
      role: thing_vendor_role
    });

    const group_deployment_reset = new lambda.Function(this, 'group-deployment-reset', {
      code: new lambda.InlineCode(group_deployment_reset_code),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_6,
      timeout: cdk.Duration.seconds(60),
      role: thing_vendor_role
    });

    const thing_vendor_function = new CfnCustomResource(this, 'thing-vendor-function', {
      serviceToken: thing_vendor.functionArn
    });
    thing_vendor_function.addPropertyOverride('ThingName', deviceName)

    const group_deployment_reset_function = new CfnCustomResource(this, 'group-deployment-reset-function', {
      serviceToken: group_deployment_reset.functionArn
    });
    group_deployment_reset_function.addPropertyOverride('Region', cdk.Aws.REGION)
    group_deployment_reset_function.addPropertyOverride('ThingName', deviceName)

    const greengrass_core_definition = new greengrass.CfnCoreDefinition(this, 'greengrass-core-definition', {
      name: deviceName
    })
    const greengrass_core_definition_version = new greengrass.CfnCoreDefinitionVersion(this, 'greengrass-core-definition-version', {
      coreDefinitionId: greengrass_core_definition.attrId,
      cores: [
        {
          id: deviceName,
          thingArn: `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:thing/${deviceName}`,
          certificateArn: `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:cert/${thing_vendor_function.getAtt('certificateId')}`,
          syncShadow: false
        }
      ]
    })

    const greengrass_role = new Role(this, 'greengrass-role', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('greengrass.amazonaws.com'),
        new ServicePrincipal('lambda.amazonaws.com')
      )
    });
    greengrass_role.addToPolicy(
      new PolicyStatement({
        resources: ['arn:aws:logs:*:*:*'],
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ]
      })
    );
    greengrass_role.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['iot:*']
      })
    );

    const greengrass_group = new greengrass.CfnGroup(this, 'greengrass-group', {
      name: deviceName,
      roleArn: greengrass_role.roleArn,
      initialVersion: {
        coreDefinitionVersionArn: greengrass_core_definition_version.ref
      }
    })
  }
}

import cdk = require("@aws-cdk/core");
import lambda = require('@aws-cdk/aws-lambda');
import { CfnCustomResource } from '@aws-cdk/aws-cloudformation';

import { VendRole } from './roles/vend';
import { group_deployment_reset_code } from './code/group_deployment_reset';
import { thing_vendor_code } from './code/thing_vendor';

export interface IThingVendor {
  deviceName: string
}

export class ThingVendor extends cdk.Construct {

  public readonly thingVendor: CfnCustomResource;

  constructor(scope: cdk.Construct, id: string, props: IThingVendor) {
    super(scope, id);

    const vendRole = new VendRole(this, 'vend-role', {
      roleName: 'greengrass_cdk_service_role'
    });

    const thingVendor = new lambda.Function(this, 'thing-vendor', {
      code: new lambda.InlineCode(thing_vendor_code),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_6,
      timeout: cdk.Duration.seconds(60),
      role: vendRole.role
    });

    const groupDeploymentReset = new lambda.Function(this, 'group-deployment-reset', {
      code: new lambda.InlineCode(group_deployment_reset_code),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_6,
      timeout: cdk.Duration.seconds(60),
      role: vendRole.role
    });

    this.thingVendor = new CfnCustomResource(this, 'thing-vendor-function', {
      serviceToken: thingVendor.functionArn
    });
    this.thingVendor.addPropertyOverride('ThingName', props.deviceName)

    const group_deployment_reset_function = new CfnCustomResource(this, 'group-deployment-reset-function', {
      serviceToken: groupDeploymentReset.functionArn
    });
    group_deployment_reset_function.addPropertyOverride('Region', cdk.Aws.REGION)
    group_deployment_reset_function.addPropertyOverride('ThingName', props.deviceName)
  }
}
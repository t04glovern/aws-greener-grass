import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

import { ThingVendor } from './functions/thing-vendor';
import { GreengrassRole } from './roles/greengrass';
import { CoreDefinition } from './definitions/core-definition';

const deviceName = 'lila';

export class GreengrassCore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Sets up CloudFormation custom resources for Thing vending
     */
    const thing_vendor_function = new ThingVendor(this, 'thing-vendor', {
      deviceName
    }).thingVendor;

    /**
     * Greengrass Role used by Greengrass Core device
     */
    const greengrass_role = new GreengrassRole(this, 'greengrass-role');

    /**
     * Greengrass - CoreDefinition
     */
    const greengrass_core_def = new CoreDefinition(this, 'greengrass-core-def', {
      deviceName,
      certificateId: thing_vendor_function.getAtt('certificateId').toString()
    });

    /**
     * GreengrassGroup
     */
    const greengrass_group = new greengrass.CfnGroup(this, 'greengrass-group', {
      name: deviceName,
      roleArn: greengrass_role.role.roleArn,
      initialVersion: {
        coreDefinitionVersionArn: greengrass_core_def.version.ref
      }
    });
  }
}

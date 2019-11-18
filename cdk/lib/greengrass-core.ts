import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

import { ThingVendor } from './functions/thing-vendor';
import { GreengrassRole } from './roles/greengrass';

import { CoreDefinition } from './definitions/core-definition';
import { LoggerDefinition } from './definitions/logger-definition';
import { ResourceDefinition } from './definitions/resource-definition';
import { ConnectorDefinition } from './definitions/connector-definition';

const deviceName = 'lila';

export class GreengrassCore extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Sets up CloudFormation custom resources for Thing vending
     * this allows us to vend a device easily and retrieve the certificate
     * details.
     */
    const thing_vendor_function = new ThingVendor(this, 'thing-vendor', {
      deviceName
    });

    /**
     * Greengrass Role used by Greengrass Core device
     */
    const greengrass_role = new GreengrassRole(this, 'greengrass-role');

    /**
     * Greengrass - CoreDefinition
     */
    const greengrass_core_def = new CoreDefinition(this, 'greengrass-core-def', {
      deviceName,
      certificateId: thing_vendor_function.ref.getAtt('certificateId').toString()
    });

    /**
     * Greengrass - LoggerDefinition
     */
    const greengrass_logger_def = new LoggerDefinition(this, 'greengrass-logger-def', {
      deviceName
    });

    /**
     * Greengrass - ResourceDefinition
     */
    const greengrass_resource_def = new ResourceDefinition(this, 'greengrass-resource-def', {
      deviceName
    });

    /**
     * Greengrass - ConnectorDefinition
     */
    const greengrass_connector_def = new ConnectorDefinition(this, 'greengrass-connector-def', {
      deviceName
    });

    /**
     * GreengrassGroup
     */
    const greengrass_group = new greengrass.CfnGroup(this, 'greengrass-group', {
      name: deviceName,
      roleArn: greengrass_role.roleArn,
      initialVersion: {
        coreDefinitionVersionArn: greengrass_core_def.version.ref,
        loggerDefinitionVersionArn: greengrass_logger_def.version.ref,
        resourceDefinitionVersionArn: greengrass_resource_def.version.ref,
        connectorDefinitionVersionArn: greengrass_connector_def.version.ref
      }
    });

    /**
     * Stack Outputs
     */
    new cdk.CfnOutput(this, 'certificateId', {
      value: thing_vendor_function.ref.getAtt('certificateId').toString()
    });
    new cdk.CfnOutput(this, 'certificatePem', {
      value: thing_vendor_function.ref.getAtt('certificatePem').toString()
    });
    new cdk.CfnOutput(this, 'privateKey', {
      value: thing_vendor_function.ref.getAtt('privateKey').toString()
    });
    new cdk.CfnOutput(this, 'iotEndpoint', {
      value: thing_vendor_function.ref.getAtt('iotEndpoint').toString()
    });
    new cdk.CfnOutput(this, 'greengrassGroupId', {
      value: greengrass_group.attrId
    });
  }
}

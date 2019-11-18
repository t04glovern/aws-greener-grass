import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

export interface IResourceDefinition {
  deviceName: string
}

export class ResourceDefinition extends cdk.Construct {

  private readonly def: greengrass.CfnResourceDefinition;
  public readonly version: greengrass.CfnResourceDefinitionVersion;

  constructor(scope: cdk.Construct, id: string, props: IResourceDefinition) {
    super(scope, id);

    this.def = new greengrass.CfnResourceDefinition(this, 'greengrass-resource-definition', {
      name: props.deviceName
    })
    this.version = new greengrass.CfnResourceDefinitionVersion(this, 'greengrass-resource-definition-version', {
      resourceDefinitionId: this.def.attrId,
      resources: [
        {
          id: `${props.deviceName}-local-device-proc-dd`,
          name: 'LocalDeviceResourceDeviceDefender',
          resourceDataContainer: {
            localVolumeResourceData: {
              sourcePath: '/proc',
              destinationPath: '/proc-dd'
            }
          }
        }
      ]
    })
  }
}
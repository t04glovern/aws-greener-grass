import cdk = require("@aws-cdk/core");
import greengrass = require('@aws-cdk/aws-greengrass');

export interface ICoreDefinition {
  deviceName: string
  certificateId: string
}

export class CoreDefinition extends cdk.Construct {

  private readonly def: greengrass.CfnCoreDefinition;
  public readonly version: greengrass.CfnCoreDefinitionVersion;

  constructor(scope: cdk.Construct, id: string, props: ICoreDefinition) {
    super(scope, id);

    this.def = new greengrass.CfnCoreDefinition(this, 'greengrass-core-definition', {
      name: props.deviceName
    })
    this.version = new greengrass.CfnCoreDefinitionVersion(this, 'greengrass-core-definition-version', {
      coreDefinitionId: this.def.attrId,
      cores: [
        {
          id: props.deviceName,
          thingArn: `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:thing/${props.deviceName}`,
          certificateArn: `arn:aws:iot:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:cert/${props.certificateId}`,
          syncShadow: true
        }
      ]
    })
  }
}
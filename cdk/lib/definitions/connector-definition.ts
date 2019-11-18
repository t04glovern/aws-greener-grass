import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

export interface IConnectorDefinition {
  deviceName: string
}

export class ConnectorDefinition extends cdk.Construct {

  private readonly def: greengrass.CfnConnectorDefinition;
  public readonly version: greengrass.CfnConnectorDefinitionVersion;

  constructor(scope: cdk.Construct, id: string, props: IConnectorDefinition) {
    super(scope, id);

    this.def = new greengrass.CfnConnectorDefinition(this, 'greengrass-connector-definition', {
      name: props.deviceName
    })
    this.version = new greengrass.CfnConnectorDefinitionVersion(this, 'greengrass-connector-definition-version', {
      connectorDefinitionId: this.def.attrId,
      connectors: [
        {
          id: `${props.deviceName}-device-defender`,
          connectorArn: `arn:aws:greengrass:${cdk.Aws.REGION}::/connectors/DeviceDefender/versions/2`,
          parameters: {
            'SampleIntervalSeconds': '600',
            'ProcDestinationPath': '/proc',
            'ProcDestinationPath-ResourceId': `${props.deviceName}-local-device-proc-dd` // TODO pull this from resource
          }
        }
      ]
    })
  }
}
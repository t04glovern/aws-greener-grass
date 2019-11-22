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
            'SampleIntervalSeconds': '300',
            'ProcDestinationPath': '/host_proc',
            'ProcDestinationPath-ResourceId': `${props.deviceName}-local-device-proc-dd` // TODO pull this from resource
          }
        },
        {
          id: `${props.deviceName}-cloudwatch-metrics`,
          connectorArn: `arn:aws:greengrass:${cdk.Aws.REGION}::/connectors/CloudWatchMetrics/versions/2`,
          parameters: {
            'PublishInterval': '10',
            'PublishRegion': `${cdk.Aws.REGION}`,
            'MemorySize': '65535',
            'MaxMetricsToRetain': '2000'
          }
        }
      ]
    })
  }
}
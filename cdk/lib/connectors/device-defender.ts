import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

export interface IDeviceDefender {
  deviceName: string;
}

export class DeviceDefender extends cdk.Construct {

  public readonly property: greengrass.CfnConnectorDefinitionVersion.ConnectorProperty;

  constructor(scope: cdk.Construct, id: string, props: IDeviceDefender) {
    super(scope, id);

    this.property = {
      id: `${props.deviceName}-device-defender`,
      connectorArn: `arn:aws:greengrass:${cdk.Aws.REGION}::/connectors/DeviceDefender/versions/2`,
      parameters: {
        'SampleIntervalSeconds': '300',
        'ProcDestinationPath': '/host_proc',
        'ProcDestinationPath-ResourceId': `${props.deviceName}-local-device-proc-dd` // TODO pull this from resource
      }
    }
  }
}
import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

export interface ICloudWatchMetrics {
  deviceName: string;
}

export class CloudWatchMetrics extends cdk.Construct {

  public readonly property: greengrass.CfnConnectorDefinitionVersion.ConnectorProperty;

  constructor(scope: cdk.Construct, id: string, props: ICloudWatchMetrics) {
    super(scope, id);

    this.property = {
      id: `${props.deviceName}-cloudwatch-metrics`,
      connectorArn: `arn:aws:greengrass:${cdk.Aws.REGION}::/connectors/CloudWatchMetrics/versions/2`,
      parameters: {
        'PublishInterval': '10',
        'PublishRegion': `${cdk.Aws.REGION}`,
        'MemorySize': '65535',
        'MaxMetricsToRetain': '2000'
      }
    }
  }
}
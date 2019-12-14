import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');

export interface IDockerApplicationDeployment {
  deviceName: string;
  composeFileBucket: string;
  composeFileKey: string;
}

export class DockerApplicationDeployment extends cdk.Construct {

  public readonly property: greengrass.CfnConnectorDefinitionVersion.ConnectorProperty;

  constructor(scope: cdk.Construct, id: string, props: IDockerApplicationDeployment) {
    super(scope, id);

    this.property = {
      id: `${props.deviceName}-docker`,
      connectorArn: `arn:aws:greengrass:${cdk.Aws.REGION}::/connectors/DockerApplicationDeployment/versions/1`,
      parameters: {
        'DockerComposeFileS3Bucket': `${props.composeFileBucket}`,
        'DockerComposeFileS3Key': `${props.composeFileKey}`,
        'DockerComposeFileDestinationPath': '/home/ggc_user',
        'DockerContainerStatusLogFrequency': '30'
      }
    }
  }
}

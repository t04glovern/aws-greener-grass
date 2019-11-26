import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');
import s3 = require('@aws-cdk/aws-s3');
import { Role } from '@aws-cdk/aws-iam';

import { DockerApplicationDeployment } from '../connectors/docker-application-deployment';
import { DeviceDefender } from '../connectors/device-defender';
import { CloudWatchMetrics } from '../connectors/cloud-watch-metrics';

export interface IConnectorDefinition {
  deviceName: string;
  greengrassRole: Role;
}

export class ConnectorDefinition extends cdk.Construct {

  private readonly def: greengrass.CfnConnectorDefinition;
  public readonly version: greengrass.CfnConnectorDefinitionVersion;

  public readonly dockerBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: IConnectorDefinition) {
    super(scope, id);

    /**
     * Connector - Docker Application Deployment
     */
    this.dockerBucket = new s3.Bucket(this, 'docker-application-bucket');
    this.dockerBucket.grantRead(props.greengrassRole);
    const docker_application_deployment = new DockerApplicationDeployment(this, 'docker-application-deployment', {
      deviceName: props.deviceName,
      composeFileBucket: this.dockerBucket.bucketName,
      composeFileKey: 'docker-compose.yml'
    });

    /**
     * Connector - Device Defender
     */
    const device_defender = new DeviceDefender(this, 'device-defender', {
      deviceName: props.deviceName
    });

    /**
     * Connector - CloudWatch Metrics
     */
    const cloud_watch_metrics = new CloudWatchMetrics(this, 'cloud-watch-metrics', {
      deviceName: props.deviceName
    });

    this.def = new greengrass.CfnConnectorDefinition(this, 'greengrass-connector-def', {
      name: props.deviceName
    });
    this.version = new greengrass.CfnConnectorDefinitionVersion(this, 'greengrass-connector-def-version', {
      connectorDefinitionId: this.def.attrId,
      connectors: [
        cloud_watch_metrics.property,
        device_defender.property,
        docker_application_deployment.property
      ]
    });
  }
}

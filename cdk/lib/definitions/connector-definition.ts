import cdk = require('@aws-cdk/core');
import greengrass = require('@aws-cdk/aws-greengrass');
import assets = require('@aws-cdk/aws-s3-assets');
import { Role } from '@aws-cdk/aws-iam';

import { DockerApplicationDeployment } from '../connectors/docker-application-deployment';
import { DeviceDefender } from '../connectors/device-defender';
import { CloudWatchMetrics } from '../connectors/cloud-watch-metrics';

import path = require('path');

export interface IConnectorDefinition {
  deviceName: string;
  greengrassRole: Role;
}

export class ConnectorDefinition extends cdk.Construct {

  private readonly def: greengrass.CfnConnectorDefinition;
  public readonly version: greengrass.CfnConnectorDefinitionVersion;

  constructor(scope: cdk.Construct, id: string, props: IConnectorDefinition) {
    super(scope, id);

    /**
     * Connector - Docker Application Deployment
     */
    const docker_application_asset = new assets.Asset(this, 'docker-application-asset', {
      path: path.join(__dirname, '../../docker-compose.yml')
    });
    const docker_application_deployment = new DockerApplicationDeployment(this, 'docker-application-deployment', {
      deviceName: props.deviceName,
      composeFileBucket: docker_application_asset.s3BucketName,
      composeFileKey: docker_application_asset.s3ObjectKey
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
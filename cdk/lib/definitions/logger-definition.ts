import cdk = require("@aws-cdk/core");
import greengrass = require('@aws-cdk/aws-greengrass');

export interface ILoggerDefinition {
  deviceName: string
}

export class LoggerDefinition extends cdk.Construct {

  private readonly def: greengrass.CfnLoggerDefinition;
  public readonly version: greengrass.CfnLoggerDefinitionVersion;

  constructor(scope: cdk.Construct, id: string, props: ILoggerDefinition) {
    super(scope, id);

    this.def = new greengrass.CfnLoggerDefinition(this, 'greengrass-logger-definition', {
      name: props.deviceName
    })
    this.version = new greengrass.CfnLoggerDefinitionVersion(this, 'greengrass-logger-definition-version', {
      loggerDefinitionId: this.def.attrId,
      loggers: [
        {
          id: `${props.deviceName}-cw-ggs-logger-info`,
          type: 'AWSCloudWatch',
          component: 'GreengrassSystem',
          level: 'INFO'
        },
        {
          id: `${props.deviceName}-cw-lambda-logger-info`,
          type: 'AWSCloudWatch',
          component: 'Lambda',
          level: 'INFO'
        },
        {
          id: `${props.deviceName}-fs-ggs-logger-info`,
          type: 'FileSystem',
          component: 'GreengrassSystem',
          level: 'INFO',
          space: 25000
        },
        {
          id: `${props.deviceName}-fs-lambda-logger-info`,
          type: 'FileSystem',
          component: 'Lambda',
          level: 'INFO',
          space: 25000
        },
      ]
    })
  }
}
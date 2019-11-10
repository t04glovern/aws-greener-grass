#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { GreengrassCore } from '../lib/greengrass-core';

const app = new cdk.App();
new GreengrassCore(app, 'greengrass-cdk');

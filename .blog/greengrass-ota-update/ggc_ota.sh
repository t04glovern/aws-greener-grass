#!/bin/bash

AWS_REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity | jq -r '.Account')

THING_NAME="thing_name"
THING_OS="raspbian" # ubuntu, amazon_linux, raspbian, openwrt
THING_ARCH="armv7l" # armv7l, armv6l, x86_64, aarch64
THING_SOFTWARE="core" # core, ota_agent

otaUpdateRole=$(aws cloudformation describe-stacks --stack-name greengrass-cdk \
    --query 'Stacks[0].Outputs[?OutputKey==`otaUpdateRole`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

aws greengrass create-software-update-job \
    --region ${AWS_REGION} \
    --update-targets-architecture ${THING_ARCH} \
    --update-targets arn:aws:iot:${AWS_REGION}:${ACCOUNT_ID}:thing/${THING_NAME} \
    --update-targets-operating-system ${THING_OS} \
    --software-to-update ${THING_SOFTWARE} \
    --update-agent-log-level DEBUG \
    --s3-url-signer-role ${otaUpdateRole}

#!/bin/bash

PREFIX="devopstar"
AWS_REGION="us-east-1"

aws cloudformation create-stack \
    --stack-name ${PREFIX}-iot-vendor \
    --template-body file://iot-vendor.yml \
    --region ${AWS_REGION} \
    --capabilities CAPABILITY_IAM

aws cloudformation wait stack-create-complete \
    --stack-name ${PREFIX}-iot-vendor \
    --region ${AWS_REGION}

thingVendorFunction=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-iot-vendor \
    --query 'Stacks[0].Outputs[?OutputKey==`ThingVendorFunction`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

echo "ThingVendorFunction ARN: ${thingVendorFunction}"
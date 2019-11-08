#!/bin/bash

PREFIX="devopstar"
THING_NAME="elise"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity |  jq -r '.Account')

thingVendorFunction=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-iot-vendor \
    --query 'Stacks[0].Outputs[?OutputKey==`ThingVendorFunction`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

groupDeploymentResetFunction=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-iot-vendor \
    --query 'Stacks[0].Outputs[?OutputKey==`GroupDeploymentResetFunction`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

aws cloudformation update-stack \
    --stack-name ${PREFIX}-ggc-${THING_NAME} \
    --template-body file://greengrass-core.yml \
    --parameters \
        ParameterKey=DeviceName,ParameterValue=${THING_NAME} \
        ParameterKey=ThingVendorFunction,ParameterValue=${thingVendorFunction} \
        ParameterKey=GroupDeploymentResetFunction,ParameterValue=${groupDeploymentResetFunction} \
    --region ${AWS_REGION} \
    --capabilities CAPABILITY_IAM

aws cloudformation wait stack-update-complete \
    --stack-name ${PREFIX}-ggc-${THING_NAME} \
    --region ${AWS_REGION}

certificateId=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-ggc-${THING_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CertificateId`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

certificatePem=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-ggc-${THING_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CertificatePem`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

certificatePrivateKey=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-ggc-${THING_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`CertificatePrivateKey`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

iotEndpoint=$(aws cloudformation describe-stacks \
    --stack-name ${PREFIX}-ggc-${THING_NAME} \
    --query 'Stacks[0].Outputs[?OutputKey==`IoTEndpoint`].OutputValue' \
    --region ${AWS_REGION} \
    --output text)

mkdir certs
mkdir config

echo -n "${certificatePem}" > certs/${certificateId}.pem
echo -n "${certificatePrivateKey}" > certs/${certificateId}.key
wget -O certs/root.ca.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

cat <<EOT > config/config.json          
{
    "coreThing" : {
        "caPath" : "root.ca.pem",
        "certPath" : "${certificateId}.pem",
        "keyPath" : "${certificateId}.key",
        "thingArn" : "arn:aws:iot:${AWS_REGION}:${AWS_ACCOUNT_ID}:thing/${THING_NAME}",
        "iotHost" : "${iotEndpoint}",
        "ggHost" : "greengrass-ats.iot.${AWS_REGION}.amazonaws.com"
    },
    "runtime" : {
        "cgroup" : {
        "useSystemd" : "yes"
        }
    },
    "managedRespawn" : false,
    "crypto" : {
        "principals" : {
        "SecretsManager" : {
            "privateKeyPath" : "file:///greengrass/certs/${certificateId}.key"
        },
        "IoTCertificate" : {
            "privateKeyPath" : "file:///greengrass/certs/${certificateId}.key",
            "certificatePath" : "file:///greengrass/certs/${certificateId}.pem"
        }
        },
        "caPath" : "file:///greengrass/certs/root.ca.pem"
    }
}
EOT

tar -czvf ${THING_NAME}-setup.tar.gz certs/ config/
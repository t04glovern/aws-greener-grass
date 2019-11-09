export const thing_vendor_code = `import sys
import cfnresponse
import boto3
from botocore.exceptions import ClientError
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

policyDocument = {
    'Version': '2012-10-17',
    'Statement': [
        {
            'Effect': 'Allow',
            'Action': 'iot:*',
            'Resource': '*'
        },
        {
            'Effect': 'Allow',
            'Action': 'greengrass:*',
            'Resource': '*'
        }
    ]
}


def handler(event, context):
    responseData = {}
    try:
        logger.info('Received event: {}'.format(json.dumps(event)))
        result = cfnresponse.FAILED
        client = boto3.client('iot')
        thingName = event['ResourceProperties']['ThingName']
        if event['RequestType'] == 'Create':
            thing = client.create_thing(
                thingName=thingName
            )
            response = client.create_keys_and_certificate(
                setAsActive=True
            )
            certId = response['certificateId']
            certArn = response['certificateArn']
            certPem = response['certificatePem']
            privateKey = response['keyPair']['PrivateKey']
            client.create_policy(
                policyName='{}-full-access'.format(thingName),
                policyDocument=json.dumps(policyDocument)
            )
            response = client.attach_policy(
                policyName='{}-full-access'.format(thingName),
                target=certArn
            )
            response = client.attach_thing_principal(
                thingName=thingName,
                principal=certArn,
            )
            logger.info('Created thing: %s, cert: %s and policy: %s' %
                        (thingName, certId, '{}-full-access'.format(thingName)))
            result = cfnresponse.SUCCESS
            responseData['certificateId'] = certId
            responseData['certificatePem'] = certPem
            responseData['privateKey'] = privateKey
            responseData['iotEndpoint'] = client.describe_endpoint(
                endpointType='iot:Data-ATS')['endpointAddress']
        elif event['RequestType'] == 'Update':
            logger.info('Updating thing: %s' % thingName)
            result = cfnresponse.SUCCESS
        elif event['RequestType'] == 'Delete':
            logger.info('Deleting thing: %s and cert/policy' % thingName)
            response = client.list_thing_principals(
                thingName=thingName
            )
            for i in response['principals']:
                response = client.detach_thing_principal(
                    thingName=thingName,
                    principal=i
                )
                response = client.detach_policy(
                    policyName='{}-full-access'.format(thingName),
                    target=i
                )
                response = client.update_certificate(
                    certificateId=i.split('/')[-1],
                    newStatus='INACTIVE'
                )
                response = client.delete_certificate(
                    certificateId=i.split('/')[-1],
                    forceDelete=True
                )
                response = client.delete_policy(
                    policyName='{}-full-access'.format(thingName),
                )
                response = client.delete_thing(
                    thingName=thingName
                )
            result = cfnresponse.SUCCESS
    except ClientError as e:
        logger.error('Error: {}'.format(e))
        result = cfnresponse.FAILED
    logger.info('Returning response of: {}, with result of: {}'.format(
        result, responseData))
    sys.stdout.flush()
    cfnresponse.send(event, context, result, responseData)`
export const group_deployment_reset_code = `import os
import sys
import json
import logging
import cfnresponse
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

c = boto3.client('greengrass')
iam = boto3.client('iam')
role_name = 'greengrass_cdk_service_role'

def find_group(thingName):
    response_auth = ''
    response = c.list_groups()
    for group in response['Groups']:
        thingfound = False
        group_version = c.get_group_version(
            GroupId=group['Id'],
            GroupVersionId=group['LatestVersion']
        )
        
        core_arn = group_version['Definition'].get('CoreDefinitionVersionArn', '')
        if core_arn:
            core_id = core_arn[core_arn.index('/cores/')+7:core_arn.index('/versions/')]
            core_version_id = core_arn[core_arn.index('/versions/')+10:len(core_arn)]
            thingfound = False
            response_core_version = c.get_core_definition_version(
                CoreDefinitionId=core_id,
                CoreDefinitionVersionId=core_version_id
            )
            if 'Cores' in response_core_version['Definition']:
                for thing_arn in response_core_version['Definition']['Cores']:
                    if thingName == thing_arn['ThingArn'].split('/')[1]:
                        thingfound = True
                        break
        if(thingfound):
            logger.info('found thing: %s, group id is: %s' % (thingName, group['Id']))
            response_auth = group['Id']
            return(response_auth)

def manage_gg_role(cmd):
    if cmd == 'CREATE':
        try:
            r = iam.create_role(
                RoleName=role_name,
                AssumeRolePolicyDocument='{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Principal": {"Service": "greengrass.amazonaws.com"},"Action": "sts:AssumeRole"}]}',
                Description='GGC Role',
            )
        except ClientError:
            r = iam.get_role(RoleName=role_name)
        role_arn = r['Role']['Arn']
        iam.attach_role_policy(
            RoleName=role_name,
            PolicyArn='arn:aws:iam::aws:policy/service-role/AWSGreengrassResourceAccessRolePolicy'
        )
        c.associate_service_role_to_account(RoleArn=role_arn)
        logger.info('Created and associated role {}'.format(role_name))
    else:
        try:
            r = iam.get_role(RoleName=role_name)
            role_arn = r['Role']['Arn']
            c.disassociate_service_role_from_account()
            iam.delete_role(RoleName=role_name)
            logger.info('Disassociated and deleted role {}'.format(role_name))
        except ClientError:
            return

def handler(event, context):
    responseData = {}
    try:
        logger.info('Received event: {}'.format(json.dumps(event)))
        result = cfnresponse.FAILED
        thingName=event['ResourceProperties']['ThingName']
        if event['RequestType'] == 'Create':
            try:
                c.get_service_role_for_account()
                result = cfnresponse.SUCCESS
            except ClientError as e:
                manage_gg_role('CREATE')
                logger.info('Greengrass service role created')
                result = cfnresponse.SUCCESS
        elif event['RequestType'] == 'Delete':
            group_id = find_group(thingName)
            logger.info('Group id to delete: %s' % group_id)
            if group_id:
                c.reset_deployments(
                    Force=True,
                    GroupId=group_id
                )
                result = cfnresponse.SUCCESS
                logger.info('Forced reset of Greengrass deployment')
                manage_gg_role('DELETE')
            else:
                logger.error('No group Id for thing: %s found' % thingName)
    except ClientError as e:
        logger.error('Error: %s' % e)
        result = cfnresponse.FAILED
    logger.info('Returning response of: %s, with result of: %s' % (result, responseData))
    sys.stdout.flush()
    cfnresponse.send(event, context, result, responseData)`
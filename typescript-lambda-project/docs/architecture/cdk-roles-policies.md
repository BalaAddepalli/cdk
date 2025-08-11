cdk-build-deploy-role


cdk-cfn-execution-role
    Policy: cf-execution-policy 
    Trust:  "Service": "cloudformation.amazonaws.com"
cdk-hnb659fds-cfn-exec-role
    Policy: cf-execution-policy
    Trust:  "Service": "cloudformation.amazonaws.com"
cdk-hnb659fds-deploy-role
    default
cdk-hnb659fds-file-publishing-role
    cdk-hnb659fds-file-publishing-role-default-policy
cdk-hnb659fds-image-publishing-role
    cdk-hnb659fds-image-publishing-role-default-policy
cdk-hnb659fds-lookup-role
    LookupRolePolicy
    ReadOnlyAccess 


User: arn:aws:sts::992382718681:assumed-role/AWSReservedSSO_ReadOnlyAccess_ef8dd3115c15c2cc/G94657@velliv.dk is not authorized to perform: codeconnections:UseConnection on resource: arn:aws:codeconnections:eu-central-1:992382718681:connection/06ea67c8-050c-4067-ae08-9bc3e3bc2ea2 because no identity-based policy allows the codeconnections:UseConnection action

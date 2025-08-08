#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}
WORKLOAD_ACCOUNT=${2}

if [ -z "$WORKLOAD_ACCOUNT" ]; then
  echo "Usage: ./deploy.sh <environment> <workload-account-id>"
  exit 1
fi

echo "Deploying to $ENVIRONMENT environment in account $WORKLOAD_ACCOUNT"

# Assume cross-account role
aws sts assume-role \
  --role-arn "arn:aws:iam::$WORKLOAD_ACCOUNT:role/BalaCrossAccountDeploymentRole" \
  --role-session-name "lambda-deployment-$ENVIRONMENT"

# Deploy using CDK
cdk deploy --require-approval never
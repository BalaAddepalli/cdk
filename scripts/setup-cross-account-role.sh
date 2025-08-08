#!/bin/bash
set -e

WORKLOAD_ACCOUNT_ID="123456789013"
CICD_ACCOUNT_ID="123456789012"

echo "Creating cross-account deployment role in workload account..."

aws iam create-role \
  --role-name CrossAccountDeploymentRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::'$CICD_ACCOUNT_ID':root"
        },
        "Action": "sts:AssumeRole",
        "Condition": {
          "StringEquals": {
            "sts:ExternalId": "'$WORKLOAD_ACCOUNT_ID'"
          }
        }
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name CrossAccountDeploymentRole \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

echo "Cross-account role created successfully!"
echo "Update app.ts with your actual account IDs: CICD=$CICD_ACCOUNT_ID, Workload=$WORKLOAD_ACCOUNT_ID"
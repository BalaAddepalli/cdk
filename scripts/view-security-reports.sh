#!/bin/bash

# Script to view security scan reports from CodeBuild artifacts

BUILD_ID=${1:-latest}
PROJECT_NAME="TypeScriptLambdaPipeline-BuildProject"

echo "🔍 Security Scan Reports Viewer"
echo "================================"

if [ "$BUILD_ID" = "latest" ]; then
    echo "Getting latest build ID..."
    BUILD_ID=$(aws codebuild list-builds-for-project --project-name $PROJECT_NAME --query 'ids[0]' --output text)
fi

echo "Build ID: $BUILD_ID"
echo ""

# Download artifacts
echo "📥 Downloading security reports..."
aws codebuild batch-get-builds --ids $BUILD_ID --query 'builds[0].artifacts.location' --output text | xargs -I {} aws s3 cp {} ./security-reports/ --recursive

# Display npm audit report
if [ -f "./security-reports/npm-audit-report.json" ]; then
    echo "🛡️  NPM AUDIT REPORT"
    echo "==================="
    cat ./security-reports/npm-audit-report.json | jq '.vulnerabilities // "No vulnerabilities found"'
    echo ""
fi

# Display ESLint security report
if [ -f "./security-reports/eslint-security-report.json" ]; then
    echo "🔒 ESLINT SECURITY REPORT"
    echo "========================="
    cat ./security-reports/eslint-security-report.json | jq '.[] | select(.messages | length > 0) | {filePath, messages: .messages | map({ruleId, severity, message, line})}' || echo "No security issues found"
    echo ""
fi

echo "✅ Security reports review completed"
echo "Reports saved in: ./security-reports/"
# AWS Setup Guide for AI Graphic Designer

## IAM User Permissions

### Required Policies for Application Owner

Attach these policies to your IAM user:

1. **Custom Policy: AIGraphicDesignerOwner**
   ```bash
   aws iam create-policy --policy-name AIGraphicDesignerOwner --policy-document file://aws-iam-policies.json
   aws iam attach-user-policy --user-name YOUR_USERNAME --policy-arn arn:aws:iam::YOUR_ACCOUNT:policy/AIGraphicDesignerOwner
   ```

2. **AWS Managed Policies:**
   ```bash
   aws iam attach-user-policy --user-name YOUR_USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonBedrockFullAccess
   aws iam attach-user-policy --user-name YOUR_USERNAME --policy-arn arn:aws:iam::aws:policy/AmazonCognitoPowerUser
   ```

## Cognito Identity Pool Setup

### 1. Create Identity Pool
```bash
aws cognito-identity create-identity-pool \
  --identity-pool-name "AIGraphicDesignerPool" \
  --allow-unauthenticated-identities
```

### 2. Create IAM Role for Unauthenticated Users
```bash
aws iam create-role \
  --role-name Cognito_AIGraphicDesignerPoolUnauth_Role \
  --assume-role-policy-document file://cognito-trust-policy.json

aws iam put-role-policy \
  --role-name Cognito_AIGraphicDesignerPoolUnauth_Role \
  --policy-name BedrockAccess \
  --policy-document file://cognito-bedrock-policy.json
```

### 3. Set Identity Pool Roles
```bash
aws cognito-identity set-identity-pool-roles \
  --identity-pool-id "us-east-1:YOUR_IDENTITY_POOL_ID" \
  --roles unauthenticated=arn:aws:iam::YOUR_ACCOUNT:role/Cognito_AIGraphicDesignerPoolUnauth_Role
```

## Bedrock Model Access

### Enable Required Models
```bash
# Enable Claude 3 Sonnet
aws bedrock put-model-invocation-logging-configuration \
  --logging-config destinationConfig='{cloudWatchConfig={logGroupName="/aws/bedrock/modelinvocations",roleArn="arn:aws:iam::YOUR_ACCOUNT:role/service-role/AmazonBedrockExecutionRoleForCloudWatchLogs"}}'

# Enable Stable Diffusion XL
aws bedrock get-foundation-model --model-identifier stability.stable-diffusion-xl-v1
```

## Required Permissions Summary

### IAM User Permissions:
- `bedrock:*` - Full Bedrock access
- `cognito-identity:*` - Cognito Identity Pool management
- `cognito-idp:*` - Cognito User Pool management
- `iam:CreateRole`, `iam:AttachRolePolicy` - Role management
- `s3:*` - S3 bucket access for assets
- `logs:*` - CloudWatch logging

### Cognito Role Permissions:
- `bedrock:InvokeModel` - Invoke specific Bedrock models
- Limited to Claude 3 Sonnet and Stable Diffusion XL

## Security Best Practices

1. **Least Privilege**: Only grant necessary permissions
2. **Resource Restrictions**: Limit S3 access to specific buckets
3. **Model Restrictions**: Only allow required Bedrock models
4. **Monitoring**: Enable CloudWatch logging for all API calls
5. **Regular Rotation**: Rotate IAM user access keys regularly

## Environment Configuration

Update your `next.config.js`:
```javascript
env: {
  NEXT_PUBLIC_AWS_REGION: 'us-east-1',
  NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID: 'us-east-1:YOUR_ACTUAL_IDENTITY_POOL_ID',
}
```

## Verification Commands

Test your setup:
```bash
# Test Bedrock access
aws bedrock list-foundation-models --region us-east-1

# Test Cognito Identity Pool
aws cognito-identity describe-identity-pool --identity-pool-id YOUR_IDENTITY_POOL_ID

# Test IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name YOUR_USERNAME
```
# Terraform Infrastructure Setup

## 🏗️ Infrastructure Components

### AWS Resources Created:
- **Cognito Identity Pool** - Unauthenticated user access
- **IAM Role & Policy** - Bedrock model permissions
- **S3 Bucket** - Design asset storage
- **CloudWatch Logs** - Application monitoring

## 🚀 Quick Setup

### 1. Install Terraform
```bash
# Windows (using Chocolatey)
choco install terraform

# Or download from: https://terraform.io/downloads
```

### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region: us-east-1
# Enter output format: json
```

### 3. Initialize Terraform
```bash
cd terraform
terraform init
```

### 4. Plan Infrastructure
```bash
terraform plan
```

### 5. Deploy Infrastructure
```bash
terraform apply
```

### 6. Get Outputs
```bash
terraform output
```

## 📋 Configuration

### Variables (terraform.tfvars)
```hcl
aws_region   = "us-east-1"
environment  = "production"
project_name = "ai-graphic-designer"
```

### Required Permissions
Your AWS user needs:
- `AmazonCognitoPowerUser`
- `IAMFullAccess`
- `AmazonS3FullAccess`
- `AmazonBedrockFullAccess`

## 🔧 Update Application Config

After deployment, update your `.env.local`:
```bash
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-actual-pool-id
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## 🗑️ Cleanup

To destroy infrastructure:
```bash
terraform destroy
```

## 📊 Monitoring

Resources include:
- CloudWatch logging for API calls
- S3 access logging
- Cognito usage metrics

## 🔒 Security Features

- **Least Privilege**: Minimal IAM permissions
- **Encrypted Storage**: S3 encryption at rest
- **Secure Access**: Cognito identity-based access
- **Network Security**: VPC endpoints (optional)
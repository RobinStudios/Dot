# Deployment Guide - Terraform Backend

## 🎯 **Final Architecture**

**Terraform-managed AWS infrastructure:**
- AWS Cognito Identity Pool (unauthenticated access)
- AWS Bedrock (Claude 3 Sonnet for AI generation)
- S3 Bucket (design asset storage)
- IAM Roles (proper Bedrock permissions)

## 🚀 **Quick Deploy**

```bash
# 1. Deploy infrastructure
chmod +x deploy.sh
./deploy.sh

# 2. Add your Replicate token to .env.local
# 3. Deploy application
npm run build
vercel --prod
```

## 📋 **Manual Deployment**

### 1. Deploy AWS Infrastructure
```bash
cd terraform
terraform init
terraform apply
```

### 2. Configure Environment
```bash
# Get terraform outputs
terraform output cognito_identity_pool_id
terraform output s3_bucket_name

# Update .env.local with outputs
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-output-id
NEXT_PUBLIC_S3_BUCKET=your-bucket-name
```

### 3. Deploy Application
```bash
npm run build
vercel --prod
```

## ✅ **What Works**

- ✅ AI design generation via AWS Bedrock
- ✅ Image generation via Replicate
- ✅ File uploads to S3
- ✅ In-memory user authentication
- ✅ Supabase integration for users
- ✅ Design editor with auto-save

## 🔧 **No Conflicting Architectures**

Using **only** Terraform-managed AWS infrastructure:
- ❌ No Lambda functions
- ❌ No separate database setup
- ❌ No complex backend services
- ✅ Simple, scalable, cost-effective

Ready for production deployment!
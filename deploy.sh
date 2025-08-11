#!/bin/bash

echo "🚀 Deploying AI Graphic Designer with Terraform Backend"

# Deploy AWS infrastructure
echo "📦 Deploying AWS infrastructure..."
cd terraform
terraform init
terraform apply -auto-approve

# Get outputs
echo "📋 Getting Terraform outputs..."
COGNITO_POOL_ID=$(terraform output -raw cognito_identity_pool_id)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
AWS_REGION=$(terraform output -raw aws_region)

# Update environment file
echo "⚙️ Updating environment configuration..."
cd ..
cat > .env.local << EOF
NEXT_PUBLIC_AWS_REGION=$AWS_REGION
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=$COGNITO_POOL_ID
NEXT_PUBLIC_S3_BUCKET=$S3_BUCKET
REPLICATE_API_TOKEN=your-replicate-token-here
JWT_SECRET=$(openssl rand -base64 32)
API_KEY_ENCRYPTION_KEY=$(openssl rand -base64 32)
CSRF_SECRET=$(openssl rand -base64 32)
EOF

echo "✅ Infrastructure deployed successfully!"
echo "📝 Please update REPLICATE_API_TOKEN in .env.local"
echo "🚀 Run 'npm run build && vercel --prod' to deploy the application"
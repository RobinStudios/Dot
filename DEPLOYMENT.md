# Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Set Environment Variables
In Vercel dashboard, add:
```
# Required for AWS integration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-pool-id
S3_BUCKET_NAME=your-s3-bucket-name

# Required for Replicate integration
REPLICATE_API_TOKEN=r8_your_token

# Required for GitHub integration
GITHUB_TOKEN=ghp_your_token
```

### 4. IAM Policy for Presigned URLs
For the application to access images from the private S3 bucket, the serverless functions (running on Vercel, for example) need permission to generate presigned URLs. You must create an IAM policy in your AWS account and attach it to the execution role for your Next.js application.

A sample policy is provided in `s3-presigned-url-policy.json`. Remember to replace `your-bucket-name` with your actual S3 bucket name.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## 🌐 Alternative Deployments

### Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Railway
```bash
railway login
railway init
railway up
```

### Docker
```bash
docker build -t ai-graphic-designer .
docker run -p 3000:3000 ai-graphic-designer
```

## 📋 Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] AWS Cognito Identity Pool created
- [ ] Replicate API token added
- [ ] GitHub token configured
- [ ] Terraform infrastructure deployed
- [ ] Domain configured (optional)

## 🔧 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Static export
npm run build
npm run export
```

Your AI Graphic Designer is ready to go live! 🎨
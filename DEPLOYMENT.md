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
REPLICATE_API_TOKEN=r8_your_token
GITHUB_TOKEN=ghp_your_token
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-pool-id
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
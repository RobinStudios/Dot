# Deployment Guide

## 🚀 Quick Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add AWS_REGION
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   vercel env add REPLICATE_API_TOKEN
   vercel env add CSRF_SECRET
   vercel env add JWT_SECRET
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🐳 Docker Deployment

1. **Build Image**
   ```bash
   npm run docker:build
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e AWS_REGION=us-east-1 \
     -e AWS_ACCESS_KEY_ID=your_key \
     -e AWS_SECRET_ACCESS_KEY=your_secret \
     -e REPLICATE_API_TOKEN=your_token \
     -e CSRF_SECRET=your_csrf_secret \
     -e JWT_SECRET=your_jwt_secret \
     ai-graphic-designer
   ```

## ☁️ AWS ECS Deployment

1. **Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   docker tag ai-graphic-designer:latest your-account.dkr.ecr.us-east-1.amazonaws.com/ai-graphic-designer:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/ai-graphic-designer:latest
   ```

2. **Create ECS Service**
   - Use the pushed image
   - Set environment variables
   - Configure load balancer
   - Enable auto-scaling

## 📊 Health Monitoring

- **Health Check**: `GET /api/health`
- **Expected Response**: `{"status":"healthy","timestamp":"...","version":"1.0.0"}`

## 🔧 Production Checklist

- [ ] Set all environment variables
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Configure CDN for static assets
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Test all API endpoints
- [ ] Verify security headers
- [ ] Test mobile responsiveness
- [ ] Set up error tracking
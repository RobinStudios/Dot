# Replicate API Setup

## 🔐 Secure API Key Configuration

### 1. Get Replicate API Token
1. Go to [replicate.com](https://replicate.com)
2. Sign up/login to your account
3. Go to Account Settings → API Tokens
4. Create new token and copy it

### 2. Environment Setup
Create `.env.local` file in project root:
```bash
# Server-side only - never exposed to client
REPLICATE_API_TOKEN=r8_your_actual_token_here

# Public environment variables
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-identity-pool-id
```

### 3. Install Dependencies
```bash
npm install replicate
```

### 4. API Usage
```javascript
// Server-side API route only
import { generateImageWithReplicate } from '@/lib/replicate/client';

const imageUrl = await generateImageWithReplicate("modern website design");
```

## 🔒 Security Best Practices

✅ **Correct:**
- API key stored in `.env.local` (server-side only)
- Never expose `REPLICATE_API_TOKEN` to client
- Use API routes for Replicate calls

❌ **Never do:**
- Put API key in client-side code
- Use `NEXT_PUBLIC_` prefix for API tokens
- Commit API keys to version control

## 📡 Available Endpoints

### Generate Image
```bash
POST /api/replicate/generate
{
  "prompt": "modern website design",
  "type": "image"
}
```

### Generate Design
```bash
POST /api/replicate/generate
{
  "prompt": "landing page for tech startup",
  "type": "design"
}
```

## 🚀 Deployment

### Vercel
Add environment variable in Vercel dashboard:
- Key: `REPLICATE_API_TOKEN`
- Value: `r8_your_token_here`

### Other Platforms
Set environment variable:
```bash
export REPLICATE_API_TOKEN=r8_your_token_here
```
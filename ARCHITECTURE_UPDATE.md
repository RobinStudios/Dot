# Architecture Update - Bolt.new Template Alignment

## 🏗️ **Updated Architecture**

Following the Bolt.new template pattern, our application now uses:

### **Primary Backend: AWS Lambda + Bedrock**
- ✅ **AWS Lambda**: Serverless functions for all API endpoints
- ✅ **AWS Bedrock**: AI model inference (Claude 3 Haiku)
- ✅ **AWS Cognito**: Identity pool for secure API access
- ✅ **In-Memory Storage**: User sessions persist during Lambda execution
- ✅ **Stateless Design**: Each request is independent

### **User Integration: Supabase (Optional)**
- 🔧 **User's Own Supabase**: Users can connect their own Supabase projects
- 🔧 **Design Deployment**: Deploy generated designs to user's database
- 🔧 **Project Management**: Store projects in user's Supabase
- 🔧 **Self-Hosted**: Users control their own data

## 📊 **Data Flow**

```
User Request → AWS Lambda → AWS Bedrock → Response
     ↓
Optional: Deploy to User's Supabase
```

### **Authentication Flow**
1. User signs up/logs in → Lambda stores in memory
2. JWT token issued for session management
3. Token validates against Lambda memory store
4. Demo user available for testing

### **AI Generation Flow**
1. User submits prompt → Lambda function
2. Lambda calls AWS Bedrock (Claude 3 Haiku)
3. AI generates design specification
4. Response sent back to user
5. Optional: User deploys to their Supabase

### **Supabase Integration Flow**
1. User enters their Supabase credentials
2. Test connection to user's project
3. Deploy designs directly to user's database
4. User manages their own data

## 🚀 **Current Implementation**

### **Working Lambda Functions**
- ✅ `/api/auth/*` - Authentication with in-memory storage
- ✅ `/api/generate` - AWS Bedrock design generation
- ✅ `/api/images/generate` - Replicate image generation
- ✅ `/api/integrations/supabase/*` - User Supabase deployment

### **Supabase Integration**
- ✅ `SupabaseDeployment` class for user project integration
- ✅ Connection testing API
- ✅ Design deployment API
- ✅ User interface for Supabase configuration

### **Demo Features**
- ✅ Demo user (email: demo@example.com, password: password)
- ✅ AI generation with fallbacks
- ✅ Design editing and management
- ✅ Supabase deployment testing

## 🔧 **Environment Configuration**

```bash
# AWS Lambda + Bedrock (Primary Backend)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:your-pool-id

# AI Services
REPLICATE_API_TOKEN=your-replicate-token

# Security
JWT_SECRET=your-jwt-secret
API_KEY_ENCRYPTION_KEY=your-encryption-key

# No Supabase required for main app
# Users provide their own Supabase credentials
```

## 🎯 **Key Differences from Previous Architecture**

### **Before (Database-Centric)**
- Required Supabase setup for main app
- Database-first design
- Complex user management

### **After (Lambda-Centric)**
- AWS Lambda handles all backend logic
- In-memory user storage
- Users optionally connect their own Supabase
- Stateless, scalable design

## 📈 **Benefits**

1. **Serverless**: No database maintenance required
2. **Scalable**: Lambda auto-scales with demand
3. **User Control**: Users own their data in their Supabase
4. **Simple Setup**: Just AWS credentials needed
5. **Cost Effective**: Pay per request model

## 🚀 **Deployment Ready**

The application is now aligned with Bolt.new architecture:
- ✅ AWS Lambda backend
- ✅ AWS Bedrock AI integration
- ✅ User Supabase integration
- ✅ In-memory session management
- ✅ Stateless design
- ✅ Demo user for testing

Ready for production deployment with minimal infrastructure requirements!
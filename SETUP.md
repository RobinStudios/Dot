# Database Setup Guide

## 1. Supabase Database Setup

### Create Tables
Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of src/lib/db/schema.sql
```

### Environment Variables
Add to your `.env.local`:

```bash
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_key

# Security
CSRF_SECRET=your_csrf_secret_key
```

## 2. Authentication Flow

### Complete Authentication System
- ✅ User registration with password hashing
- ✅ Email/password login
- ✅ Session management with JWT tokens
- ✅ Password reset functionality
- ✅ Email verification system
- ✅ Secure session storage in database

### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/verify-email?token=xxx` - Email verification

## 3. Database Integration

### Project & Design Management
- ✅ User projects with ownership
- ✅ Design storage with JSONB elements
- ✅ Real-time collaboration sessions
- ✅ Secure data persistence

### API Endpoints
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/designs?projectId=xxx` - Get project designs
- `POST /api/designs` - Save design to project

## 4. Testing the Implementation

### 1. Database Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase credentials
```

### 2. Run Database Schema
```sql
-- In Supabase SQL Editor, run:
-- src/lib/db/schema.sql
```

### 3. Test Authentication
```bash
# Start development server
npm run dev

# Test endpoints:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### 4. Test Database Operations
```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create project (use token from login)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My First Project","description":"Test project"}'
```

## 5. What's Now Working

### ✅ Complete Authentication
- Real user registration and login
- Secure password hashing with bcrypt
- JWT session management
- Password reset with tokens
- Email verification system

### ✅ Database Persistence
- User data stored in PostgreSQL
- Projects and designs saved to database
- Real-time collaboration session tracking
- Secure data validation and sanitization

### ✅ API Security
- Input validation with Zod schemas
- CSRF protection on all endpoints
- SQL injection prevention
- Secure session management

## 6. Next Steps

The core authentication and database systems are now complete. The application can:

1. **Register and authenticate real users**
2. **Store and retrieve user projects**
3. **Save and load design data**
4. **Manage user sessions securely**

All following the Bolt.new framework patterns for scalability and security.
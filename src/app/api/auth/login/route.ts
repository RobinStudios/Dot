import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security/csrf';

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);
    
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    
    const user = await authService.verifyUser(sanitizedEmail, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = await authService.createSession(user);
    
    return NextResponse.json({ 
      user, 
      token 
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
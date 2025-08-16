import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security/csrf';
import { authService } from '@/lib/auth/auth';

const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'];
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }
    const body = await request.json();
    const validatedData = SignupSchema.parse(body);
    const sanitizedEmail = sanitizeInput(validatedData.email.toLowerCase());
    const sanitizedName = sanitizeInput(validatedData.name);
    // Cognito sign-up
    const user = await authService.createUser(sanitizedEmail, validatedData.password, sanitizedName);
    // Cognito session/JWT
    const token = await authService.createSession(user);
    return NextResponse.json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
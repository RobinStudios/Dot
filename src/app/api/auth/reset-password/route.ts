import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security/csrf';

const ResetRequestSchema = z.object({
  email: z.string().email().max(255),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.email) {
      // Request password reset
      const { email } = ResetRequestSchema.parse(body);
      const sanitizedEmail = sanitizeInput(email.toLowerCase());
      
      const token = await authService.generatePasswordResetToken(sanitizedEmail);
      
      if (token) {
        // In production, send email with reset link
        console.log(`Password reset token for ${sanitizedEmail}: ${token}`);
      }
      
      // Always return success to prevent email enumeration
      return NextResponse.json({ message: 'Reset email sent if account exists' });
    }
    
    if (body.token && body.password) {
      // Reset password with token
      const { token, password } = ResetPasswordSchema.parse(body);
      
      const success = await authService.resetPassword(token, password);
      
      if (!success) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ message: 'Password reset successful' });
    }
    
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Reset failed' },
      { status: 500 }
    );
  }
}
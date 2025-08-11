import { NextRequest } from 'next/server';
import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

export class CSRFProtection {
  private static secret = CSRF_SECRET;

  static generateToken(userId: string): string {
    return crypto.createHash('sha256')
      .update(`${userId}-${this.secret}`)
      .digest('hex');
  }

  static validateToken(userId: string, token: string): boolean {
    const expectedToken = this.generateToken(userId);
    return crypto.timingSafeEqual(
      Buffer.from(expectedToken),
      Buffer.from(token)
    );
  }
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function validateCSRF(request: NextRequest): Promise<boolean> {
  if (request.method === 'GET') return true;
  
  const token = request.headers.get('x-csrf-token');
  const sessionToken = request.headers.get('x-session-token');
  
  if (!token || !sessionToken) return false;
  
  try {
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(sessionToken);
    const expectedToken = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    );
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"'&]/g, '')
    .replace(/\b(script|javascript|vbscript|onload|onerror)\b/gi, '')
    .trim()
    .substring(0, 1000);
}

export function sanitizeLogInput(input: string): string {
  return input
    .replace(/[\r\n]/g, ' ')
    .replace(/[<>\"'&]/g, '')
    .substring(0, 200);
}
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  max: number;
  window: number;
}

const requests = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining?: number }> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const key = `${ip}:${request.nextUrl.pathname}`;
  
  const current = requests.get(key);
  
  if (!current || now > current.resetTime) {
    requests.set(key, { count: 1, resetTime: now + config.window });
    return { success: true, remaining: config.max - 1 };
  }
  
  if (current.count >= config.max) {
    return { success: false };
  }
  
  current.count++;
  return { success: true, remaining: config.max - current.count };
}
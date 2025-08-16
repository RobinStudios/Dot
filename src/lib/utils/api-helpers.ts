// Utility for consistent API error logging and responses
import { NextResponse } from 'next/server';

export function logError(context: string, error: unknown) {
  // You can extend this to log to a service like Sentry
  if (error instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, error.message, error.stack);
  } else {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, error);
  }
}

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status, headers: securityHeaders() });
}

export function apiSuccess(data: object, status: number = 200) {
  return NextResponse.json(data, { status, headers: securityHeaders() });
}

export function securityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
  };
}

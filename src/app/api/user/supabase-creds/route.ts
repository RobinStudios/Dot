import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { z } from 'zod';

const SupabaseCredsSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1)
});

// Store encrypted credentials in-memory for demo (replace with DB for production)
const userSupabaseCreds: Record<string, { url: string; key: string }> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = SupabaseCredsSchema.parse(body);
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Missing user ID' }, { status: 401 });
    userSupabaseCreds[userId] = {
      url: encrypt(validated.url),
      key: encrypt(validated.key)
    };
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  if (!userId || !userSupabaseCreds[userId]) {
    return NextResponse.json({ error: 'No credentials found' }, { status: 404 });
  }
  const creds = userSupabaseCreds[userId];
  return NextResponse.json({
    url: decrypt(creds.url),
    key: decrypt(creds.key)
  });
}

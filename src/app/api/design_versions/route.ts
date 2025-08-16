import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { designVersionService, DesignVersionSchema } from '@/lib/db/design_versions';
import { sanitizeInput } from '@/lib/utils/validation';

// ...existing code...

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const validated = DesignVersionSchema.parse(body);
    // Sanitize prompt to mitigate prompt injection
    if (validated.prompt) {
      validated.prompt = sanitizeInput(validated.prompt);
    }
  const version = await designVersionService.saveVersion(validated);
  return NextResponse.json({ success: true, version }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors, code: 'VALIDATION_ERROR' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { sessionManager } from '@/lib/auth/session-manager';
import { z } from 'zod';
import crypto from 'crypto';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const ImageRequestSchema = z.object({
  prompt: z.string().min(1).max(500),
  width: z.number().min(256).max(2048).optional(),
  height: z.number().min(256).max(2048).optional(),
  csrfToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'];
    
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await sessionManager.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Input validation
    const body = await request.json();
    const validatedData = ImageRequestSchema.parse(body);

    // CSRF token validation
    const expectedToken = crypto.createHash('sha256')
      .update(`${user.id}-${process.env.CSRF_SECRET}`)
      .digest('hex');
    
    if (validatedData.csrfToken !== expectedToken) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Sanitize prompt
    const sanitizedPrompt = validatedData.prompt
      .replace(/[<>\"'&]/g, '')
      .replace(/\b(nude|nsfw|explicit)\b/gi, '')
      .substring(0, 300);

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: sanitizedPrompt,
          width: validatedData.width || 1024,
          height: validatedData.height || 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      }
    ) as string[];

    return NextResponse.json({ 
      imageUrl: output[0] 
    });

  } catch (error) {
    console.error('Replicate API error:', error);
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}
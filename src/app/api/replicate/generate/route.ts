import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { rateLimit } from '@/lib/security/rate-limit';
import { logError } from '@/lib/utils/api-helpers';
import { authService } from '@/lib/auth/auth';
import { z } from 'zod';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const GenerateSchema = z.object({
  prompt: z.string().min(1),
  style: z.string().default('modern'),
  type: z.string().default('logo')
});

export async function POST(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 10, window: 60000 });
    if (!rate.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const body = await request.json();
    const { prompt, style, type } = GenerateSchema.parse(body);
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }
    const output = await replicate.run(
      "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
      {
        input: {
          prompt: `${prompt}, ${style} style, ${type}, professional, clean, vector art, white background, high quality`,
          width: 512,
          height: 512,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50
        }
      }
    );
    return NextResponse.json({
      success: true,
      imageUrl: Array.isArray(output) ? output[0] : output,
      prompt,
      style,
      type
    });
  } catch (error: any) {
    logError('ReplicateGenerateAPI', error);
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}
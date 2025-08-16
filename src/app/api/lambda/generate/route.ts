import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/security/rate-limit';
import { logError } from '@/lib/utils/api-helpers';
import { authService } from '@/lib/auth/auth';
import { z } from 'zod';

const GenerateSchema = z.object({
  prompt: z.string().min(1),
  style: z.string().default('modern'),
  model: z.string().default('lambda-text-to-image')
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
    const { prompt, style, model } = GenerateSchema.parse(body);
    if (!process.env.LAMBDA_API_KEY) {
      return NextResponse.json({ error: 'Lambda API key not configured' }, { status: 500 });
    }
    const response = await fetch('https://api.lambdalabs.com/v1/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LAMBDA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${prompt}, ${style} style, professional, clean, high quality`,
        num_images: 1,
        width: 512,
        height: 512,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        seed: Math.floor(Math.random() * 1000000)
      })
    });
    if (!response.ok) {
      throw new Error(`Lambda API error: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json({
      success: true,
      imageUrl: data.generated_images[0],
      prompt,
      style,
      model: 'lambda'
    });
  } catch (error: any) {
    logError('LambdaGenerateAPI', error);
    return NextResponse.json({ error: error.message || 'Lambda generation failed' }, { status: 500 });
  }
}
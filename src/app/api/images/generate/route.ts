import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import Replicate from 'replicate';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security/csrf';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || 'your_actual_replicate_token_here',
});

const ImageSchema = z.object({
  prompt: z.string().min(1).max(500),
  style: z.string().optional(),
  width: z.number().min(256).max(2048).optional(),
  height: z.number().min(256).max(2048).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, style = 'modern', width = 1024, height = 1024 } = ImageSchema.parse(body);

    const sanitizedPrompt = sanitizeInput(prompt)
      .replace(/\b(nude|nsfw|explicit)\b/gi, '')
      .substring(0, 300);

    const fullPrompt = `${sanitizedPrompt}, ${style} style, professional, clean, high quality`;

    let output: string[];
    
    if (process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_API_TOKEN !== 'your_actual_replicate_token_here') {
      output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: fullPrompt,
            width,
            height,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 50,
            guidance_scale: 7.5,
          }
        }
      ) as string[];
    } else {
      // Fallback placeholder image
      output = [`data:image/svg+xml;base64,${Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="#6b7280">Generated: ${sanitizedPrompt}</text></svg>`).toString('base64')}`];
    }

    return NextResponse.json({
      success: true,
      imageUrl: output[0],
      prompt: sanitizedPrompt,
      style
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Image generation failed' },
      { status: 500 }
    );
  }
}
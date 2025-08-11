import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'modern', type = 'logo' } = await request.json();

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ 
        error: 'Replicate API token not configured' 
      }, { status: 500 });
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
    console.error('Replicate generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Image generation failed' 
    }, { status: 500 });
  }
}
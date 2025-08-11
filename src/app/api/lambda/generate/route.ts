import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'lambda-text-to-image', style = 'modern' } = await request.json();

    if (!process.env.LAMBDA_API_KEY) {
      return NextResponse.json({ 
        error: 'Lambda API key not configured' 
      }, { status: 500 });
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
    return NextResponse.json({ 
      error: error.message || 'Lambda generation failed' 
    }, { status: 500 });
  }
}
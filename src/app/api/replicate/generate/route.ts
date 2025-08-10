import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithReplicate, generateDesignWithReplicate } from '@/lib/replicate/client';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type = 'image' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    let result;
    
    if (type === 'image') {
      result = await generateImageWithReplicate(prompt);
    } else if (type === 'design') {
      result = await generateDesignWithReplicate(prompt);
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "image" or "design"' }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Replicate API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
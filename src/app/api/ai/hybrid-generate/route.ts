import { NextRequest, NextResponse } from 'next/server';
import { hybridDesignAgent } from '@/lib/ai/hybrid-design-agent';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type = 'landing', style = 'modern', framework = 'react' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const designOutput = await hybridDesignAgent.generateDesign({
      prompt,
      type,
      style,
      framework
    });

    return NextResponse.json({
      success: true,
      design: designOutput,
      workflow: 'hybrid',
      models: ['claude-3.5-sonnet', 'claude-3-haiku'],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Hybrid design generation failed' 
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { brandDesignAssistant } from '@/lib/ai/brand-design-assistant';

export async function POST(request: NextRequest) {
  try {
    const { elements, brandContext } = await request.json();

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ 
        error: 'Design elements are required' 
      }, { status: 400 });
    }

    const colors = elements.map(el => el.fill || el.stroke).filter(Boolean);
    const fonts = elements.map(el => el.fontFamily).filter(Boolean);
    
    const context = {
      elements,
      colors: [...new Set(colors)],
      fonts: [...new Set(fonts)],
      ...brandContext
    };

    const analysis = await brandDesignAssistant.analyzeDesign(context);

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Brand analysis failed' 
    }, { status: 500 });
  }
}
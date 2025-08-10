import { NextRequest, NextResponse } from 'next/server';
import { generateDesignMockups, generateDesignImage } from '@/lib/aws/bedrock';
import { clusterAndScoreMockups } from '@/lib/aws/concept-clustering';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, style, layout, colorScheme, typography, type } = body;

    if (type === 'image') {
      const imageUrl = await generateDesignImage(prompt);
      return NextResponse.json({ imageUrl });
    }

    const designs = await generateDesignMockups({
      prompt,
      style,
      layout,
      colorScheme,
      typography,
    });

    const { clusters, topThree, scores } = await clusterAndScoreMockups(designs);

    return NextResponse.json({ 
      designs: designs.map((design, index) => ({
        ...design,
        ...scores[index]
      })),
      clusters,
      topThree,
      originalPrompt: prompt
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate designs' },
      { status: 500 }
    );
  }
}
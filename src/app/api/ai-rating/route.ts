import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// This endpoint expects a POST with a design object and returns an AI rating
const DesignSchema = z.object({
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  layout: z.any(),
  typography: z.any(),
  colorScheme: z.any(),
  elements: z.array(z.any()),
});

// Example prompt for GPT-6, engineered for deep graphic design critique
const SYSTEM_PROMPT = `
You are a world-class graphic design critic and AI trained on the best UI/UX, branding, and logo design principles. 
You understand color theory, layout, accessibility, modern trends, and the psychology of "mind reading" interfaces. 
Given a design's structure, content, and intent, rate its overall quality (0-10), and provide a short critique and suggestions for improvement. 
Be objective, insightful, and reference best practices in your feedback.
`;

async function callChatGPT6(design: any) {
  // Replace this with your actual GPT-6 API call
  // This is a placeholder for demonstration
  // In production, use OpenAI API or your provider
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-6',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Design Data: ${JSON.stringify(design)}` },
      ],
      max_tokens: 256,
      temperature: 0.3,
    }),
  });
  const data = await response.json();
  // Expecting: { rating: number, critique: string, suggestions: string[] }
  // Parse the model's response for rating, critique, suggestions
  const text = data.choices?.[0]?.message?.content || '';
  // Simple extraction (production: use a more robust parser)
  const match = text.match(/Rating: (\d+(?:\.\d+)?)/i);
  const rating = match ? parseFloat(match[1]) : null;
  const critique = text.split('Critique:')[1]?.split('Suggestions:')[0]?.trim() || '';
  const suggestions = text.split('Suggestions:')[1]?.split(/\n|\r/).map((s: string) => s.trim()).filter(Boolean) || [];
  return { rating, critique, suggestions };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const design = DesignSchema.parse(body);
    const aiResult = await callChatGPT6(design);
    return NextResponse.json({
      rating: aiResult.rating,
      critique: aiResult.critique,
      suggestions: aiResult.suggestions,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid design data' }, { status: 400 });
    }
    console.error('AI rating error:', error);
    return NextResponse.json({ error: 'Failed to rate design' }, { status: 500 });
  }
}

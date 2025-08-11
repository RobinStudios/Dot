import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { sessionManager } from '@/lib/auth/session-manager';
import { z } from 'zod';
import crypto from 'crypto';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const DesignRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().min(1).max(50),
  layout: z.string().min(1).max(50),
  colorScheme: z.string().min(1).max(50),
  typography: z.string().min(1).max(50),
  csrfToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const origin = request.headers.get('origin');
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3000'];
    
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    }

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await sessionManager.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Input validation
    const body = await request.json();
    const validatedData = DesignRequestSchema.parse(body);

    // CSRF token validation
    const expectedToken = crypto.createHash('sha256')
      .update(`${user.id}-${process.env.CSRF_SECRET}`)
      .digest('hex');
    
    if (validatedData.csrfToken !== expectedToken) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Sanitize inputs
    const sanitizedPrompt = validatedData.prompt
      .replace(/[<>\"'&]/g, '')
      .substring(0, 500);

    const prompt = `Generate design mockups for: ${sanitizedPrompt}
Style: ${validatedData.style}
Layout: ${validatedData.layout}
Color Scheme: ${validatedData.colorScheme}
Typography: ${validatedData.typography}

Return JSON array with design specifications.`;

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    return NextResponse.json({ 
      designs: result.content[0].text ? JSON.parse(result.content[0].text) : [] 
    });

  } catch (error) {
    console.error('Bedrock API error:', error);
    return NextResponse.json(
      { error: 'Design generation failed' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { projectService } from '@/lib/db/projects';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security/csrf';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateCSRF } from '@/lib/security/csrf';

import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

const client = new BedrockRuntimeClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1' }),
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID!,
  }),
});

const GenerateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().min(1).max(50),
  layout: z.string().min(1).max(50),
  colorScheme: z.string().min(1).max(50),
  typography: z.string().min(1).max(50),
  projectId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, { max: 10, window: 60000 });
    if (!rateLimitResult.success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryable: true
      }, { status: 429 });
    }

    // CSRF validation
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ 
        error: 'Invalid request. Please refresh the page and try again.',
        code: 'CSRF_ERROR',
        retryable: false
      }, { status: 403 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ 
        error: 'Please log in to continue.',
        code: 'UNAUTHORIZED',
        retryable: false
      }, { status: 401 });
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ 
        error: 'Session expired. Please log in again.',
        code: 'INVALID_TOKEN',
        retryable: false
      }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, style, layout, colorScheme, typography, projectId } = GenerateSchema.parse(body);

    const sanitizedPrompt = sanitizeInput(prompt);
    
    const aiPrompt = `Generate a complete design specification for: ${sanitizedPrompt}
Style: ${style}
Layout: ${layout}
Color Scheme: ${colorScheme}
Typography: ${typography}

Return JSON with:
{
  "elements": [
    {
      "id": "unique-id",
      "type": "text|rectangle|ellipse",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 50,
      "fill": "#color",
      "text": "content",
      "fontSize": 16
    }
  ],
  "layout": {"type": "${layout}", "columns": 12},
  "colorScheme": {"primary": "#3b82f6", "secondary": "#64748b"},
  "typography": {"fontFamily": "Inter", "fontSize": 16}
}`;

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [{ role: 'user', content: aiPrompt }],
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    let designData;
    try {
      designData = JSON.parse(result.content[0].text);
    } catch {
      // Fallback design if AI response is invalid
      designData = {
        elements: [
          {
            id: `text-${Date.now()}`,
            type: 'text',
            x: 100,
            y: 100,
            width: 300,
            height: 50,
            text: sanitizedPrompt,
            fontSize: 24,
            fill: '#1f2937'
          }
        ],
        layout: { type: layout, columns: 12 },
        colorScheme: { primary: '#3b82f6', secondary: '#64748b' },
        typography: { fontFamily: 'Inter', fontSize: 16 }
      };
    }

    // Save to project if specified
    if (projectId) {
      try {
        await projectService.saveDesign(projectId, {
          name: `AI Design - ${sanitizedPrompt.slice(0, 30)}`,
          prompt: sanitizedPrompt,
          elements: designData.elements,
          layout: designData.layout,
          color_scheme: designData.colorScheme,
          typography: designData.typography,
        });
      } catch (dbError) {
        console.error('Database save failed, continuing with response:', dbError);
      }
    }

    return NextResponse.json({ 
      success: true,
      design: designData,
      prompt: sanitizedPrompt
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Please check your input and try again.',
        code: 'VALIDATION_ERROR',
        retryable: false,
        details: error.errors
      }, { status: 400 });
    }
    
    console.error('Generation error:', error);
    return NextResponse.json({
      error: 'AI generation failed. Please try again.',
      code: 'GENERATION_ERROR',
      retryable: true
    }, { status: 500 });
  }
}
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
    

    // Enhanced prompt for deeply varied, theme-specific, fully editable mockups
    const aiPrompt = `You are a world-class UI/UX designer and Figma expert. Given the following requirements, generate 10 deeply unique, theme-specific, and fully editable web or app design mockups. Each mockup must:
- Be maximally different from the others in layout, color, typography, style, iconography, and (if possible) animation/sound.
- Be production-ready, with all properties editable (as in Figma: position, size, color, font, border, shadow, radius, etc.).
- Use modern, creative, and accessible design patterns.
- Each mockup should be a separate object in a JSON array, with the following structure:
{
  "id": "unique-id",
  "name": "Short descriptive name",
  "elements": [
    {
      "id": "unique-id",
      "type": "text|rectangle|ellipse|icon|image|button|input|custom",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 50,
      "fill": "#color",
      "text": "content",
      "fontSize": 16,
      "fontFamily": "",
      "color": "#color",
      "borderRadius": 0,
      "borderWidth": 0,
      "borderColor": "#color",
      "shadow": "",
      "opacity": 1,
      "icon": "optional icon name",
      "imageUrl": "optional image url",
      "animation": "optional animation description",
      "sound": "optional sound description"
    }
  ],
  "layout": {"type": "${layout}", "columns": 12},
  "colorScheme": {"primary": "#3b82f6", "secondary": "#64748b", "palette": ["#...", "#..."]},
  "typography": {"fontFamily": "Inter", "fontSize": 16, "weights": [400, 700]},
  "theme": "${style}",
  "description": "Short description of the design's unique approach."
}

Requirements:
- Prompt: ${sanitizedPrompt}
- Style/Theme: ${style}
- Layout: ${layout}
- Color Scheme: ${colorScheme}
- Typography: ${typography}

Return a JSON array of 10+ mockups, each as described above. Maximize diversity and editability. Do not repeat any design. Do not include any explanation, only the JSON array.`;


    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{ role: 'user', content: aiPrompt }],
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));

    let mockups: any[] = [];
    try {
      mockups = JSON.parse(result.content[0].text);
      if (!Array.isArray(mockups) || mockups.length < 1) throw new Error('Not an array');
    } catch {
      // Fallback: generate 10 simple mockups with varied color and layout
      mockups = Array.from({ length: 10 }).map((_, i) => ({
        id: `fallback-${i}-${Date.now()}`,
        name: `Fallback Mockup ${i + 1}`,
        elements: [
          {
            id: `text-${i}-${Date.now()}`,
            type: 'text',
            x: 100 + i * 10,
            y: 100 + i * 10,
            width: 300,
            height: 50,
            text: `${sanitizedPrompt} (Fallback ${i + 1})`,
            fontSize: 24,
            fill: `#${((1 << 24) * Math.random() | 0).toString(16)}`
          }
        ],
        layout: { type: layout, columns: 12 },
        colorScheme: { primary: `#${((1 << 24) * Math.random() | 0).toString(16)}`, secondary: `#${((1 << 24) * Math.random() | 0).toString(16)}` },
        typography: { fontFamily: 'Inter', fontSize: 16 },
        theme: style,
        description: `Fallback mockup ${i + 1}`
      }));
    }


    // Save the first mockup to project if specified (or all, if desired)
    if (projectId && mockups.length > 0) {
      try {
        // Optionally, save all mockups. Here, just saving the first for backward compatibility.
        await projectService.saveDesign(projectId, {
          project_id: projectId,
          name: mockups[0].name || `AI Design - ${sanitizedPrompt.slice(0, 30)}`,
          prompt: sanitizedPrompt,
          elements: mockups[0].elements,
          layout: mockups[0].layout,
          color_scheme: mockups[0].colorScheme,
          typography: mockups[0].typography,
        });
      } catch (dbError) {
        console.error('Database save failed, continuing with response:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      mockups,
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
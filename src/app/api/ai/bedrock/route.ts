import { NextRequest } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { sessionManager } from '@/lib/auth/session-manager';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

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
  typography: z.string().min(1).max(50)
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rate = await rateLimit(request, { max: 10, window: 60 * 1000 });
    if (!rate.success) {
      return apiError('Rate limit exceeded', 429);
    }

    // Authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return apiError('Unauthorized', 401);
    }
    const user = await sessionManager.verifyToken(token);
    if (!user) {
      return apiError('Invalid token', 401);
    }

    // CSRF Protection
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !CSRFProtection.validateToken(user.id, csrfToken)) {
      return apiError('Invalid CSRF token', 403);
    }

    // Input validation
    const body = await request.json();
    // Validate input using Zod schema
    const validated = DesignRequestSchema.parse(body);

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(validated.prompt);

    // Centralized logging for request
    logError('BedrockRequest', { userId: user.id, prompt: sanitizedPrompt, style: validated.style, layout: validated.layout, colorScheme: validated.colorScheme, typography: validated.typography });

    const prompt = `Generate design mockups for: ${sanitizedPrompt}\nStyle: ${validated.style}\nLayout: ${validated.layout}\nColor Scheme: ${validated.colorScheme}\nTypography: ${validated.typography}\n\nReturn JSON array with design specifications.`;

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

    // Centralized logging for response
    logError('BedrockResponse', { userId: user.id, result });

    return apiSuccess({ 
      designs: result.content[0].text ? JSON.parse(result.content[0].text) : [] 
    });

  } catch (error) {
    logError('BedrockAPIError', error);
    return apiError('Design generation failed', 500);
  }
}
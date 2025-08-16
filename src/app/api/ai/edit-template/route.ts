
import { NextRequest } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '@/lib/aws/cognito-setup';
import { sessionManager } from '@/lib/auth/session-manager';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

const EditTemplateSchema = z.object({
  templateCode: z.string().min(1),
  editPrompt: z.string().min(1).max(1000),
  templateId: z.string().min(1).optional()
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
    let validated;
    try {
      validated = EditTemplateSchema.parse(body);
    } catch (err) {
      logError('EditTemplateInputValidation', err);
      return apiError('Invalid input', 400);
    }

    // Sanitize inputs
    const sanitizedPrompt = sanitizeInput(validated.editPrompt);
    const sanitizedCode = sanitizeInput(validated.templateCode);

    // Centralized logging for request
    logError('EditTemplateRequest', { userId: user.id, editPrompt: sanitizedPrompt, templateId: validated.templateId });

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Modify this React component: ${sanitizedPrompt}

${sanitizedCode}

Return only the modified code:`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));

    let modifiedCode = result.content[0].text;
    if (modifiedCode.includes('```')) {
      const codeMatch = modifiedCode.match(/```(?:tsx?|javascript|jsx?)?\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        modifiedCode = codeMatch[1];
      }
    }

    // Centralized logging for response
    logError('EditTemplateResponse', { userId: user.id, templateId: validated.templateId, success: true });

    return apiSuccess({
      success: true,
      modifiedCode: modifiedCode.trim(),
      originalPrompt: sanitizedPrompt,
      templateId: validated.templateId
    });

  } catch (error: any) {
    logError('EditTemplateAPIError', error);
    return apiError(error.message || 'Failed to edit template', 500);
  }
}

import { NextRequest } from 'next/server';
import { sessionManager } from '@/lib/auth/session-manager';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

const AnthropicSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.string().min(1).max(100).optional()
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
      validated = AnthropicSchema.parse(body);
    } catch (err) {
      logError('AnthropicInputValidation', err);
      return apiError('Invalid input', 400);
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(validated.prompt);

    // Centralized logging for request
    logError('AnthropicRequest', { userId: user.id, prompt: sanitizedPrompt, model: validated.model });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: validated.model || 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: sanitizedPrompt }]
      })
    });

    const result = await response.json();

    // Centralized logging for response
    logError('AnthropicResponse', { userId: user.id, result });

    return apiSuccess({
      content: result.content[0]?.text || '',
      provider: 'anthropic'
    });
  } catch (error) {
    logError('AnthropicAPIError', error);
    return apiError('Anthropic API failed', 500);
  }
}
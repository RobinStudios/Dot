
import { NextRequest } from 'next/server';
import { sessionManager } from '@/lib/auth/session-manager';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';

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
    // Extend schema to include model and framework
    const ai21Schema = z.object({
      prompt: z.string().min(1).max(1000),
      model: z.string().min(1).max(100).optional(),
      framework: z.string().min(1).max(50)
    });
    let validated;
    try {
      validated = ai21Schema.parse(body);
    } catch (err) {
      logError('AI21InputValidation', err);
      return apiError('Invalid input', 400);
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(validated.prompt);

    // Centralized logging for request
    logError('AI21Request', { userId: user.id, prompt: sanitizedPrompt, model: validated.model, framework: validated.framework });

    const response = await fetch('https://api.ai21.com/studio/v1/j2-ultra/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI21_API_KEY}`
      },
      body: JSON.stringify({
        prompt: `Create a ${validated.framework} frontend component for: ${sanitizedPrompt}\n\nGenerate clean, modern code with Tailwind CSS:\n\n`,
        maxTokens: 4000,
        temperature: 0.7
      })
    });

    const result = await response.json();

    // Centralized logging for response
    logError('AI21Response', { userId: user.id, result });

    return apiSuccess({
      code: result.completions[0]?.data?.text || '',
      content: result.completions[0]?.data?.text || '',
      provider: 'ai21',
      framework: validated.framework
    });
  } catch (error) {
    logError('AI21APIError', error);
    return apiError('AI21 API failed', 500);
  }
}
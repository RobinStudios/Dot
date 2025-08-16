
import { NextRequest } from 'next/server';
import { sessionManager } from '@/lib/auth/session-manager';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

const MistralSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.string().min(1).max(100).optional(),
  framework: z.string().min(1).max(50)
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
      validated = MistralSchema.parse(body);
    } catch (err) {
      logError('MistralInputValidation', err);
      return apiError('Invalid input', 400);
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(validated.prompt);

    // Centralized logging for request
    logError('MistralRequest', { userId: user.id, prompt: sanitizedPrompt, model: validated.model, framework: validated.framework });

    const frontendPrompt = `Create a complete ${validated.framework} frontend for: ${sanitizedPrompt}

Generate production-ready code with:
- Modern component structure
- Tailwind CSS styling
- Responsive design
- Clean architecture
- TypeScript support

Return only the main component code.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: validated.model || 'mistral-large-latest',
        messages: [{ role: 'user', content: frontendPrompt }],
        max_tokens: 4000
      })
    });

    const result = await response.json();

    // Centralized logging for response
    logError('MistralResponse', { userId: user.id, result });

    return apiSuccess({
      code: result.choices[0]?.message?.content || '',
      content: result.choices[0]?.message?.content || '',
      provider: 'mistral',
      framework: validated.framework
    });
  } catch (error) {
    logError('MistralAPIError', error);
    return apiError('Mistral API failed', 500);
  }
}
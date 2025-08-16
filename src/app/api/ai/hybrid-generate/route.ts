
import { NextRequest } from 'next/server';
import { hybridDesignAgent } from '@/lib/ai/hybrid-design-agent';
import { sessionManager } from '@/lib/auth/session-manager';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

const HybridSchema = z.object({
  prompt: z.string().min(1).max(1000),
  type: z.string().min(1).max(50).default('landing'),
  style: z.string().min(1).max(50).default('modern'),
  framework: z.string().min(1).max(50).default('react')
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
      validated = HybridSchema.parse(body);
    } catch (err) {
      logError('HybridInputValidation', err);
      return apiError('Invalid input', 400);
    }

    // Sanitize prompt
    const sanitizedPrompt = sanitizeInput(validated.prompt);

    // Map type and framework to allowed enums
    const allowedTypes = ['landing', 'dashboard', 'ecommerce', 'portfolio', 'blog', 'component'] as const;
    const allowedFrameworks = ['react', 'vue', 'html'] as const;
    const safeType = allowedTypes.includes(validated.type as any) ? validated.type as typeof allowedTypes[number] : 'landing';
    const safeFramework = allowedFrameworks.includes(validated.framework as any) ? validated.framework as typeof allowedFrameworks[number] : 'react';

    // Centralized logging for request
    logError('HybridRequest', { userId: user.id, prompt: sanitizedPrompt, type: safeType, style: validated.style, framework: safeFramework });

    const designOutput = await hybridDesignAgent.generateDesign({
      prompt: sanitizedPrompt,
      type: safeType,
      style: validated.style,
      framework: safeFramework
    });

    // Centralized logging for response
    logError('HybridResponse', { userId: user.id, designOutput });

    return apiSuccess({
      success: true,
      design: designOutput,
      workflow: 'hybrid',
      models: ['claude-3.5-sonnet', 'claude-3-haiku'],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logError('HybridAPIError', error);
    return apiError(error.message || 'Hybrid design generation failed', 500);
  }
}
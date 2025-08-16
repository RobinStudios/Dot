
import { NextRequest } from 'next/server';
import Replicate from 'replicate';
import { sessionManager } from '@/lib/auth/session-manager';
import { rateLimit } from '@/lib/security/rate-limit';
import { CSRFProtection } from '@/lib/security/csrf';
import { sanitizeInput } from '@/lib/security/sanitize';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const ImageRequestSchema = z.object({
  prompt: z.string().min(1).max(500),
  width: z.number().min(256).max(2048).optional(),
  height: z.number().min(256).max(2048).optional()
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
      validated = ImageRequestSchema.parse(body);
    } catch (err) {
      logError('ReplicateInputValidation', err);
      return apiError('Invalid input', 400);
    }

    // Sanitize prompt
    let sanitizedPrompt = sanitizeInput(validated.prompt).substring(0, 300);
    sanitizedPrompt = sanitizedPrompt.replace(/\b(nude|nsfw|explicit)\b/gi, '');

    // Centralized logging for request
    logError('ReplicateRequest', { userId: user.id, prompt: sanitizedPrompt, width: validated.width, height: validated.height });

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: sanitizedPrompt,
          width: validated.width || 1024,
          height: validated.height || 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      }
    ) as string[];

    // Centralized logging for response
    logError('ReplicateResponse', { userId: user.id, imageUrl: output[0] });

    return apiSuccess({ 
      imageUrl: output[0] 
    });

  } catch (error) {
    logError('ReplicateAPIError', error);
    return apiError('Image generation failed', 500);
  }
}
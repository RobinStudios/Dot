import { NextRequest } from 'next/server';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';
import { sanitizeUrl } from '@/lib/security/csrf';
import { validateUrl } from '@/lib/security/validation';
import { rateLimit } from '@/lib/security/rate-limit';

const copySchema = z.object({
  method: z.enum(['screenshot']),
  url: z.string().url().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, { max: 5, window: 60000 });
    if (!rateLimitResult.success) {
  return apiError('Rate limit exceeded', 429);
    }

    const formData = await request.formData();
    const method = formData.get('method') as string;
    const url = formData.get('url') as string;

    // Validate input
    const validatedData = copySchema.parse({ method, url });

    // Only allow screenshot method - remove dangerous wget functionality
    if (validatedData.method !== 'screenshot') {
  return apiError('Only screenshot method allowed', 400);
    }

    if (method === 'screenshot') {
      const screenshot = formData.get('screenshot') as File;
      if (!screenshot) {
        return apiError('Screenshot is required', 400);
      }

      const bytes = await screenshot.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');

      const template = {
        id: `screenshot-${Date.now()}`,
        name: 'Recreated from Screenshot',
        category: 'landing',
        preview: `data:image/png;base64,${base64}`,
        code: `export default function ScreenshotRecreation() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">
          Recreated from Screenshot
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This design was recreated from a screenshot using AI.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Feature 1</h3>
            <p className="text-gray-600">Description</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Feature 2</h3>
            <p className="text-gray-600">Description</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Feature 3</h3>
            <p className="text-gray-600">Description</p>
          </div>
        </div>
      </div>
    </div>
  );
}`,
        aiPrompts: ['Enhance the layout', 'Improve colors', 'Add interactivity']
      };

      return apiSuccess({
        success: true,
        template,
        method: 'screenshot'
      });
    }

  return apiError('Invalid method', 400);

  } catch (error: any) {
    logError('WebsiteCopyAPI', error);
    return apiError(error?.message || 'Website copying failed', 500);
  }
}

// Removed dangerous file system access functions
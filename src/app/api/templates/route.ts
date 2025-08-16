
import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/templates/template-service';
import { authService } from '@/lib/auth/auth';
import { z } from 'zod';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateCSRF } from '@/lib/security/csrf';
import { logError } from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 20, window: 60000 });
    if (!rate.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    if (type === 'user') {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const user = await authService.verifySession(token);
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      const templates = await templateService.getUserTemplates(user.id);
      return NextResponse.json({ templates });
    }
    const templates = await templateService.getPublicTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    logError('TemplatesAPI-GET', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 10, window: 60000 });
    if (!rate.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const body = await request.json();
    const TemplateSchema = z.object({
      name: z.string().min(1).max(255),
      category: z.string().min(1).max(100),
      preview_url: z.string().url().optional(),
      code: z.string().min(1),
      ai_prompts: z.any().optional(),
      is_public: z.boolean().optional(),
      source: z.string().optional(),
    });
    const parsed = TemplateSchema.parse(body);
    const newTemplate = await templateService.createTemplate({
      ...parsed,
      created_by: user.id,
      source: parsed.source || 'custom',
    });
    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    logError('TemplatesAPI-POST', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
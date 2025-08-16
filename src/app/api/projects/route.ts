
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { projectService } from '@/lib/db/projects';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/security/csrf';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateCSRF } from '@/lib/security/csrf';
import { logError } from '@/lib/utils/api-helpers';

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 20, window: 60000 });
    if (!rate.success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const projects = await projectService.getUserProjects(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    logError('ProjectsAPI-GET', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    const { name, description } = CreateProjectSchema.parse(body);
    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : '';
    const project = await projectService.createProject(
      user.id,
      sanitizedName,
      sanitizedDescription
    );
    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    logError('ProjectsAPI-POST', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
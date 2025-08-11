import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { projectService } from '@/lib/db/projects';
import { z } from 'zod';
import { designVersionService } from '@/lib/db/design_versions';

const SaveDesignSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  prompt: z.string().optional(),
  elements: z.array(z.any()),
  layout: z.object({}).passthrough(),
  color_scheme: z.object({}).passthrough(),
  typography: z.object({}).passthrough(),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (projectId) {
      const designs = await projectService.getDesigns(projectId);
      return NextResponse.json({ designs });
    }

    const projects = await projectService.getUserProjects(user.id);
    return NextResponse.json({ projects });
    
  } catch (error) {
    console.error('Designs fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = SaveDesignSchema.parse(body);


    // Save the design to the main table

    const design = await projectService.saveDesign(validatedData.projectId, {
      project_id: validatedData.projectId,
      name: validatedData.name,
      description: validatedData.description,
      prompt: validatedData.prompt,
      elements: validatedData.elements,
      layout: validatedData.layout,
      color_scheme: validatedData.color_scheme,
      typography: validatedData.typography,
    });

    // Save a version to design_versions
    try {
      await designVersionService.saveVersion({
        design_id: design.id,
        project_id: validatedData.projectId,
        name: validatedData.name,
        description: validatedData.description,
        prompt: validatedData.prompt,
        elements: validatedData.elements,
        layout: validatedData.layout,
        color_scheme: validatedData.color_scheme,
        typography: validatedData.typography,
        thumbnail_url: design.thumbnail_url,
        created_by: user.id,
      });
    } catch (versionError) {
      console.error('Failed to save design version:', versionError);
      // Do not block main save on versioning error
    }

    return NextResponse.json({ design });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    console.error('Design save error:', error);
    return NextResponse.json({ error: 'Failed to save design' }, { status: 500 });
  }
}
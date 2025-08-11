import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const RestoreSchema = z.object({
  designId: z.string().uuid(),
  versionId: z.string().uuid(),
});

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
    const { designId, versionId } = RestoreSchema.parse(body);
    // Fetch the version to restore
    const { data: version, error: versionError } = await db
      .from('design_versions')
      .select('*')
      .eq('id', versionId)
      .single();
    if (versionError || !version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }
    // Update the main design with the version's data
    const { error: updateError } = await db
      .from('designs')
      .update({
        elements: version.elements,
        layout: version.layout,
        color_scheme: version.color_scheme,
        typography: version.typography,
        title: version.title,
        description: version.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', designId);
    if (updateError) throw new Error(updateError.message);
    // Optionally, return the restored mockup
    return NextResponse.json({ mockup: version });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    console.error('Design restore error:', error);
    return NextResponse.json({ error: 'Failed to restore design version' }, { status: 500 });
  }
}

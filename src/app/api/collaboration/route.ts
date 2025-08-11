import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { db } from '@/lib/db/client';
import { z } from 'zod';

const CollaborationSchema = z.object({
  projectId: z.string().uuid(),
  action: z.enum(['join', 'leave', 'update']),
  data: z.any().optional(),
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
    const { projectId, action, data } = CollaborationSchema.parse(body);

    switch (action) {
      case 'join':
        const { data: session, error: joinError } = await db
          .from('collaboration_sessions')
          .upsert({
            project_id: projectId,
            active_users: [user.id],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }, {
            onConflict: 'project_id'
          })
          .select()
          .single();

        if (joinError) throw new Error(joinError.message);
        return NextResponse.json({ session });

      case 'leave':
        await db
          .from('collaboration_sessions')
          .delete()
          .eq('project_id', projectId);
        
        return NextResponse.json({ success: true });

      case 'update':
        const { error: updateError } = await db
          .from('collaboration_sessions')
          .update({
            active_users: data.activeUsers || [user.id],
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('project_id', projectId);

        if (updateError) throw new Error(updateError.message);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    console.error('Collaboration error:', error);
    return NextResponse.json({ error: 'Collaboration failed' }, { status: 500 });
  }
}

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

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    const { data: session } = await db
      .from('collaboration_sessions')
      .select('*')
      .eq('project_id', projectId)
      .gt('expires_at', new Date().toISOString())
      .single();

    return NextResponse.json({ session });

  } catch (error) {
    console.error('Collaboration fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch collaboration' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { z } from 'zod';

// In-memory session store (replace with AWS-native logic for production)
const collaborationSessions: Record<string, { project_id: string; active_users: string[]; expires_at: string }> = {};

const CollaborationSchema = z.object({
  projectId: z.string().uuid(),
  action: z.enum(['join', 'leave', 'update']),
  data: z.any().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return apiError('Unauthorized', 401);
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return apiError('Invalid token', 401);
    }

    const body = await request.json();
    const { projectId, action, data } = CollaborationSchema.parse(body);


    switch (action) {
      case 'join': {
        // Add or update session
        collaborationSessions[projectId] = {
          project_id: projectId,
          active_users: [user.id],
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
  return apiSuccess({ session: collaborationSessions[projectId] });
      }
      case 'leave': {
        delete collaborationSessions[projectId];
  return apiSuccess({ success: true });
      }
      case 'update': {
        if (!collaborationSessions[projectId]) {
          return apiError('Session not found', 404);
        }
        collaborationSessions[projectId].active_users = data.activeUsers || [user.id];
        collaborationSessions[projectId].expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return apiSuccess({ success: true });
      }
      default:
  return apiError('Invalid action', 400);
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('Invalid input data', 400);
    }
    logError('CollaborationAPI', error);
    return apiError('Collaboration failed', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return apiError('Unauthorized', 401);
    }

    const user = await authService.verifySession(token);
    if (!user) {
      return apiError('Invalid token', 401);
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return apiError('Project ID required', 400);
    }

    const session = collaborationSessions[projectId];
    if (!session || new Date(session.expires_at) < new Date()) {
      return apiSuccess({ session: null });
    }
    return apiSuccess({ session });
  } catch (error) {
    logError('CollaborationAPI-GET', error);
    return apiError('Failed to fetch collaboration', 500);
  }
}
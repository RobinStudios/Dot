
import { NextRequest } from 'next/server';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { authService } from '@/lib/auth/auth';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateCSRF } from '@/lib/security/csrf';
import { z } from 'zod';
// TODO: Replace with persistent storage
const votes = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 30, window: 60000 });
    if (!rate.success) {
      return apiError('Rate limit exceeded', 429);
    }
    const csrfValid = await validateCSRF(request);
    if (!csrfValid) {
      return apiError('CSRF validation failed', 403);
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return apiError('Unauthorized', 401);
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return apiError('Invalid token', 401);
    }
    const VoteRequestSchema = z.object({
      mockupId: z.string().min(1),
      teamId: z.string().min(1),
      action: z.enum(['vote', 'unvote']),
    });
    const body = await request.json();
    const { mockupId, teamId, action } = VoteRequestSchema.parse(body);
    const teamKey = `${teamId}:${mockupId}`;
    const currentVotes = votes.get(teamKey) || [];
    if (action === 'vote') {
      if (!currentVotes.some(v => v.userId === user.id)) {
        currentVotes.push({
          userId: user.id,
          userName: user.name || '',
          timestamp: new Date().toISOString()
        });
        votes.set(teamKey, currentVotes);
      }
    } else {
      const filteredVotes = currentVotes.filter(v => v.userId !== user.id);
      votes.set(teamKey, filteredVotes);
    }
    return apiSuccess({ 
      success: true, 
      votes: votes.get(teamKey)?.length || 0 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError('Invalid input data', 400);
    }
    logError('VotesAPI-POST', error);
    return apiError('Failed to process vote', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 60, window: 60000 });
    if (!rate.success) {
      return apiError('Rate limit exceeded', 429);
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return apiError('Unauthorized', 401);
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return apiError('Invalid token', 401);
    }
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const mockupId = searchParams.get('mockupId');
    if (!teamId) {
      return apiError('Team ID required', 400);
    }
    if (mockupId) {
      const teamKey = `${teamId}:${mockupId}`;
      const mockupVotes = votes.get(teamKey) || [];
      return apiSuccess({ votes: mockupVotes });
    } else {
      const teamVotes = Array.from(votes.entries())
        .filter(([key]) => key.startsWith(`${teamId}:`))
        .reduce((acc, [key, voteList]) => {
          const mockupId = key.split(':')[1];
          acc[mockupId] = voteList;
          return acc;
        }, {} as Record<string, any[]>);
      return apiSuccess({ teamVotes });
    }
  } catch (error) {
    logError('VotesAPI-GET', error);
    return apiError('Failed to retrieve votes', 500);
  }
}
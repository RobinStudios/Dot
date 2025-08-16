import { NextRequest } from 'next/server';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import { authService } from '@/lib/auth/auth';
import { rateLimit } from '@/lib/security/rate-limit';
import { validateCSRF } from '@/lib/security/csrf';
import { z } from 'zod';
import { addVote, removeVote, getVotes } from '@/lib/db/votes';

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
    if (action === 'vote') {
      await addVote(teamId, mockupId, user.id, user.name || '');
    } else {
      await removeVote(teamId, mockupId, user.id);
    }
    const votesList = await getVotes(teamId, mockupId);
    return apiSuccess({ success: true, votes: votesList.length });
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
    if (!teamId || !mockupId) {
      return apiError('Missing teamId or mockupId', 400);
    }
    const votesList = await getVotes(teamId, mockupId);
    return apiSuccess({ votes: votesList });
  } catch (error) {
    logError('VotesAPI-GET', error);
    return apiError('Failed to fetch votes', 500);
  }
}
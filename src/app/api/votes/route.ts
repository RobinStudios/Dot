import { NextRequest, NextResponse } from 'next/server';

interface VoteRequest {
  mockupId: string;
  userId: string;
  userName: string;
  teamId: string;
  action: 'vote' | 'unvote';
}

const votes = new Map<string, any[]>();

export async function POST(request: NextRequest) {
  try {
    const body: VoteRequest = await request.json();
    const { mockupId, userId, userName, teamId, action } = body;

    const teamKey = `${teamId}:${mockupId}`;
    const currentVotes = votes.get(teamKey) || [];

    if (action === 'vote') {
      if (!currentVotes.some(v => v.userId === userId)) {
        currentVotes.push({
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
        votes.set(teamKey, currentVotes);
      }
    } else {
      const filteredVotes = currentVotes.filter(v => v.userId !== userId);
      votes.set(teamKey, filteredVotes);
    }

    return NextResponse.json({ 
      success: true, 
      votes: votes.get(teamKey)?.length || 0 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const mockupId = searchParams.get('mockupId');

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    if (mockupId) {
      const teamKey = `${teamId}:${mockupId}`;
      const mockupVotes = votes.get(teamKey) || [];
      return NextResponse.json({ votes: mockupVotes });
    } else {
      const teamVotes = Array.from(votes.entries())
        .filter(([key]) => key.startsWith(`${teamId}:`))
        .reduce((acc, [key, voteList]) => {
          const mockupId = key.split(':')[1];
          acc[mockupId] = voteList;
          return acc;
        }, {} as Record<string, any[]>);

      return NextResponse.json({ teamVotes });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve votes' }, { status: 500 });
  }
}
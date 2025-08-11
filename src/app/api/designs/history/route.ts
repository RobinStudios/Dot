import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { db } from '@/lib/db/client';

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
    const designId = searchParams.get('designId');
    if (!designId) {
      return NextResponse.json({ error: 'Design ID required' }, { status: 400 });
    }
    // Fetch design history from versions table
    const { data: history, error } = await db
      .from('design_versions')
      .select('*')
      .eq('design_id', designId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Design history fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch design history' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSubscription, setSubscription } from '@/lib/db/subscriptions';
import { authService } from '@/lib/auth/auth';

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
    const subscription = await getSubscription(user.id);
    if (!subscription) {
      // Set default subscription if not found
      const defaultSub = await setSubscription(user.id, 'pro', 'active', 50, 20, [
        'ai_generation', 'code_export', 'collaboration', 'advanced_features'
      ]);
      return NextResponse.json({ subscription: defaultSub });
    }
    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
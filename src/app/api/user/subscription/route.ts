import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = {
      plan: 'pro',
      status: 'active',
      designsRemaining: 50,
      exportsRemaining: 20,
      features: ['ai_generation', 'code_export', 'collaboration', 'advanced_features']
    };

    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
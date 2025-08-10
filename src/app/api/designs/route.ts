import { NextRequest, NextResponse } from 'next/server';

const userDesigns = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const designs = userDesigns.get(userId) || [];

    return NextResponse.json({ designs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Buffer.from(token, 'base64').toString().split(':')[0];
    const design = await request.json();
    
    const designs = userDesigns.get(userId) || [];
    designs.push({ ...design, id: Date.now().toString(), createdAt: new Date() });
    userDesigns.set(userId, designs);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save design' }, { status: 500 });
  }
}
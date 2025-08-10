import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = {
      id: '1',
      name: 'Demo User',
      email: email,
      plan: 'pro'
    };

    const token = Buffer.from(`${user.id}:${email}`).toString('base64');

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 401 });
  }
}
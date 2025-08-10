import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    const user = {
      id: Date.now().toString(),
      name,
      email,
      plan: 'free'
    };

    const token = Buffer.from(`${user.id}:${email}`).toString('base64');

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 400 });
  }
}
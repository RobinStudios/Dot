import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const result = await loginUser(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials' || error.message === 'Missing required fields') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
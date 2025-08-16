import { NextRequest, NextResponse } from 'next/server';
import { signupUser } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    const result = await signupUser(name, email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error.message === 'Missing required fields') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
// Next.js API route for deployment
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response('Deployment endpoint is active.', { status: 200 });
}

export async function POST(request: NextRequest) {
  // You can add deployment logic here
  return new Response('Deployment POST received.', { status: 200 });
}

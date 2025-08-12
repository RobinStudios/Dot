import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// This endpoint handles the GitHub OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // Exchange code for access token
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
  }

  // Optionally fetch user info
  const octokit = new Octokit({ auth: tokenData.access_token });
  const { data: user } = await octokit.rest.users.getAuthenticated();

  // Return token and user info (in production, set a secure cookie or session)
  return NextResponse.json({
    access_token: tokenData.access_token,
    user
  });
}

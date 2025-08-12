import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// This endpoint starts the GitHub OAuth flow
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/github/callback';
  const state = Math.random().toString(36).substring(2);
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user:email&state=${state}`;
  return NextResponse.redirect(url);
}

import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function POST(request: NextRequest) {
  try {
    const { code, fileName, commitMessage, repo, branch = 'main' } = await request.json();
    
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    let sha: string | undefined;
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        path: fileName,
        ref: branch,
      });
      
      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error) {
      // File doesn't exist
    }

    const result = await octokit.rest.repos.createOrUpdateFileContents({
      owner: repo.split('/')[0],
      repo: repo.split('/')[1],
      path: fileName,
      message: commitMessage || `Update ${fileName} via AI Designer`,
      content: Buffer.from(code).toString('base64'),
      branch,
      ...(sha && { sha }),
    });

    return NextResponse.json({
      success: true,
      commitUrl: result.data.commit.html_url,
      sha: result.data.content?.sha,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to push to GitHub' 
    }, { status: 500 });
  }
}
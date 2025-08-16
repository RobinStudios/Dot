import { NextRequest, NextResponse } from 'next/server';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';
import crypto from 'crypto';
import { sanitizeLogInput } from '@/lib/security/csrf';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-hub-signature-256');
    const body = await request.text();
    if (signature && process.env.GITHUB_WEBHOOK_SECRET) {
      const expectedSignature = `sha256=${require('crypto')
        .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')}`;
      if (!require('crypto').timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }
    const payload = JSON.parse(body);
    const event = request.headers.get('x-github-event');

    // Sanitize log output
    const sanitizedEvent = sanitizeLogInput(event || 'unknown');
    logError('GitHubWebhook', `GitHub webhook received: ${sanitizedEvent}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('GitHubWebhook', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
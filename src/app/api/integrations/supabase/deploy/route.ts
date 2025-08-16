import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseDeployment } from '@/lib/integrations/supabase-deployment';
import { rateLimit } from '@/lib/security/rate-limit';
import { logError } from '@/lib/utils/api-helpers';
import { authService } from '@/lib/auth/auth';
import { z } from 'zod';

const DeploySchema = z.object({
  config: z.object({
    url: z.string().url(),
    anonKey: z.string().min(10),
    serviceRoleKey: z.string().optional()
  }),
  design: z.any()
});

export async function POST(request: NextRequest) {
  try {
    const rate = await rateLimit(request, { max: 10, window: 60000 });
    if (!rate.success) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const body = await request.json();
    const { config, design } = DeploySchema.parse(body);
    const deployment = createSupabaseDeployment(config);
    const result = await deployment.deployDesign(design);
    return NextResponse.json(result);
  } catch (error: any) {
    logError('SupabaseDeployAPI', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
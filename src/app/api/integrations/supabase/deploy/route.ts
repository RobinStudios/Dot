import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseDeployment } from '@/lib/integrations/supabase-deployment';

export async function POST(request: NextRequest) {
  try {
    const { config, design } = await request.json();

    if (!config?.url || !config?.anonKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase configuration required' 
      });
    }

    if (!design) {
      return NextResponse.json({ 
        success: false, 
        error: 'Design data required' 
      });
    }

    const deployment = createSupabaseDeployment(config);
    const result = await deployment.deployDesign(design);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}
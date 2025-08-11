import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseDeployment } from '@/lib/integrations/supabase-deployment';

export async function POST(request: NextRequest) {
  try {
    const { url, anonKey, serviceRoleKey } = await request.json();

    if (!url || !anonKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'URL and anon key are required' 
      });
    }

    const deployment = createSupabaseDeployment({ url, anonKey, serviceRoleKey });
    const isConnected = await deployment.testConnection();

    return NextResponse.json({ success: isConnected });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    });
  }
}
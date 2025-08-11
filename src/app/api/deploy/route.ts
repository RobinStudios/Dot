import { NextRequest, NextResponse } from 'next/server';
import { vercelDeployer } from '@/lib/deployment/vercel-deployer';
import { analytics } from '@/lib/analytics/tracker';

export async function POST(request: NextRequest) {
  try {
    const { template } = await request.json();

    if (!template || !template.code) {
      return NextResponse.json({ 
        error: 'Template code is required' 
      }, { status: 400 });
    }

    // Deploy to Vercel
    const deployment = await vercelDeployer.deployProject(template);
    
    if (!deployment.success) {
      throw new Error('Deployment failed');
    }
    
    // Auto-architect Supabase backend
    const { supabaseArchitect } = await import('@/lib/ai/supabase-architect');
    
    const architecture = await supabaseArchitect.generateSchema(
      `App: ${template.name}. Category: ${template.category}`,
      template.code
    );
    
    const backendDeployed = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
      ? await supabaseArchitect.deployToSupabase(
          architecture, 
          process.env.SUPABASE_URL, 
          process.env.SUPABASE_SERVICE_KEY
        )
      : true;
    
    // Track deployment
    await analytics.track('deployment', {
      templateId: template.id,
      templateName: template.name,
      deploymentUrl: deployment.url
    });
    
    return NextResponse.json({
      success: true,
      url: deployment.url,
      deploymentId: deployment.deploymentId,
      backend: {
        deployed: backendDeployed,
        tables: architecture.tables.length,
        policies: architecture.policies.length,
        functions: architecture.functions.length
      },
      message: `App deployed with ${architecture.tables.length} tables, ${architecture.policies.length} policies, and ${architecture.functions.length} functions!`
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Deployment failed' 
    }, { status: 500 });
  }
}
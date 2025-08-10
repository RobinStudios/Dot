import { NextRequest, NextResponse } from 'next/server';
import { AdaptiveAgent } from '@/lib/ai/adaptive-agent';

const adaptiveAgent = new AdaptiveAgent({
  userPreferences: {},
  projectHistory: [],
  currentWorkflow: 'design',
  performanceMetrics: {}
});

export async function GET(request: NextRequest) {
  try {
    const available = adaptiveAgent.getAvailablePacks();
    const installed = Array.from(adaptiveAgent['installedPacks'].values());
    
    return NextResponse.json({ 
      available: available.filter(p => !p.isInstalled),
      installed: installed
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
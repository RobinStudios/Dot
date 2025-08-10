import { NextRequest, NextResponse } from 'next/server';
import { AgentRegistry } from '@/lib/ai/agent-registry';

const registry = new AgentRegistry();

export async function GET(request: NextRequest) {
  try {
    const agents = registry.getAllAgents();
    return NextResponse.json({ agents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const agentData = await request.json();
    
    const newAgent = {
      id: `custom-${Date.now()}`,
      ...agentData,
      provider: 'custom'
    };

    registry.registerAgent(newAgent);
    
    return NextResponse.json({ success: true, agent: newAgent });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add agent' }, { status: 500 });
  }
}
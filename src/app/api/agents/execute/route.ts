import { NextRequest, NextResponse } from 'next/server';
import { AgentRegistry } from '@/lib/ai/agent-registry';
import { AgentExecutor } from '@/lib/ai/agent-executor';

const registry = new AgentRegistry();
const executor = new AgentExecutor();

export async function POST(request: NextRequest) {
  try {
    const { taskType, input, agentId, context } = await request.json();

    const task = {
      type: taskType,
      input,
      context
    };

    let agent;
    if (agentId) {
      agent = registry.getAgent(agentId);
    } else {
      agent = registry.getBestAgentForTask(task);
    }

    if (!agent) {
      return NextResponse.json({ error: 'No suitable agent found' }, { status: 404 });
    }

    const result = await executor.executeTask(agent, task);
    
    return NextResponse.json({ 
      result, 
      agent: { id: agent.id, name: agent.name },
      task: taskType 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
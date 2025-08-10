import { NextRequest, NextResponse } from 'next/server';
import { agentExecutor, AgentTask } from '@/lib/ai/agent-executor';

export async function POST(request: NextRequest) {
  try {
    const task: AgentTask = await request.json();

    if (!task.id || !task.type || !task.prompt) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, type, prompt' 
      }, { status: 400 });
    }

    const result = await agentExecutor.executeTask(task);

    return NextResponse.json({
      taskId: task.id,
      result
    });

  } catch (error: any) {
    console.error('Agent execution error:', error);
    return NextResponse.json({ 
      error: error.message || 'Agent execution failed' 
    }, { status: 500 });
  }
}
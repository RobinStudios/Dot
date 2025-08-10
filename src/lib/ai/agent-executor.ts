import { AIAgent, AgentTask } from './agent-registry';
import axios from 'axios';

export class AgentExecutor {
  public async executeTask(agent: AIAgent, task: AgentTask): Promise<any> {
    switch (agent.provider) {
      case 'anthropic':
        return this.executeAnthropicTask(agent, task);
      case 'openai':
        return this.executeOpenAITask(agent, task);
      case 'stability':
        return this.executeStabilityTask(agent, task);
      case 'custom':
        return this.executeCustomTask(agent, task);
      default:
        throw new Error(`Unsupported provider: ${agent.provider}`);
    }
  }

  private async executeAnthropicTask(agent: AIAgent, task: AgentTask): Promise<any> {
    const prompt = this.buildPromptForTask(task, agent.specialties);
    
    const response = await fetch('/api/agents/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: agent.modelId,
        prompt,
        task: task.type
      })
    });

    return response.json();
  }

  private async executeOpenAITask(agent: AIAgent, task: AgentTask): Promise<any> {
    const response = await fetch('/api/agents/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: agent.modelId,
        input: task.input,
        type: agent.type,
        task: task.type
      })
    });

    return response.json();
  }

  private async executeStabilityTask(agent: AIAgent, task: AgentTask): Promise<any> {
    const response = await fetch('/api/agents/stability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: agent.modelId,
        prompt: task.input,
        task: task.type
      })
    });

    return response.json();
  }

  private async executeCustomTask(agent: AIAgent, task: AgentTask): Promise<any> {
    if (!agent.apiEndpoint) {
      throw new Error('Custom agent requires API endpoint');
    }

    const response = await axios.post(agent.apiEndpoint, {
      input: task.input,
      context: task.context,
      task: task.type
    }, {
      headers: {
        'Authorization': `Bearer ${agent.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  private buildPromptForTask(task: AgentTask, specialties: string[]): string {
    const specialtyContext = specialties.join(', ');
    
    switch (task.type) {
      case 'design_generation':
        return `As a design expert specializing in ${specialtyContext}, create a comprehensive design based on: ${task.input}`;
      case 'asset_creation':
        return `Create visual assets specializing in ${specialtyContext} for: ${task.input}`;
      case 'copywriting':
        return `Write compelling copy specializing in ${specialtyContext} for: ${task.input}`;
      case 'code_export':
        return `Generate clean, responsive code specializing in ${specialtyContext} for: ${task.input}`;
      default:
        return `Complete this task using your expertise in ${specialtyContext}: ${task.input}`;
    }
  }
}
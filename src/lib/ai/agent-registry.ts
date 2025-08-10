export interface AIAgent {
  id: string;
  name: string;
  provider: string;
  type: 'text' | 'image' | 'code' | 'multimodal';
  specialties: string[];
  apiEndpoint?: string;
  apiKey?: string;
  modelId?: string;
  isDefault?: boolean;
  isFineTuned?: boolean;
}

export interface AgentTask {
  type: 'design_generation' | 'asset_creation' | 'code_export' | 'copywriting' | 'branding' | 'ui_optimization';
  input: any;
  context?: any;
}

export class AgentRegistry {
  private agents: Map<string, AIAgent> = new Map();
  private taskAgentMap: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents() {
    const defaultAgents: AIAgent[] = [
      {
        id: 'claude-designer',
        name: 'Claude Designer Pro',
        provider: 'anthropic',
        type: 'multimodal',
        specialties: ['layout_design', 'typography', 'color_theory'],
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        isDefault: true,
        isFineTuned: true
      },
      {
        id: 'dalle-asset-gen',
        name: 'DALL-E Asset Generator',
        provider: 'openai',
        type: 'image',
        specialties: ['icon_creation', 'illustration', 'background_generation'],
        modelId: 'dall-e-3',
        isFineTuned: true
      },
      {
        id: 'gpt-copywriter',
        name: 'GPT Copywriter',
        provider: 'openai',
        type: 'text',
        specialties: ['marketing_copy', 'ui_text', 'brand_messaging'],
        modelId: 'gpt-4-turbo',
        isFineTuned: true
      }
    ];

    defaultAgents.forEach(agent => this.registerAgent(agent));
    this.setupTaskMappings();
  }

  private setupTaskMappings() {
    this.taskAgentMap.set('design_generation', ['claude-designer', 'gpt-copywriter']);
    this.taskAgentMap.set('asset_creation', ['dalle-asset-gen']);
    this.taskAgentMap.set('code_export', ['claude-designer']);
    this.taskAgentMap.set('copywriting', ['gpt-copywriter']);
    this.taskAgentMap.set('branding', ['dalle-asset-gen', 'gpt-copywriter']);
    this.taskAgentMap.set('ui_optimization', ['claude-designer']);
  }

  public registerAgent(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
  }

  public getBestAgentForTask(task: AgentTask): AIAgent | null {
    const candidateIds = this.taskAgentMap.get(task.type) || [];
    
    for (const id of candidateIds) {
      const agent = this.agents.get(id);
      if (agent && agent.isDefault) {
        return agent;
      }
    }

    return candidateIds.length > 0 ? this.agents.get(candidateIds[0]) || null : null;
  }

  public getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }
}
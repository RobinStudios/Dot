import { AIAgent } from './agent-registry';
import { AgentTask } from '../../types';

export interface AdaptiveContext {
  userPreferences: Record<string, any>;
  projectHistory: any[];
  currentWorkflow: string;
  performanceMetrics: Record<string, number>;
}

export interface ModularPack {
  id: string;
  name: string;
  category: 'design' | 'code' | 'content' | 'workflow';
  agents: string[];
  capabilities: string[];
  dependencies: string[];
  isInstalled: boolean;
}

import { AgentRegistry } from './agent-registry';

export class AdaptiveAgent {
  private context: AdaptiveContext;
  private installedPacks: Map<string, ModularPack> = new Map();
  private learningData: Map<string, any> = new Map();
  private agentRegistry: AgentRegistry;

  constructor(context: AdaptiveContext) {
    this.context = context;
    this.agentRegistry = new AgentRegistry();
    this.initializeCorePacks();
  }

  private initializeCorePacks() {
    const corePacks: ModularPack[] = [
      {
        id: 'design-core',
        name: 'Design Core Pack',
        category: 'design',
        agents: ['claude-designer', 'dalle-asset-gen'],
        capabilities: ['layout_generation', 'color_schemes', 'typography'],
        dependencies: [],
        isInstalled: true
      },
      {
        id: 'code-export',
        name: 'Code Export Pack',
        category: 'code',
        agents: ['claude-designer'],
        capabilities: ['html_export', 'react_export', 'css_generation'],
        dependencies: ['design-core'],
        isInstalled: true
      },
      {
        id: 'bulk-operations',
        name: 'Bulk Operations Pack',
        category: 'workflow',
        agents: ['claude-designer', 'gpt-copywriter'],
        capabilities: ['batch_processing', 'bulk_export', 'workflow_automation'],
        dependencies: ['design-core', 'code-export'],
        isInstalled: true
      }
    ];

    corePacks.forEach(pack => this.installedPacks.set(pack.id, pack));
  }

  public async adaptToTask(task: AgentTask): Promise<AIAgent[]> {
    const relevantPacks = this.getRelevantPacks(task);
    const availableAgents = this.getAgentsFromPacks(relevantPacks);
    
    // Learn from user behavior
    this.updateLearningData(task, availableAgents);
    
    // Adapt agent selection based on context
    return this.selectOptimalAgents(availableAgents, task);
  }

  private getRelevantPacks(task: AgentTask): ModularPack[] {
    return Array.from(this.installedPacks.values()).filter(pack => {
      switch (task.type) {
        case 'design_generation':
          return pack.category === 'design' || pack.capabilities.includes('layout_generation');
        case 'code_export':
          return pack.category === 'code' || pack.capabilities.includes('html_export');
        case 'bulk_export':
          return pack.capabilities.includes('bulk_export');
        default:
          return pack.category === 'workflow';
      }
    });
  }

  private getAgentsFromPacks(packs: ModularPack[]): string[] {
    return [...new Set(packs.flatMap(pack => pack.agents))];
  }

  private selectOptimalAgents(agentIds: string[], task: AgentTask): AIAgent[] {
    // Adaptive selection based on performance metrics and user preferences
    const performanceWeights = this.context.performanceMetrics;
    const userPrefs = this.context.userPreferences;
    
    const allAgents = this.agentRegistry.getAllAgents();
    return agentIds
      .map(id => {
        const agent = allAgents.find(a => a.id === id);
        return {
          agent,
          score: this.calculateAgentScore(id, task, performanceWeights, userPrefs),
        };
      })
      .filter(item => item.agent)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.agent as AIAgent);
  }

  private calculateAgentScore(agentId: string, task: AgentTask, metrics: Record<string, number>, prefs: Record<string, any>): number {
    const baseScore = metrics[agentId] || 50;
    const prefBonus = prefs[agentId] ? 20 : 0;
    const taskRelevance = this.getTaskRelevanceScore(agentId, task.type);
    
    return baseScore + prefBonus + taskRelevance;
  }

  private getTaskRelevanceScore(agentId: string, taskType: string): number {
    const relevanceMap: Record<string, Record<string, number>> = {
      'claude-designer': { 'design_generation': 30, 'code_export': 25, 'bulk_export': 20 },
      'dalle-asset-gen': { 'asset_creation': 30, 'design_generation': 15 },
      'gpt-copywriter': { 'copywriting': 30, 'design_generation': 10 }
    };
    
    return relevanceMap[agentId]?.[taskType] || 0;
  }

  private updateLearningData(task: AgentTask, agents: string[]) {
    const key = `${task.type}_${Date.now()}`;
    this.learningData.set(key, {
      task: task.type,
      agents,
      timestamp: new Date(),
      context: this.context.currentWorkflow
    });
  }

  public getAvailablePacks(): ModularPack[] {
    return [
      {
        id: 'advanced-design',
        name: 'Advanced Design Pack',
        category: 'design',
        agents: ['midjourney-agent', 'figma-agent'],
        capabilities: ['advanced_layouts', '3d_mockups', 'animation'],
        dependencies: ['design-core'],
        isInstalled: false
      },
      {
        id: 'enterprise-code',
        name: 'Enterprise Code Pack',
        category: 'code',
        agents: ['react-specialist', 'vue-specialist', 'angular-specialist'],
        capabilities: ['framework_export', 'component_library', 'testing_suite'],
        dependencies: ['code-export'],
        isInstalled: false
      },
      {
        id: 'content-ai',
        name: 'Content AI Pack',
        category: 'content',
        agents: ['content-strategist', 'seo-optimizer'],
        capabilities: ['content_strategy', 'seo_optimization', 'brand_voice'],
        dependencies: [],
        isInstalled: false
      }
    ];
  }

  public async installPack(packId: string): Promise<boolean> {
    const availablePacks = this.getAvailablePacks();
    const pack = availablePacks.find(p => p.id === packId);
    
    if (!pack) return false;
    
    // Check dependencies
    const missingDeps = pack.dependencies.filter(dep => !this.installedPacks.has(dep));
    if (missingDeps.length > 0) {
      throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
    }
    
    pack.isInstalled = true;
    this.installedPacks.set(packId, pack);
    return true;
  }
}
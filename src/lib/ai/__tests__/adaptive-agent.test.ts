import { AdaptiveAgent, AdaptiveContext } from '../adaptive-agent';
import { AgentTask } from '../../../types';

describe('AdaptiveAgent', () => {
  let context: AdaptiveContext;

  beforeEach(() => {
    context = {
      userPreferences: {},
      projectHistory: [],
      currentWorkflow: 'test-workflow',
      performanceMetrics: {},
    };
  });

  it('should initialize without errors', () => {
    expect(() => new AdaptiveAgent(context)).not.toThrow();
  });

  it('should return agents for a design_generation task', async () => {
    const agent = new AdaptiveAgent(context);
    const task: AgentTask = {
      id: 'test-task',
      type: 'design_generation',
      input: 'a modern landing page',
    };
    const agents = await agent.adaptToTask(task);
    expect(agents).toBeInstanceOf(Array);
    expect(agents.length).toBeGreaterThan(0);
    expect(agents[0]).toHaveProperty('id');
    expect(agents[0]).toHaveProperty('name');
  });

  it('should return agents for a code_export task', async () => {
    const agent = new AdaptiveAgent(context);
    const task: AgentTask = {
      id: 'test-task',
      type: 'code_export',
      input: 'a react component',
    };
    const agents = await agent.adaptToTask(task);
    expect(agents).toBeInstanceOf(Array);
    expect(agents.length).toBeGreaterThan(0);
  });
});

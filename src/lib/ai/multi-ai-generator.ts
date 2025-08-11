export interface AIProvider {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  specialty: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    endpoint: '/api/ai/anthropic',
    model: 'claude-3-sonnet-20240229',
    specialty: 'Code Generation & Architecture'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    endpoint: '/api/ai/mistral',
    model: 'mistral-large-latest',
    specialty: 'Frontend Framework 1'
  },
  {
    id: 'ai21',
    name: 'AI21 Labs',
    endpoint: '/api/ai/ai21',
    model: 'jamba-instruct',
    specialty: 'Frontend Framework 2'
  },
  {
    id: 'stability',
    name: 'Stability AI',
    endpoint: '/api/ai/stability',
    model: 'stable-code-instruct-3b',
    specialty: 'Frontend Framework 3'
  },
  {
    id: 'meta',
    name: 'Meta Llama',
    endpoint: '/api/ai/meta',
    model: 'llama-3.1-70b-instruct',
    specialty: 'Frontend Framework 4'
  },
  {
    id: 'replicate',
    name: 'Replicate',
    endpoint: '/api/ai/replicate',
    model: 'meta/codellama-34b-instruct',
    specialty: 'Frontend Framework 5'
  }
];

export interface GenerationRequest {
  appIdea: string;
  requirements: string[];
  targetFramework?: string;
}

export interface GeneratedFrontend {
  providerId: string;
  providerName: string;
  code: string;
  framework: string;
  features: string[];
  preview?: string;
}

export class MultiAIGenerator {
  async generateMultipleFrontends(request: GenerationRequest): Promise<GeneratedFrontend[]> {
    const results: GeneratedFrontend[] = [];
    
    // First, use Anthropic for code architecture
    const architecture = await this.generateArchitecture(request);
    
    // Then generate 5 different frontends using other providers
    const frontendProviders = AI_PROVIDERS.slice(1); // Skip Anthropic
    
    const promises = frontendProviders.map(async (provider, index) => {
      const framework = this.getFrameworkForProvider(provider.id, index);
      return this.generateFrontend(provider, request, architecture, framework);
    });
    
    const frontends = await Promise.allSettled(promises);
    
    frontends.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });
    
    return results;
  }
  
  private async generateArchitecture(request: GenerationRequest): Promise<string> {
    const prompt = `Generate a detailed technical architecture for this app idea:
    
App Idea: ${request.appIdea}
Requirements: ${request.requirements.join(', ')}

Provide:
1. Component structure
2. State management approach
3. API integration points
4. Key features breakdown
5. Technical recommendations

Format as JSON with clear structure.`;

    const response = await fetch('/api/ai/anthropic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'claude-3-sonnet-20240229' })
    });
    
    const result = await response.json();
    return result.content;
  }
  
  private async generateFrontend(
    provider: AIProvider, 
    request: GenerationRequest, 
    architecture: string,
    framework: string
  ): Promise<GeneratedFrontend> {
    const prompt = `Create a complete ${framework} frontend implementation for this app:

App Idea: ${request.appIdea}
Requirements: ${request.requirements.join(', ')}
Architecture: ${architecture}

Generate:
1. Complete component code
2. Styling (Tailwind CSS)
3. State management
4. Responsive design
5. Modern UI/UX patterns

Focus on ${provider.specialty}. Make it production-ready and visually appealing.`;

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        model: provider.model,
        framework 
      })
    });
    
    const result = await response.json();
    
    return {
      providerId: provider.id,
      providerName: provider.name,
      code: result.code || result.content,
      framework,
      features: this.extractFeatures(result.content),
      preview: result.preview
    };
  }
  
  private getFrameworkForProvider(providerId: string, index: number): string {
    const frameworks = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js'];
    return frameworks[index] || 'React';
  }
  
  private extractFeatures(content: string): string[] {
    // Extract features from generated content
    const features = [];
    if (content.includes('useState')) features.push('State Management');
    if (content.includes('responsive')) features.push('Responsive Design');
    if (content.includes('tailwind')) features.push('Tailwind CSS');
    if (content.includes('api')) features.push('API Integration');
    return features;
  }
}
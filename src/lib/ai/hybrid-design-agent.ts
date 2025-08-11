import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '../aws/cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

interface DesignRequest {
  prompt: string;
  type: 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'blog' | 'component';
  style?: string;
  framework?: 'react' | 'vue' | 'html';
}

interface DesignOutput {
  code: string;
  description: string;
  designSystem: {
    colors: string[];
    typography: string;
    spacing: string;
  };
  imagePrompts?: string[];
}

export class HybridDesignAgent {
  // Step 1: Claude 3.5 Sonnet - Design Planning & Architecture
  async planDesign(request: DesignRequest): Promise<any> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `You are a senior UX/UI designer. Plan a ${request.type} design for: "${request.prompt}"

Return JSON with:
{
  "layout": "detailed layout structure",
  "sections": ["header", "hero", "features", "footer"],
  "colorScheme": ["#primary", "#secondary", "#accent"],
  "typography": "font recommendations",
  "components": ["button", "card", "navigation"],
  "userFlow": "interaction patterns",
  "designPrinciples": ["principle1", "principle2"]
}`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return JSON.parse(result.content[0].text);
  }

  // Step 2: Claude 3 Haiku - Fast Code Generation
  async generateCode(designPlan: any, request: DesignRequest): Promise<string> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Generate ${request.framework || 'react'} code for this design plan:

${JSON.stringify(designPlan, null, 2)}

Requirements:
- Use Tailwind CSS
- Responsive design
- Clean, production-ready code
- Include all sections: ${designPlan.sections?.join(', ')}

Return only the component code:`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    let code = result.content[0].text;
    if (code.includes('```')) {
      const codeMatch = code.match(/```(?:tsx?|javascript|jsx?)?\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        code = codeMatch[1];
      }
    }
    return code.trim();
  }

  // Step 3: Claude 3.5 Sonnet - Code Review & Enhancement
  async enhanceCode(code: string, designPlan: any): Promise<string> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Review and enhance this React component code:

${code}

Design Plan Context:
${JSON.stringify(designPlan, null, 2)}

Improvements needed:
1. Add micro-interactions and hover effects
2. Improve accessibility (ARIA labels, semantic HTML)
3. Optimize for performance
4. Add proper TypeScript types
5. Ensure responsive design
6. Add loading states and error handling

Return the enhanced code:`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    let enhancedCode = result.content[0].text;
    if (enhancedCode.includes('```')) {
      const codeMatch = enhancedCode.match(/```(?:tsx?|javascript|jsx?)?\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        enhancedCode = codeMatch[1];
      }
    }
    return enhancedCode.trim();
  }

  // Step 4: Generate Image Prompts for Assets
  async generateImagePrompts(designPlan: any, request: DesignRequest): Promise<string[]> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Generate image prompts for this ${request.type} design:

Original request: "${request.prompt}"
Color scheme: ${designPlan.colorScheme?.join(', ')}
Style: ${request.style || 'modern'}

Return JSON array of 3-5 specific image prompts:
["hero background image prompt", "icon/illustration prompt", "product/feature image prompt"]`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    try {
      return JSON.parse(result.content[0].text);
    } catch {
      return [`${request.prompt} hero image, ${request.style || 'modern'} style`];
    }
  }

  // Main Hybrid Workflow
  async generateDesign(request: DesignRequest): Promise<DesignOutput> {
    try {
      // Step 1: Strategic Design Planning (Claude 3.5 Sonnet)
      console.log('🎨 Planning design architecture...');
      const designPlan = await this.planDesign(request);

      // Step 2: Fast Code Generation (Claude 3 Haiku)
      console.log('⚡ Generating initial code...');
      const initialCode = await this.generateCode(designPlan, request);

      // Step 3: Code Enhancement (Claude 3.5 Sonnet)
      console.log('✨ Enhancing code quality...');
      const enhancedCode = await this.enhanceCode(initialCode, designPlan);

      // Step 4: Generate Asset Prompts (Claude 3 Haiku)
      console.log('🖼️ Creating image prompts...');
      const imagePrompts = await this.generateImagePrompts(designPlan, request);

      return {
        code: enhancedCode,
        description: `${request.type} design for: ${request.prompt}`,
        designSystem: {
          colors: designPlan.colorScheme || ['#3b82f6', '#1f2937', '#f8fafc'],
          typography: designPlan.typography || 'Inter, system-ui, sans-serif',
          spacing: 'Tailwind spacing scale'
        },
        imagePrompts
      };

    } catch (error: any) {
      console.error('Hybrid design generation failed:', error);
      throw new Error(`Design generation failed: ${error.message}`);
    }
  }
}

export const hybridDesignAgent = new HybridDesignAgent();
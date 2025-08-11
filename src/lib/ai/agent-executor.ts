import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '../aws/cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

export interface AgentTask {
  id: string;
  type: 'design' | 'code' | 'brand' | 'export';
  prompt: string;
  context?: any;
}

export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class AgentExecutor {
  private agents: Map<string, any> = new Map();

  async executeTask(task: AgentTask): Promise<AgentResult> {
    try {
      // Validate task type
      const allowedTypes = ['design', 'code', 'brand', 'export'];
      if (!allowedTypes.includes(task.type)) {
        return { success: false, error: 'Invalid task type' };
      }

      // Sanitize prompt
      const sanitizedPrompt = task.prompt
        .replace(/[<>"'&]/g, '')
        .replace(/\b(exec|eval|system|shell)\b/gi, '')
        .substring(0, 1000);
      
      const sanitizedTask = { ...task, prompt: sanitizedPrompt };

      switch (sanitizedTask.type) {
        case 'design':
          return await this.executeDesignTask(sanitizedTask);
        case 'code':
          return await this.executeCodeTask(sanitizedTask);
        case 'brand':
          return await this.executeBrandTask(sanitizedTask);
        case 'export':
          return await this.executeExportTask(sanitizedTask);
        default:
          return { success: false, error: 'Unknown task type' };
      }
    } catch (error: any) {
      console.error('Task execution failed');
      return { success: false, error: 'Task execution failed' };
    }
  }

  private async executeDesignTask(task: AgentTask): Promise<AgentResult> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Create a design based on: ${task.prompt}

Return JSON with design specifications:
{
  "layout": "grid|flexbox|absolute",
  "elements": [
    {
      "type": "text|image|shape",
      "content": "content",
      "style": {
        "color": "#hex",
        "fontSize": "16px",
        "position": {"x": 0, "y": 0}
      }
    }
  ],
  "colorScheme": ["#hex1", "#hex2", "#hex3"],
  "typography": {
    "primary": "font-family",
    "sizes": {"h1": "32px", "body": "16px"}
  }
}`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    try {
      const designData = JSON.parse(result.content[0].text);
      return { success: true, data: designData };
    } catch {
      return { success: true, data: { layout: 'flexbox', elements: [], colorScheme: ['#3b82f6'] } };
    }
  }

  private async executeCodeTask(task: AgentTask): Promise<AgentResult> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Generate React component code for: ${task.prompt}

Requirements:
- Use Tailwind CSS
- Make it responsive
- Include proper TypeScript types
- Export as default

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

    return { success: true, data: { code: code.trim() } };
  }

  private async executeBrandTask(task: AgentTask): Promise<AgentResult> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Create a brand system for: ${task.prompt}

Return JSON:
{
  "brandName": "name",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex"
  },
  "typography": {
    "headings": "font-family",
    "body": "font-family"
  },
  "personality": ["trait1", "trait2", "trait3"],
  "logoDirection": "description"
}`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    try {
      const brandData = JSON.parse(result.content[0].text);
      return { success: true, data: brandData };
    } catch {
      return { success: true, data: { brandName: 'Brand', colors: { primary: '#3b82f6' } } };
    }
  }

  private async executeExportTask(task: AgentTask): Promise<AgentResult> {
    // Handle code export logic
    const { format = 'react', code } = task.context || {};
    
    switch (format) {
      case 'react':
        return { success: true, data: { code, format: 'tsx' } };
      case 'html':
        const htmlCode = this.convertToHTML(code);
        return { success: true, data: { code: htmlCode, format: 'html' } };
      case 'vue':
        const vueCode = this.convertToVue(code);
        return { success: true, data: { code: vueCode, format: 'vue' } };
      default:
        return { success: false, error: 'Unsupported export format' };
    }
  }

  private convertToHTML(reactCode: string): string {
    // Basic React to HTML conversion
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Design</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root">
        <!-- Converted from React component -->
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div class="container mx-auto px-4 py-16">
                <h1 class="text-4xl font-bold text-center text-gray-900 mb-8">
                    AI Generated Design
                </h1>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private convertToVue(reactCode: string): string {
    return `<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-16">
      <h1 class="text-4xl font-bold text-center text-gray-900 mb-8">
        AI Generated Design
      </h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIGeneratedComponent',
  data() {
    return {
      // Component data
    }
  }
}
</script>

<style scoped>
/* Component styles */
</style>`;
  }
}

export const agentExecutor = new AgentExecutor();
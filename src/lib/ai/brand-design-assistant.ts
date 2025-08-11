import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '../aws/cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

interface BrandAnalysis {
  brandScore: number;
  typographyScore: number;
  colorScore: number;
  logoScore: number;
  overallScore: number;
  suggestions: string[];
  improvements: string[];
  strengths: string[];
}

interface DesignContext {
  elements: any[];
  colors: string[];
  fonts: string[];
  brandName?: string;
  industry?: string;
  targetAudience?: string;
}

export class BrandDesignAssistant {
  async analyzeDesign(context: DesignContext): Promise<BrandAnalysis> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are a senior brand designer and typography expert. Analyze this design and provide detailed feedback:

Design Context:
- Brand: ${context.brandName || 'Unknown'}
- Industry: ${context.industry || 'General'}
- Target Audience: ${context.targetAudience || 'General'}
- Colors Used: ${context.colors.join(', ')}
- Fonts Used: ${context.fonts.join(', ')}
- Elements: ${context.elements.length} design elements

Analyze and rate (0-100) these aspects:
1. Brand Consistency & Identity
2. Typography Hierarchy & Readability  
3. Color Harmony & Psychology
4. Logo Integration & Placement
5. Overall Design Quality

Return JSON:
{
  "brandScore": 85,
  "typographyScore": 90,
  "colorScore": 75,
  "logoScore": 80,
  "overallScore": 82,
  "suggestions": ["Improve color contrast", "Add more white space"],
  "improvements": ["Use consistent font weights", "Align elements to grid"],
  "strengths": ["Strong typography hierarchy", "Good color balance"]
}`
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
      return this.getDefaultAnalysis();
    }
  }

  async getSuggestion(query: string, context: DesignContext): Promise<string> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a brand design expert. Answer this design question with specific, actionable advice:

Question: "${query}"

Design Context:
- Brand: ${context.brandName || 'Unknown'}
- Industry: ${context.industry || 'General'}
- Colors: ${context.colors.join(', ')}
- Fonts: ${context.fonts.join(', ')}

Provide a helpful, specific answer focused on branding, typography, color theory, and design best practices.`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.content[0].text;
  }

  async generateColorPalette(brandName: string, industry: string, mood: string): Promise<string[]> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Generate a professional color palette for:
Brand: ${brandName}
Industry: ${industry}
Mood: ${mood}

Return 5 hex colors as JSON array: ["#primary", "#secondary", "#accent", "#neutral", "#highlight"]

Consider color psychology, industry standards, and brand personality.`
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
      return ['#2563eb', '#64748b', '#f59e0b', '#f8fafc', '#10b981'];
    }
  }

  async recommendTypography(brandName: string, industry: string): Promise<{primary: string, secondary: string, reasoning: string}> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `Recommend typography for:
Brand: ${brandName}
Industry: ${industry}

Return JSON:
{
  "primary": "Font name for headings",
  "secondary": "Font name for body text", 
  "reasoning": "Why these fonts work for this brand"
}

Choose from: Inter, Roboto, Helvetica, Georgia, Times New Roman, JetBrains Mono, or suggest web-safe alternatives.`
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
      return {
        primary: 'Inter, sans-serif',
        secondary: 'Inter, sans-serif',
        reasoning: 'Inter provides excellent readability and modern appeal across industries.'
      };
    }
  }

  async rateDesignElement(element: any, context: DesignContext): Promise<{score: number, feedback: string}> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Rate this design element (0-100) and provide feedback:

Element: ${element.type}
Properties: ${JSON.stringify(element, null, 2)}

Brand Context: ${context.brandName} (${context.industry})

Return JSON:
{
  "score": 85,
  "feedback": "Specific feedback on typography, colors, positioning, brand alignment"
}`
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
      return {
        score: 75,
        feedback: 'Element looks good but could benefit from better alignment and contrast.'
      };
    }
  }

  private getDefaultAnalysis(): BrandAnalysis {
    return {
      brandScore: 75,
      typographyScore: 80,
      colorScore: 70,
      logoScore: 75,
      overallScore: 75,
      suggestions: ['Improve color contrast', 'Add consistent spacing', 'Strengthen brand identity'],
      improvements: ['Use a consistent font hierarchy', 'Align elements to a grid system'],
      strengths: ['Good use of white space', 'Clear visual hierarchy']
    };
  }
}

export const brandDesignAssistant = new BrandDesignAssistant();
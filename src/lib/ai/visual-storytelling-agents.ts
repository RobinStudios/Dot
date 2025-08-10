import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '../aws/cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

export interface BrandStorytellingAgent {
  generateBrandIdentity(prompt: string): Promise<any>;
  createLogoVariations(brandName: string, style: string): Promise<any>;
  generateTypographySystem(brandPersonality: string): Promise<any>;
  createVisualNarrative(storyPrompt: string): Promise<any>;
}

export class VisualStorytellingAI implements BrandStorytellingAgent {
  
  async generateBrandIdentity(prompt: string): Promise<any> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `As a brand identity expert, create a comprehensive brand system for: ${prompt}

Return JSON with:
{
  "brandPersonality": ["trait1", "trait2", "trait3"],
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex", 
    "accent": "#hex",
    "neutral": ["#hex1", "#hex2"]
  },
  "typography": {
    "primary": "font-family",
    "secondary": "font-family",
    "weights": [400, 600, 700]
  },
  "logoDirection": "description",
  "visualStyle": "description",
  "applications": ["web", "print", "social"]
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

  async createLogoVariations(brandName: string, style: string): Promise<any> {
    const command = new InvokeModelCommand({
      modelId: 'stability.stable-diffusion-xl-v1',
      body: JSON.stringify({
        text_prompts: [{
          text: `Professional logo design for ${brandName}, ${style} style, vector art, clean, minimal, brand identity, white background`
        }],
        cfg_scale: 10,
        steps: 50,
        width: 512,
        height: 512,
        samples: 4
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.artifacts.map((artifact: any) => `data:image/png;base64,${artifact.base64}`);
  }

  async generateTypographySystem(brandPersonality: string): Promise<any> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Create a typography system for a ${brandPersonality} brand.

Return JSON:
{
  "headings": {
    "h1": {"font": "font-name", "size": "clamp()", "weight": 700, "lineHeight": 1.2},
    "h2": {"font": "font-name", "size": "clamp()", "weight": 600, "lineHeight": 1.3},
    "h3": {"font": "font-name", "size": "clamp()", "weight": 600, "lineHeight": 1.4}
  },
  "body": {
    "large": {"font": "font-name", "size": "clamp()", "weight": 400, "lineHeight": 1.6},
    "regular": {"font": "font-name", "size": "clamp()", "weight": 400, "lineHeight": 1.5},
    "small": {"font": "font-name", "size": "clamp()", "weight": 400, "lineHeight": 1.4}
  },
  "fontPairings": ["primary-font", "secondary-font"],
  "spacing": {"letterSpacing": "0.02em", "wordSpacing": "normal"}
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

  async createVisualNarrative(storyPrompt: string): Promise<any> {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Create a visual storytelling layout for: ${storyPrompt}

Return Figma-compatible JSON:
{
  "canvas": {"width": 1440, "height": 1024},
  "elements": [
    {
      "id": "unique-id",
      "type": "text|image|shape|group",
      "x": 0, "y": 0, "width": 100, "height": 50,
      "properties": {
        "text": "content",
        "fontSize": 24,
        "fontFamily": "font-name",
        "color": "#hex",
        "backgroundColor": "#hex",
        "borderRadius": 8,
        "opacity": 1
      },
      "animations": [
        {"property": "opacity", "from": 0, "to": 1, "duration": 500, "delay": 0}
      ]
    }
  ],
  "storyFlow": ["element-id-1", "element-id-2"],
  "interactions": [
    {"trigger": "click", "target": "element-id", "action": "navigate", "destination": "page-2"}
  ]
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
}
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from './cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

export interface DesignPrompt {
  prompt: string;
  style: string;
  layout: string;
  colorScheme: string;
  typography: string;
}

export interface GeneratedDesign {
  id: string;
  mockupUrl: string;
  layout: any;
  colors: string[];
  typography: any;
  elements: any[];
}

export async function generateDesignMockups(designPrompt: DesignPrompt): Promise<GeneratedDesign[]> {
  const prompt = `Generate 10 unique graphic design mockups for: ${designPrompt.prompt}
Style: ${designPrompt.style}
Layout: ${designPrompt.layout}
Color Scheme: ${designPrompt.colorScheme}
Typography: ${designPrompt.typography}

Return JSON array with design specifications including layout, colors, typography, and elements.`;

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  
  return result.content[0].text ? JSON.parse(result.content[0].text) : [];
}

export async function generateDesignImage(prompt: string): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: 'stability.stable-diffusion-xl-v1',
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 10,
      seed: 0,
      steps: 50,
      width: 1024,
      height: 1024,
    }),
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  
  return `data:image/png;base64,${result.artifacts[0].base64}`;
}

export async function generateResponsiveCode(design: any): Promise<string> {
  const prompt = `Convert this design to responsive React/Tailwind code with mobile breakpoints:
${JSON.stringify(design)}

Include:
- Mobile-first responsive design
- Tailwind CSS classes
- React components
- Accessibility features
- Grid layouts with breakpoints`;

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
    contentType: 'application/json',
    accept: 'application/json',
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  
  return result.content[0].text;
}
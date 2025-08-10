import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { getCognitoCredentials, cognitoConfig } from '@/lib/aws/cognito-setup';

const client = new BedrockRuntimeClient({
  region: cognitoConfig.region,
  credentials: getCognitoCredentials(),
});

export async function POST(request: NextRequest) {
  try {
    const { templateCode, editPrompt, templateId } = await request.json();

    if (!templateCode || !editPrompt) {
      return NextResponse.json({ error: 'Template code and edit prompt required' }, { status: 400 });
    }

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Modify this React component: ${editPrompt}

${templateCode}

Return only the modified code:`
        }]
      }),
      contentType: 'application/json',
      accept: 'application/json',
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    let modifiedCode = result.content[0].text;
    
    if (modifiedCode.includes('```')) {
      const codeMatch = modifiedCode.match(/```(?:tsx?|javascript|jsx?)?\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        modifiedCode = codeMatch[1];
      }
    }

    return NextResponse.json({
      success: true,
      modifiedCode: modifiedCode.trim(),
      originalPrompt: editPrompt,
      templateId
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to edit template' 
    }, { status: 500 });
  }
}
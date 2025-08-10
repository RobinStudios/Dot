"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockService = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const vscode = require("vscode");
class BedrockService {
    constructor() {
        this.initializeClient();
    }
    initializeClient() {
        const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
        const accessKeyId = config.get('awsAccessKeyId');
        const secretAccessKey = config.get('awsSecretAccessKey');
        const region = config.get('awsRegion') || 'us-east-1';
        if (accessKeyId && secretAccessKey) {
            this.client = new client_bedrock_runtime_1.BedrockRuntimeClient({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey
                }
            });
        }
    }
    async generateDesigns(prompt, options) {
        if (!this.client) {
            throw new Error('AWS credentials not configured. Please set them in VSCode settings.');
        }
        const config = vscode.workspace.getConfiguration('aiGraphicDesigner');
        const modelId = config.get('bedrockModelId') || 'anthropic.claude-3-sonnet-20240229-v1:0';
        const designPrompt = `Generate 5 unique graphic design mockups for: ${prompt}
Style: ${options?.style || 'modern'}
Layout: ${options?.layout || 'grid'}

Return JSON array with design specifications including:
- id: unique identifier
- title: design title
- style: design style
- colors: array of hex colors
- layout: layout type
- elements: array of design elements
- overallScore: quality score (0-100)
- code: HTML/CSS code for the design

Format as valid JSON array.`;
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId,
            body: JSON.stringify({
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 4000,
                messages: [{ role: 'user', content: designPrompt }],
            }),
            contentType: 'application/json',
            accept: 'application/json',
        });
        try {
            const response = await this.client.send(command);
            const result = JSON.parse(new TextDecoder().decode(response.body));
            const content = result.content[0].text;
            // Parse JSON from the response
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // Fallback mock data
            return this.generateMockDesigns(prompt);
        }
        catch (error) {
            console.error('Bedrock API error:', error);
            return this.generateMockDesigns(prompt);
        }
    }
    generateMockDesigns(prompt) {
        return [
            {
                id: '1',
                title: `Modern Design for "${prompt}"`,
                style: 'modern',
                colors: ['#3B82F6', '#1F2937', '#F3F4F6'],
                layout: 'grid',
                elements: ['header', 'hero', 'features', 'footer'],
                overallScore: 85,
                code: `<div class="modern-design">
                    <h1>${prompt}</h1>
                    <p>Modern, clean design approach</p>
                </div>`
            },
            {
                id: '2',
                title: `Minimalist Design for "${prompt}"`,
                style: 'minimalist',
                colors: ['#000000', '#FFFFFF', '#F5F5F5'],
                layout: 'flexbox',
                elements: ['header', 'content', 'sidebar'],
                overallScore: 78,
                code: `<div class="minimalist-design">
                    <h1>${prompt}</h1>
                    <p>Clean, minimal approach</p>
                </div>`
            }
        ];
    }
}
exports.BedrockService = BedrockService;
//# sourceMappingURL=bedrockService.js.map
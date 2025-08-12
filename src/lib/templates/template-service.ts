
import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

export interface Template {
  id: string;
  name: string;
  category: 'landing' | 'dashboard' | 'ecommerce' | 'portfolio' | 'blog';
  preview_url?: string;
  code: string;
  ai_prompts: string[];
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}


const TEMPLATES_TABLE = process.env.AWS_TEMPLATES_TABLE || 'ai-designer-templates';

export class TemplateService {
  async getPublicTemplates(): Promise<Template[]> {
    const params = {
      TableName: TEMPLATES_TABLE,
      IndexName: 'is_public-index',
      KeyConditionExpression: 'is_public = :pub',
      ExpressionAttributeValues: { ':pub': true },
      ScanIndexForward: false,
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items as Template[]) || this.getFallbackTemplates();
  }

  async getUserTemplates(userId: string): Promise<Template[]> {
    const params = {
      TableName: TEMPLATES_TABLE,
      IndexName: 'created_by-index',
      KeyConditionExpression: 'created_by = :uid',
      ExpressionAttributeValues: { ':uid': userId },
      ScanIndexForward: false,
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items as Template[]) || [];
  }

  async createTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>): Promise<Template> {
    const now = new Date().toISOString();
    const newTemplate = {
      ...template,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    await ddbDocClient.send(new PutCommand({ TableName: TEMPLATES_TABLE, Item: newTemplate }));
    return newTemplate;
  }

  private getFallbackTemplates(): Template[] {
    return [
      {
        id: 'saas-landing',
        name: 'SaaS Landing Page',
        category: 'landing',
        preview_url: '/templates/saas-landing.png',
        code: `export default function SaaSLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-900">SaaSApp</div>
        <div className="space-x-4">
          <button className="text-gray-600 hover:text-gray-900">Login</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Sign Up</button>
        </div>
      </nav>
      <main className="px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Build Better Products Faster
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The all-in-one platform for modern teams to collaborate, build, and ship amazing products.
        </p>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700">
          Get Started Free
        </button>
      </main>
    </div>
  );
}`,
        ai_prompts: ['Change the color scheme to green', 'Add a features section', 'Make it more modern'],
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export const templateService = new TemplateService();
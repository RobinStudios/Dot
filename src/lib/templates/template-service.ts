import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Template } from '../../types';

class TemplateService {
  private getFallbackTemplates(): Template[] {
    return [
      {
        id: 'framer-landing',
        name: 'Framer Landing Page',
        category: 'landing',
        preview_url: '/templates/framer-landing.png',
        code: `import { Frame, useCycle } from "framer";
export default function FramerLanding() {
  const [color, cycleColor] = useCycle("#fff", "#f0f4ff", "#e0e7ff");
  return (
    <Frame background={color} width="100%" height="100vh">
      <Frame center width={600} height={400} background="#fff" radius={32} shadow="0 8px 32px rgba(0,0,0,0.08)">
        <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 24 }}>Framer Pro Landing</h1>
        <p style={{ fontSize: 20, color: '#555', marginBottom: 32 }}>
          Beautiful, animated, and responsive landing page built with Framer best practices.
        </p>
        <button style={{ padding: '16px 32px', fontSize: 18, borderRadius: 12, background: '#2563eb', color: '#fff', fontWeight: 600 }} onClick={cycleColor}>
          Try Animation
        </button>
      </Frame>
    </Frame>
  );
}
`,
        ai_prompts: [
          'Use Framer Frame for layout and animation',
          'Apply responsive design and spacing',
          'Use cycleColor for interactive UI',
          'Follow UI/UX best practices: clear hierarchy, readable fonts, accessible colors',
          'Add animated transitions for buttons and sections',
          'Include call-to-action with strong contrast',
          'Optimize for mobile and desktop',
          'Use semantic HTML and ARIA roles where possible'
        ],
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: 'framer'
      },
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
}
`,
        ai_prompts: [
          'Use clear visual hierarchy',
          'Apply modern color palette',
          'Include call-to-action',
          'Optimize for mobile and desktop',
          'Use accessible contrast and font sizes',
          'Add testimonials section',
          'Follow UI/UX best practices'
        ],
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        source: 'custom'
      }
    ];
  }

  public getPublicTemplates(): Template[] {
    return this.getFallbackTemplates();
  }

  public getUserTemplates(userId: string): Template[] {
    // For now, return public templates as a placeholder
    return this.getFallbackTemplates();
  }

  public async createTemplate(templateData: Partial<Template>): Promise<Template> {
    // Stub: just return the input with a generated id and timestamps
    return {
      id: Math.random().toString(36).substring(2, 12),
      name: templateData.name || 'Untitled',
      category: templateData.category || 'uncategorized',
      preview_url: templateData.preview_url || '',
      code: templateData.code || '',
      ai_prompts: templateData.ai_prompts || [],
      is_public: templateData.is_public ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: templateData.source || 'custom',
      created_by: templateData.created_by,
    };
  }
}

export const templateService = new TemplateService();
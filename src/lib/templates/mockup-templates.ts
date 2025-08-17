import { DesignMockup } from '@/types';

const createMockupFromTemplate = (id: string, name: string, code: string, preview: string): DesignMockup => ({
  id,
  title: name,
  description: `A template for a ${name}.`,
  prompt: `A ${name}`,
  layout: { type: 'grid', columns: 12, rows: 8, gap: 16, padding: 24, breakpoints: [], gridTemplate: '' },
  typography: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textAlign: 'left', color: '#000' },
  colorScheme: { primary: '#000', secondary: '#000', accent: '#000', background: '#fff', text: '#000', surface: '#fff', error: '#f00', warning: '#f00', success: '#0f0', palette: [] },
  elements: [{
    id: 'code',
    type: 'text',
    content: code,
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    style: {},
  }],
  thumbnail: preview,
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublic: true,
  tags: [name.split(' ')[0].toLowerCase()],
  collaborators: [],
});

export const MOCKUP_TEMPLATES: DesignMockup[] = [
  createMockupFromTemplate(
    'saas-landing',
    'SaaS Landing Page',
    `export default function SaaSLanding() {
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
    '/templates/saas-landing.png'
  ),
  createMockupFromTemplate(
    'ecommerce-product',
    'E-commerce Product Page',
    `export default function ProductPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-lg"></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Headphones</h1>
          <p className="text-2xl font-bold text-blue-600 mb-4">$299.99</p>
          <p className="text-gray-600 mb-6">
            Experience crystal-clear audio with our premium wireless headphones.
          </p>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
              Add to Cart
            </button>
            <button className="w-full border border-gray-300 py-3 rounded-lg">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
    '/templates/ecommerce-product.png'
  ),
  createMockupFromTemplate(
    'dashboard-analytics',
    'Analytics Dashboard',
    `export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      </nav>
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">12,345</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$45,678</p>
          </div>
        </div>
      </main>
    </div>
  );
}`,
    '/templates/dashboard-analytics.png'
  )
];

export function getMockupById(id: string): DesignMockup | undefined {
  return MOCKUP_TEMPLATES.find(template => template.id === id);
}
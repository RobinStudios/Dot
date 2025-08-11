import { CSRFProtection } from '@/lib/security/csrf';

export class SecureAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async generateDesign(prompt: string, options: any, userId: string) {
    const csrfToken = CSRFProtection.generateToken(userId);
    
    return this.makeRequest('/ai/bedrock', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        ...options,
        csrfToken,
      }),
    });
  }

  async generateImage(prompt: string, userId: string) {
    const csrfToken = CSRFProtection.generateToken(userId);
    
    return this.makeRequest('/ai/replicate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        csrfToken,
      }),
    });
  }
}

export const secureAPI = new SecureAPIClient();
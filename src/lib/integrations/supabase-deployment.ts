import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class SupabaseDeployment {
  private client: any;

  constructor(private config: SupabaseConfig) {
    this.client = createClient(config.url, config.serviceRoleKey || config.anonKey);
  }

  async deployDesign(design: any): Promise<DeploymentResult> {
    try {
      // Create table if not exists
      await this.ensureDesignTable();
      
      // Insert design
      const { data, error } = await this.client
        .from('designs')
        .insert({
          name: design.name,
          code: design.code,
          elements: design.elements,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        url: `${this.config.url}/rest/v1/designs?id=eq.${data.id}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createProject(project: any): Promise<DeploymentResult> {
    try {
      await this.ensureProjectTable();
      
      const { data, error } = await this.client
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        url: `${this.config.url}/rest/v1/projects?id=eq.${data.id}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async ensureDesignTable() {
    const { error } = await this.client.rpc('create_designs_table');
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  }

  private async ensureProjectTable() {
    const { error } = await this.client.rpc('create_projects_table');
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.client.from('_health').select('*').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export function createSupabaseDeployment(config: SupabaseConfig): SupabaseDeployment {
  return new SupabaseDeployment(config);
}
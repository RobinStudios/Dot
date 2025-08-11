import { db } from './client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Design {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  prompt?: string;
  elements: any[];
  layout: any;
  color_scheme: any;
  typography: any;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export class ProjectService {
  async createProject(userId: string, name: string, description?: string): Promise<Project> {
    const { data, error } = await db
      .from('projects')
      .insert({
        name,
        description,
        owner_id: userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('owner_id', userId)
      .single();

    if (error) return null;
    return data;
  }

  async updateProject(projectId: string, userId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await db
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const { error } = await db
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('owner_id', userId);

    if (error) throw new Error(error.message);
  }

  async saveDesign(projectId: string, design: Omit<Design, 'id' | 'created_at' | 'updated_at'>): Promise<Design> {
    const { data, error } = await db
      .from('designs')
      .insert({
        ...design,
        project_id: projectId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getDesigns(projectId: string): Promise<Design[]> {
    const { data, error } = await db
      .from('designs')
      .select('*')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async updateDesign(designId: string, updates: Partial<Design>): Promise<Design> {
    const { data, error } = await db
      .from('designs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', designId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteDesign(designId: string): Promise<void> {
    const { error } = await db
      .from('designs')
      .delete()
      .eq('id', designId);

    if (error) throw new Error(error.message);
  }
}

export const projectService = new ProjectService();
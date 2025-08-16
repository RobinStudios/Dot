import { ddbDocClient } from '../aws/dynamodb-client';
import { getSupabaseClient } from './client';
import { PutCommand, QueryCommand, UpdateCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
import { z } from 'zod';
import { NextRequest } from 'next/server';

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

const PROJECTS_TABLE = process.env.AWS_PROJECTS_TABLE || 'ai-designer-projects';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = getSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
const DESIGNS_TABLE = process.env.AWS_DESIGNS_TABLE || 'ai-designer-designs';

export class ProjectService {
  async createProject(userId: string, name: string, description?: string): Promise<Project> {
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      owner_id: userId,
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Supabase insert
    const { error } = await supabase.from('projects').insert([project]);
    if (error) throw new Error(error.message);
    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*').eq('owner_id', userId);
    if (error) throw new Error(error.message);
    return (data as Project[]) || [];
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).eq('owner_id', userId).single();
    if (error) return null;
    return data as Project;
  }

  async updateProject(projectId: string, userId: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase.from('projects').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', projectId).eq('owner_id', userId).select().single();
    if (error) throw new Error(error.message);
    return data as Project;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', projectId).eq('owner_id', userId);
    if (error) throw new Error(error.message);
  }

  async saveDesign(projectId: string, design: Omit<Design, 'id' | 'created_at' | 'updated_at'>): Promise<Design> {
    const newDesign: Design = {
      ...design,
      id: crypto.randomUUID(),
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('designs').insert([newDesign]);
    if (error) throw new Error(error.message);
    return newDesign;
  }

  async getDesigns(projectId: string): Promise<Design[]> {
    const { data, error } = await supabase.from('designs').select('*').eq('project_id', projectId);
    if (error) throw new Error(error.message);
    return (data as Design[]) || [];
  }

  async updateDesign(designId: string, updates: Partial<Design>): Promise<Design> {
    const { data, error } = await supabase.from('designs').update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq('id', designId).select().single();
    if (error) throw new Error(error.message);
    return data as Design;
  }

  async deleteDesign(designId: string): Promise<void> {
    const { error } = await supabase.from('designs').delete().eq('id', designId);
    if (error) throw new Error(error.message);
  }
}

export const projectService = new ProjectService();

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const DesignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  prompt: z.string().optional(),
  elements: z.array(z.unknown()).optional(),
  layout: z.unknown().optional(),
  color_scheme: z.unknown().optional(),
  typography: z.unknown().optional(),
  thumbnail_url: z.string().url().optional(),
});

// In your API route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate input using Zod schema
    const validated = DesignSchema.parse(body);
    // ...existing code...
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ message: error.errors }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
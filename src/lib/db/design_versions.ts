import { db } from './client';

export interface DesignVersion {
  id: string;
  design_id: string;
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
  version_number: number;
  created_by: string;
}

export class DesignVersionService {
  async saveVersion(design: Omit<DesignVersion, 'id' | 'created_at' | 'version_number'>): Promise<DesignVersion> {
    // Get the latest version number for this design
    const { data: latest, error: latestError } = await db
      .from('design_versions')
      .select('version_number')
      .eq('design_id', design.design_id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') throw new Error(latestError.message);
    const nextVersion = latest?.version_number ? latest.version_number + 1 : 1;

    const { data, error } = await db
      .from('design_versions')
      .insert({
        ...design,
        version_number: nextVersion,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

export const designVersionService = new DesignVersionService();

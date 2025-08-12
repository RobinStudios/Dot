
import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, QueryCommand, UpdateCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

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
    await ddbDocClient.send(new PutCommand({ TableName: PROJECTS_TABLE, Item: project }));
    return project;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const params = {
      TableName: PROJECTS_TABLE,
      IndexName: 'owner_id-index',
      KeyConditionExpression: 'owner_id = :uid',
      ExpressionAttributeValues: { ':uid': userId },
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items as Project[]) || [];
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const params = {
      TableName: PROJECTS_TABLE,
      Key: { id: projectId },
    };
    const result = await ddbDocClient.send(new GetCommand(params));
    const item = result.Item as Project | undefined;
    if (!item || item.owner_id !== userId) return null;
    return item;
  }

  async updateProject(projectId: string, userId: string, updates: Partial<Project>): Promise<Project> {
    const params = {
      TableName: PROJECTS_TABLE,
      Key: { id: projectId },
      UpdateExpression: 'set #name = :name, description = :desc, updated_at = :updated',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: {
        ':name': updates.name,
        ':desc': updates.description,
        ':updated': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };
    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes as Project;
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    const params = {
      TableName: PROJECTS_TABLE,
      Key: { id: projectId },
    };
    await ddbDocClient.send(new DeleteCommand(params));
  }

  async saveDesign(projectId: string, design: Omit<Design, 'id' | 'created_at' | 'updated_at'>): Promise<Design> {
    const newDesign: Design = {
      ...design,
      id: crypto.randomUUID(),
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await ddbDocClient.send(new PutCommand({ TableName: DESIGNS_TABLE, Item: newDesign }));
    return newDesign;
  }

  async getDesigns(projectId: string): Promise<Design[]> {
    const params = {
      TableName: DESIGNS_TABLE,
      IndexName: 'project_id-index',
      KeyConditionExpression: 'project_id = :pid',
      ExpressionAttributeValues: { ':pid': projectId },
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items as Design[]) || [];
  }

  async updateDesign(designId: string, updates: Partial<Design>): Promise<Design> {
    const params = {
      TableName: DESIGNS_TABLE,
      Key: { id: designId },
      UpdateExpression: 'set #name = :name, updated_at = :updated',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: {
        ':name': updates.name,
        ':updated': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    };
    const result = await ddbDocClient.send(new UpdateCommand(params));
    return result.Attributes as Design;
  }

  async deleteDesign(designId: string): Promise<void> {
    const params = {
      TableName: DESIGNS_TABLE,
      Key: { id: designId },
    };
    await ddbDocClient.send(new DeleteCommand(params));
  }
}

export const projectService = new ProjectService();
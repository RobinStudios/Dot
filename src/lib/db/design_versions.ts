
import { ddbDocClient } from '../aws/dynamodb-client';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

export interface DesignVersion {
  id: string;
  design_id: string;
  project_id?: string;
  name?: string;
  description?: string;
  prompt?: string;
  elements?: any[];
  layout?: any;
  color_scheme?: any;
  typography?: any;
  thumbnail_url?: string;
  created_at: string;
  version_number: number;
  created_by?: string;
  data?: any;
}

const DESIGN_VERSIONS_TABLE = process.env.AWS_DESIGN_VERSIONS_TABLE || 'ai-designer-design-versions';

export class DesignVersionService {
  async saveVersion(design: Omit<DesignVersion, 'id' | 'created_at' | 'version_number'>): Promise<DesignVersion> {
    // Get the latest version number for this design
    const params = {
      TableName: DESIGN_VERSIONS_TABLE,
      IndexName: 'design_id-index',
      KeyConditionExpression: 'design_id = :did',
      ExpressionAttributeValues: { ':did': design.design_id },
      ScanIndexForward: false,
      Limit: 1,
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    const latestVersion = result.Items && result.Items.length > 0 ? result.Items[0].version_number : 0;
    const nextVersion = latestVersion + 1;
    const now = new Date().toISOString();
    const version: DesignVersion = {
      ...design,
      id: crypto.randomUUID(),
      version_number: nextVersion,
      created_at: now,
    };
    await ddbDocClient.send(new PutCommand({ TableName: DESIGN_VERSIONS_TABLE, Item: version }));
    return version;
  }

  async getVersions(designId: string): Promise<DesignVersion[]> {
    const params = {
      TableName: DESIGN_VERSIONS_TABLE,
      IndexName: 'design_id-index',
      KeyConditionExpression: 'design_id = :did',
      ExpressionAttributeValues: { ':did': designId },
      ScanIndexForward: false,
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    return (result.Items as DesignVersion[]) || [];
  }

  async getVersion(designId: string, version: number): Promise<DesignVersion | null> {
    const params = {
      TableName: DESIGN_VERSIONS_TABLE,
      IndexName: 'design_id-version_number-index',
      KeyConditionExpression: 'design_id = :did and version_number = :ver',
      ExpressionAttributeValues: { ':did': designId, ':ver': version },
      Limit: 1,
    };
    const result = await ddbDocClient.send(new QueryCommand(params));
    if (!result.Items || result.Items.length === 0) return null;
    return result.Items[0] as DesignVersion;
  }
}

export const designVersionService = new DesignVersionService();

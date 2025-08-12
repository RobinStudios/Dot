import { db } from './client';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

export interface UserApiKey {
  id: string;
  user_id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'replicate' | 'custom';
  encrypted_key: string;
  key_preview: string;
  is_active: boolean;
  created_at: string;
  last_used?: string;
}

function encryptApiKey(key: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptApiKey(encryptedKey: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function createKeyPreview(key: string): string {
  if (key.length < 8) return '••••••••';
  return key.substring(0, 4) + '••••' + key.substring(key.length - 4);
}

export class ApiKeyService {
  async getUserApiKeys(userId: string): Promise<UserApiKey[]> {
    const { data, error } = await db
      .from('user_api_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createApiKey(userId: string, name: string, provider: string, key: string): Promise<UserApiKey> {

    import crypto from 'crypto';
    import { ddbDocClient } from '../aws/dynamodb-client';
    import { PutCommand, QueryCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

    const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    const TABLE_NAME = process.env.AWS_API_KEYS_TABLE || 'ai-designer-api-keys';

    export interface UserApiKey {
      id: string;
      user_id: string;
      name: string;
      provider: 'openai' | 'anthropic' | 'replicate' | 'custom';
      encrypted_key: string;
      key_preview: string;
      is_active: boolean;
      created_at: string;
      last_used?: string;
    }

    function encryptApiKey(key: string): string {
      const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
      let encrypted = cipher.update(key, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    }

    function decryptApiKey(encryptedKey: string): string {
      const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    }

    function createKeyPreview(key: string): string {
      if (key.length < 8) return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
      return key.substring(0, 4) + '\u2022\u2022\u2022\u2022' + key.substring(key.length - 4);
    }

    export class ApiKeyService {
      async getUserApiKeys(userId: string): Promise<UserApiKey[]> {
        const params = {
          TableName: TABLE_NAME,
          IndexName: 'user_id-index',
          KeyConditionExpression: 'user_id = :uid and is_active = :active',
          ExpressionAttributeValues: {
            ':uid': userId,
            ':active': true,
          },
        };
        const result = await ddbDocClient.send(new QueryCommand(params));
        return (result.Items as UserApiKey[]) || [];
      }

      async createApiKey(userId: string, name: string, provider: string, key: string): Promise<UserApiKey> {
        const encryptedKey = encryptApiKey(key);
        const keyPreview = createKeyPreview(key);
        const apiKey: UserApiKey = {
          id: crypto.randomUUID(),
          user_id: userId,
          name,
          provider: provider as any,
          encrypted_key: encryptedKey,
          key_preview: keyPreview,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        await ddbDocClient.send(new PutCommand({ TableName: TABLE_NAME, Item: apiKey }));
        return apiKey;
      }

      async deleteApiKey(userId: string, keyId: string): Promise<void> {
        // Soft delete: set is_active to false
        const params = {
          TableName: TABLE_NAME,
          Key: { id: keyId },
          UpdateExpression: 'set is_active = :inactive',
          ExpressionAttributeValues: { ':inactive': false },
        };
        await ddbDocClient.send(new UpdateCommand(params));
      }

      async getDecryptedKey(userId: string, keyId: string): Promise<string | null> {
        const params = {
          TableName: TABLE_NAME,
          Key: { id: keyId },
        };
        const result = await ddbDocClient.send(new GetCommand(params));
        const item = result.Item as UserApiKey | undefined;
        if (!item || !item.is_active || item.user_id !== userId) return null;
        try {
          return decryptApiKey(item.encrypted_key);
        } catch {
          return null;
        }
      }
    }

    export const apiKeyService = new ApiKeyService();
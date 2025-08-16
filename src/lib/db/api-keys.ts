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
    // TODO: Implement AWS DynamoDB logic here if needed, using ddbDocClient and AWS SDK imports at the top level.
    // This function should not contain import or export statements.
    throw new Error('Not implemented: createApiKey');
  }

  async deleteApiKey(userId: string, apiKeyId: string): Promise<void> {
    // Stub: pretend to delete the API key
    return;
  }
}

export const apiKeyService = new ApiKeyService();
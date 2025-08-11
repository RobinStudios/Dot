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
    const encryptedKey = encryptApiKey(key);
    const keyPreview = createKeyPreview(key);

    const { data, error } = await db
      .from('user_api_keys')
      .insert({
        user_id: userId,
        name,
        provider,
        encrypted_key: encryptedKey,
        key_preview: keyPreview,
        is_active: true
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteApiKey(userId: string, keyId: string): Promise<void> {
    const { error } = await db
      .from('user_api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  async getDecryptedKey(userId: string, keyId: string): Promise<string | null> {
    const { data, error } = await db
      .from('user_api_keys')
      .select('encrypted_key')
      .eq('id', keyId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    
    try {
      return decryptApiKey(data.encrypted_key);
    } catch {
      return null;
    }
  }
}

export const apiKeyService = new ApiKeyService();
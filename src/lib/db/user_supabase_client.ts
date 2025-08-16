import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/utils/crypto';

// This function retrieves and decrypts user credentials, then returns a Supabase client for that user
export function getUserSupabaseClient(userId: string, userSupabaseCreds: Record<string, { url: string; key: string }>): SupabaseClient | null {
  const creds = userSupabaseCreds[userId];
  if (!creds) return null;
  const url = decrypt(creds.url);
  const key = decrypt(creds.key);
  return createClient(url, key);
}

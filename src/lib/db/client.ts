// Cognito/AWS is the main backend and authentication provider.
// Supabase client is provided for user deployment/export only.
import { createClient } from '@supabase/supabase-js';

export const getSupabaseClient = (url: string, key: string) => createClient(url, key);
// Supabase logic removed. Use AWS/DynamoDB client here if needed.
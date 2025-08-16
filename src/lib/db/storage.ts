import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function uploadUserFile(userId: string, file: File | Blob, fileName: string) {
  const path = `${userId}/${fileName}`;
  const { data, error } = await supabase.storage.from('user-files').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function listUserFiles(userId: string) {
  const { data, error } = await supabase.storage.from('user-files').list(userId);
  if (error) throw new Error(error.message);
  return data;
}

export async function downloadUserFile(userId: string, fileName: string) {
  const path = `${userId}/${fileName}`;
  const { data, error } = await supabase.storage.from('user-files').download(path);
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUserFile(userId: string, fileName: string) {
  const path = `${userId}/${fileName}`;
  const { error } = await supabase.storage.from('user-files').remove([path]);
  if (error) throw new Error(error.message);
  return true;
}

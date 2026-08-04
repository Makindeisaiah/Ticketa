import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getInitialUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  if (envUrl && envUrl !== 'https://placeholder.supabase.co') return envUrl;
  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('tix_supabase_url') : null;
  return storedUrl || 'https://placeholder.supabase.co';
};

const getInitialKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envKey && envKey !== 'placeholder-anon-key') return envKey;
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('tix_supabase_anon_key') : null;
  return storedKey || 'placeholder-anon-key';
};

export let supabaseUrl = getInitialUrl();
export let supabaseAnonKey = getInitialKey();

export let supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const isSupabaseConfigured = (): boolean => {
  const url = getInitialUrl();
  const key = getInitialKey();
  return Boolean(
    url && 
    key && 
    url !== 'https://placeholder.supabase.co' && 
    key !== 'placeholder-anon-key'
  );
};

export const configureSupabase = (url: string, key: string) => {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('tix_supabase_url', cleanUrl);
    localStorage.setItem('tix_supabase_anon_key', cleanKey);
  }
  supabaseUrl = cleanUrl;
  supabaseAnonKey = cleanKey;
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};


import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    (import.meta as any).env?.VITE_SUPABASE_URL && 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY &&
    (import.meta as any).env?.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};

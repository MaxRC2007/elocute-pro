// Lazy-loaded Supabase client wrapper to ensure environment variables are loaded
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

let supabaseInstance: SupabaseClient<Database> | null = null;

export const getSupabase = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error('Supabase environment variables:', {
      url: SUPABASE_URL,
      key: SUPABASE_PUBLISHABLE_KEY ? 'exists' : 'missing'
    });
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  supabaseInstance = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });

  return supabaseInstance;
};

// Export a getter for backward compatibility
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get: (target, prop) => {
    const client = getSupabase();
    return (client as any)[prop];
  }
});

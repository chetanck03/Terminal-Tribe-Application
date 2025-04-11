import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log a more user-friendly message instead of crashing the app
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

// Create a working client even if credentials are missing
// This will allow the app to function in development with mock data if needed
const createSupabaseClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Return a mock client with methods that return empty data but don't crash
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        updateUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null })
      },
      storage: {
        getBucket: async () => ({ data: null, error: new Error('Supabase not configured') }),
        createBucket: async () => ({ data: null, error: new Error('Supabase not configured') }),
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }),
          limit: () => ({ data: [], error: null }) }),
        update: () => ({ eq: async () => ({ data: null, error: new Error('Supabase not configured') }) }),
        upsert: async () => ({ data: null, error: new Error('Supabase not configured') })
      })
    };
  }
};

export const supabase = createSupabaseClient(); 
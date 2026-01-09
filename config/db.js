import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.DB_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing DB_URL environment variable');
}

if (!supabaseKey && !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY environment variable');
}

// Create Supabase client for general operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseKey || supabaseServiceKey);

// Create Supabase client for admin operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Database connection error:', err.message);
    return false;
  }
};

export default supabase;

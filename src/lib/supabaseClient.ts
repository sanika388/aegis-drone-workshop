import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fjmjxgrlzmzvseemqlya.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_23w6uo0Fhj9dZFFHqLxVXA_FlHulfIM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseInstance: any = null;

export const supabase = supabaseInstance || (supabaseInstance = createClient(supabaseUrl, supabaseAnonKey));

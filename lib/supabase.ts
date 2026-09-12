import { createBrowserClient } from '@supabase/ssr';

// Singleton — one client, one place. Cookie-based (not localStorage),
// so server-side API routes can read the same session the browser has.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
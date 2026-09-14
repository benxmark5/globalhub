// lib/supabase-server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Returns a Supabase client bound to the request cookies.
 * Use this in API routes / server components to read the authenticated user.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Route handlers can't write cookies here — safe to no-op.
          // Session refresh happens in middleware or client-side.
        },
      },
    }
  );
}

/**
 * Returns the authenticated user or null.
 * Also returns the user id when authed, for convenience.
 */
export async function getAuthUser(): Promise<
  { user: { id: string; email?: string | null } } | { user: null; error: string }
> {
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: error?.message || 'Not authenticated' };
  }

  return { user: { id: user.id, email: user.email ?? null } };
}
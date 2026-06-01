"use client";
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useAuth() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { full_name?: string; avatar_url?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
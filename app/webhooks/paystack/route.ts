export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Get keys safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize client ONLY if keys exist, preventing build-time execution failure
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;

export async function POST(req: Request) {
  try {
    // Safety check inside the handler execution block
    if (!supabase) {
      console.error("Supabase client failed to initialize due to missing environment keys.");
      return new NextResponse('Configuration Error', { status: 500 });
    }

    const rawBody = await req.text();
    
    // ... REST OF YOUR WEBHOOK CODE STAYS EXACTLY THE SAME ...
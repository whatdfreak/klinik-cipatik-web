/**
 * lib/supabase.ts — Centralized Supabase Client Singletons
 *
 * Two clients exported:
 * - `supabase`      → Public (Anon Key). Respects RLS. For public-facing reads.
 * - `supabaseAdmin` → Service Role. Bypasses RLS. For server-side API routes only.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabase';          // public reads
 *   import { supabaseAdmin } from '@/lib/supabase';     // admin/server ops
 */
import { createClient } from '@supabase/supabase-js';

// ── Public Client (Anon Key — respects RLS) ────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Admin Client (Service Role — bypasses RLS) ─────────────────────────────
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
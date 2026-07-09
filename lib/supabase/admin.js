import { createClient } from '@supabase/supabase-js';

let _admin = null;
export function createSupabaseAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[Supabase Admin] Missing env vars NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Database operations will be skipped.');
    // Return a no-op proxy so callers don't crash
    return {
      from: () => ({
        insert: async () => ({ error: new Error('Supabase not configured') }),
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      }),
    };
  }
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

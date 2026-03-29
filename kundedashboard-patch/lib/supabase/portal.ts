import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Læser data fra kundeportalen – bruger service role til at omgå RLS
export function createPortalAdminClient() {
  return createSupabaseClient(
    process.env.PORTAL_SUPABASE_URL!,
    process.env.PORTAL_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

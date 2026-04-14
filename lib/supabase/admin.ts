import { createClient } from '@supabase/supabase-js'

// Admin client — uses the secret key. Only used in server-side API routes.
// Never expose this on the frontend.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

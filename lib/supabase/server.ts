// Server-side Supabase client (simplified for Next.js Lite)
// Using the same client as browser for compatibility

import { supabase } from "./client"

export async function getSupabaseServerClient() {
  return supabase
}

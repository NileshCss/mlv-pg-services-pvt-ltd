/**
 * Convenience re-export of the Supabase browser client.
 * Use this for all client-side data fetching.
 */
import { createClient as _createClient } from '@/lib/supabase/client'

export const supabase = _createClient()

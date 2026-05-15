import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (serviceKey && url) return createServiceClient(url, serviceKey)
  return null
}

// GET /api/notices/all — admin: fetch ALL notices (active + inactive)
export async function GET() {
  try {
    const client = getServiceClient() || await createServerClient()
    const { data, error } = await client
      .from('notices')
      .select('*')
      .order('order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[notices/all GET]', err)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data, error } = await supabase.rpc('mark_overdue_installments')
    if (error) throw error

    return NextResponse.json({ success: true, affected: data })
  } catch (err: any) {
    console.error('[mark-overdue]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

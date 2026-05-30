import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/applications/track?id=MLV-2026-XXXXX
// Public endpoint — no auth required

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')?.trim().toUpperCase()

    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 })
    }

    const supabase = getServiceClient()

    const { data: app, error } = await supabase
      .from('pre_registrations')
      .select(
        'application_id, full_name, email, phone, college_name, course, ' +
        'room_preference, check_in_date, status, deposit_status, ' +
        'deposit_payment_id, deposit_paid_at, otp_verified, ' +
        'created_at, gender, food_preference'
      )
      .eq('application_id', id)
      .single()

    if (error || !app) {
      return NextResponse.json(
        { error: 'Application not found. Please check your Application ID.' },
        { status: 404 }
      )
    }

    // Map DB status to display stage key
    const STATUS_STAGE_MAP: Record<string, string> = {
      new: 'submitted',
      otp_verified: 'otp_verified',
      deposit_paid: 'deposit_paid',
      under_review: 'under_review',
      room_allocated: 'room_allocated',
      confirmed: 'checked_in',
      rejected: 'submitted',
    }

    const stage = STATUS_STAGE_MAP[(app as unknown as Record<string, string>).status] || 'submitted'

    return NextResponse.json({
      ...(app as unknown as Record<string, unknown>),
      stage,
    })
  } catch (err: unknown) {
    console.error('Track application error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

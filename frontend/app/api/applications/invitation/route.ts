import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// ── GET /api/applications/invitation — fetch invitation by token ──────
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const { data: invitation, error } = await adminClient
      .from('resident_invitations')
      .select('*, buildings(name, code), rooms(room_number, floor, type)')
      .eq('token', token)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invitation not found or invalid token' }, { status: 404 })
    }

    // Check expiration
    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json({ error: 'Invitation link has expired' }, { status: 400 })
    }

    // Check if already active/used
    if (invitation.status === 'active') {
      return NextResponse.json({ error: 'This invitation has already been used and activated' }, { status: 400 })
    }

    return NextResponse.json({ data: invitation }, { status: 200 })
  } catch (err: any) {
    console.error('[applications invitation GET]', err)
    return NextResponse.json({ error: 'Failed to process invitation check' }, { status: 500 })
  }
}

// ── POST /api/applications/invitation/submit — submit resident profile ──────
export async function POST(request: NextRequest) {
  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { token, profileData } = body

    if (!token || !profileData) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Fetch invitation to check validity and state
    const { data: invitation, error: fetchErr } = await adminClient
      .from('resident_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchErr || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (new Date() > new Date(invitation.expires_at)) {
      return NextResponse.json({ error: 'Invitation link has expired' }, { status: 400 })
    }

    if (invitation.status === 'active') {
      return NextResponse.json({ error: 'This invitation has already been activated' }, { status: 400 })
    }

    // 2. Prevent duplicate active students using this email or phone
    const { data: duplicates } = await adminClient
      .from('students')
      .select('id')
      .or(`email.eq.${invitation.email.trim().toLowerCase()},mobile.eq.${invitation.phone.trim()}`)
      .limit(1)

    if (duplicates && duplicates.length > 0) {
      return NextResponse.json({ error: 'A resident with this email or phone is already active in the system' }, { status: 400 })
    }

    // 3. Save profile data and update invitation status to 'profile_submitted'
    const { error: updateErr } = await adminClient
      .from('resident_invitations')
      .update({
        status: 'profile_submitted',
        profile_data: profileData,
        updated_at: new Date().toISOString()
      })
      .eq('token', token)

    if (updateErr) throw updateErr

    // 4. Create admin audit log or dashboard notice (optional but beautiful)
    console.log(`[AUDIT] Existing resident registration submitted for approval: ${invitation.full_name} (${invitation.email})`)

    return NextResponse.json({
      success: true,
      message: 'Profile submitted successfully! Awaiting admin verification.'
    }, { status: 200 })

  } catch (err: any) {
    console.error('[applications invitation submit POST]', err)
    return NextResponse.json({ error: err.message || 'Failed to submit registration' }, { status: 500 })
  }
}

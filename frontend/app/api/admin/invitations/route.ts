import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function getCallerSession() {
  try {
    const serverClient = await createServerClient()
    const { data: { session } } = await serverClient.auth.getSession()
    return session
  } catch {
    return null
  }
}

// ── GET /api/admin/invitations — list all invitations ──────
export async function GET(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use admin service client to bypass RLS — admin should always see all invitations
  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const { data, error } = await adminClient
      .from('resident_invitations')
      .select('*, buildings(name, code), rooms(room_number, type)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[admin invitations GET] Supabase error:', error)
      throw error
    }

    return NextResponse.json({ data: data || [] }, { status: 200 })
  } catch (err: any) {
    console.error('[admin invitations GET]', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch invitations' }, { status: 500 })
  }
}


// ── POST /api/admin/invitations — create an invitation ──────
export async function POST(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const {
      studentName,
      phone,
      email,
      buildingId,
      roomId,
      floorNumber,
      joiningDate
    } = body

    if (!studentName || !phone || !email || !buildingId || !roomId || !joiningDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Check if an active student or invitation already exists with this phone or email
    const { data: existingStudent } = await adminClient
      .from('students')
      .select('id, email, mobile')
      .or(`email.eq.${email.trim().toLowerCase()},mobile.eq.${phone.trim()}`)
      .limit(1)

    if (existingStudent && existingStudent.length > 0) {
      return NextResponse.json({ error: 'A resident with this email or phone number is already registered' }, { status: 400 })
    }

    // 2. Generate secure unique token (hex format) and 7-day expiry
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // 3. Create the invitation record
    const { data: invitation, error: inviteError } = await adminClient
      .from('resident_invitations')
      .insert({
        token,
        full_name: studentName,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        building_id: buildingId,
        room_id: roomId,
        floor_number: floorNumber ? parseInt(floorNumber) : null,
        joining_date: joiningDate,
        status: 'invited',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (inviteError) throw inviteError

    // 4. Generate the registration link
    const origin = request.nextUrl.origin || 'https://mlvpg.com'
    const registrationLink = `${origin}/existing-resident-registration?token=${token}`

    // 5. Mock dispatches to console logs (as requested)
    console.log('\n--- EMAIL INVITE DISPATCH ---')
    console.log(`To: ${email}`)
    console.log(`Subject: Complete Your MLV PG Student Registration`)
    console.log(`Body:\nHello ${studentName},\n\nYou have been invited to activate your MLV PG Student Dashboard.\n\nPlease complete your registration using the link below:\n\n${registrationLink}\n\nAfter submission, our admin team will verify your details and activate your account.\n\nRegards,\nMLV PG Services`)
    console.log('-----------------------------\n')

    console.log('\n--- WHATSAPP INVITE DISPATCH ---')
    console.log(`To: ${phone}`)
    console.log(`Body:\nHello ${studentName},\n\nWelcome to MLV PG Services.\n\nPlease complete your registration using the link below:\n\n${registrationLink}\n\nOnce approved, you will receive your student dashboard credentials.\n\nRegards,\nMLV PG Services`)
    console.log('--------------------------------\n')

    return NextResponse.json({
      success: true,
      invitation,
      registrationLink
    }, { status: 201 })

  } catch (err: any) {
    console.error('[admin invitations POST]', err)
    return NextResponse.json({ error: err.message || 'Failed to generate invitation' }, { status: 500 })
  }
}

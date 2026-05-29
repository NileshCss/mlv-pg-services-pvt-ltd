import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

// ── GET /api/admin/students — list all students with room & bed info ──────
export async function GET(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('students')
      .select('*, rooms(room_number, floor, type), beds(bed_number), fees(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data }, { status: 200 })
  } catch (err: any) {
    console.error('[admin students GET]', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch students' }, { status: 500 })
  }
}

// ── POST /api/admin/students — convert applicant to resident ──────────────
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
      preRegistrationId,
      roomId,
      bedId,
      monthlyAmount,
      securityDeposit,
      planType,
      joiningDate,
      agreementEndDate,
      temporaryPassword
    } = body

    if (!preRegistrationId || !roomId || !bedId || !monthlyAmount || !joiningDate || !agreementEndDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Fetch pre-registration data
    const { data: applicant, error: appError } = await adminClient
      .from('pre_registrations')
      .select('*')
      .eq('id', preRegistrationId)
      .single()

    if (appError || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    // 2. Generate a unique sequential Student ID (e.g. MLV-STU-0001)
    const { count, error: countError } = await adminClient
      .from('students')
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError
    const nextNum = (count || 0) + 1
    const studentIdStr = `MLV-STU-${String(nextNum).padStart(4, '0')}`

    // 3. Create student Auth user account in Supabase Auth
    const email = applicant.email.trim().toLowerCase()
    const pw = temporaryPassword || `MlvPgStudent_${Math.floor(1000 + Math.random() * 9000)}!`

    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: pw,
      email_confirm: true,
      user_metadata: {
        full_name: applicant.full_name,
        role: 'student'
      },
      app_metadata: {
        role: 'student'
      }
    })

    if (authError) {
      return NextResponse.json({ error: `Auth account creation failed: ${authError.message}` }, { status: 500 })
    }

    const userId = authUser.user.id

    // 4. Create record in students table
    const { data: student, error: studentError } = await adminClient
      .from('students')
      .insert({
        user_id: userId,
        application_id: applicant.application_id || null,
        student_id: studentIdStr,
        full_name: applicant.full_name,
        email: email,
        mobile: applicant.phone,
        college_name: applicant.college_name,
        course: applicant.course,
        year_of_study: applicant.year_of_study || '1st Year',
        parent_name: applicant.parent_name || '—',
        parent_contact: applicant.parent_contact,
        permanent_address: applicant.permanent_address || '—',
        emergency_contact: applicant.emergency_contact || '—',
        nationality: applicant.nationality || 'Indian',
        gender: applicant.gender,
        room_id: roomId,
        bed_id: bedId,
        joining_date: joiningDate,
        agreement_end_date: agreementEndDate,
        is_active: true
      })
      .select()
      .single()

    if (studentError) {
      // Cleanup auth account on failure
      await adminClient.auth.admin.deleteUser(userId)
      throw studentError
    }

    // 5. Update Bed status to 'occupied'
    await adminClient
      .from('beds')
      .update({ status: 'occupied' })
      .eq('id', bedId)

    // 6. Create initial Fee schedule record
    await adminClient
      .from('fees')
      .insert({
        student_id: student.id,
        monthly_amount: parseFloat(monthlyAmount),
        security_deposit: parseFloat(securityDeposit || 0),
        security_deposit_paid: false,
        plan_type: planType || 'monthly'
      })

    // 7. Update pre_registrations status to 'converted'
    await adminClient
      .from('pre_registrations')
      .update({ status: 'converted' })
      .eq('id', preRegistrationId)

    // 8. Generate standard monthly installments for the duration of stay
    const start = new Date(joiningDate)
    const end = new Date(agreementEndDate)
    let instNo = 1
    const installmentsToInsert = []

    // Add security deposit as an installment or initial payment item
    
    // Loop month by month
    const current = new Date(start)
    while (current < end) {
      installmentsToInsert.push({
        student_id: student.id,
        fee_id: (await adminClient.from('fees').select('id').eq('student_id', student.id).single()).data?.id,
        installment_no: instNo++,
        due_date: current.toISOString().split('T')[0],
        amount: parseFloat(monthlyAmount),
        status: 'pending'
      })
      // Advance by 1 month
      current.setMonth(current.getMonth() + 1)
    }

    if (installmentsToInsert.length > 0) {
      await adminClient.from('installments').insert(installmentsToInsert)
    }

    return NextResponse.json({
      success: true,
      studentId: studentIdStr,
      email,
      temporaryPassword: pw
    }, { status: 201 })

  } catch (err: any) {
    console.error('[admin students POST]', err)
    return NextResponse.json({ error: err.message || 'Failed to process resident conversion' }, { status: 500 })
  }
}

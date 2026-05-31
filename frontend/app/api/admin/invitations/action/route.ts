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

// ── POST /api/admin/invitations/action — approve / reject invitations ──────
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
    const { invitationId, action, notes } = body

    if (!invitationId || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Fetch invitation
    const { data: invitation, error: inviteError } = await adminClient
      .from('resident_invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // 2. Handle Rejection
    if (action === 'reject') {
      const { error: rejectError } = await adminClient
        .from('resident_invitations')
        .update({ status: 'rejected', profile_data: invitation.profile_data ? { ...invitation.profile_data, admin_notes: notes || 'Rejected by admin' } : null })
        .eq('id', invitationId)

      if (rejectError) throw rejectError
      return NextResponse.json({ success: true, message: 'Invitation marked as rejected' })
    }

    // 3. Handle Request Changes
    if (action === 'request_changes') {
      const { error: changeError } = await adminClient
        .from('resident_invitations')
        .update({ status: 'invited', profile_data: invitation.profile_data ? { ...invitation.profile_data, admin_notes: notes || 'Changes requested by admin' } : null })
        .eq('id', invitationId)

      if (changeError) throw changeError
      return NextResponse.json({ success: true, message: 'Changes requested from student' })
    }

    // 4. Handle Approval
    if (action === 'approve') {
      if (invitation.status !== 'profile_submitted' || !invitation.profile_data) {
        return NextResponse.json({ error: 'Resident must submit their profile before approval' }, { status: 400 })
      }

      const pData = invitation.profile_data

      // A. Verify that email or phone is not already in use by active student
      const { data: duplicates } = await adminClient
        .from('students')
        .select('id')
        .or(`email.eq.${invitation.email.trim().toLowerCase()},mobile.eq.${invitation.phone.trim()}`)
        .limit(1)

      if (duplicates && duplicates.length > 0) {
        return NextResponse.json({ error: 'A resident with this email or phone is already registered in the system' }, { status: 400 })
      }

      // B. Allocate an available bed in the assigned room if database room exists
      // NOTE: If no beds are configured yet, we skip bed assignment (admin can assign later)
      let bedId = null
      if (invitation.room_id) {
        const { data: bedsList } = await adminClient
          .from('beds')
          .select('id, bed_number')
          .eq('room_id', invitation.room_id)
          .eq('status', 'available')
          .limit(1)

        if (bedsList && bedsList.length > 0) {
          bedId = bedsList[0].id
        } else {
          // Fallback: check if there are any beds at all in the room
          const { data: anyBeds } = await adminClient
            .from('beds')
            .select('id')
            .eq('room_id', invitation.room_id)
            .limit(1)
          if (anyBeds && anyBeds.length > 0) {
            bedId = anyBeds[0].id
          }
          // No beds configured — this is allowed, admin can set up beds later
        }
      }

      // C. Generate sequential Student ID: format MLV20260001, MLV20260002, etc.
      const { count, error: countError } = await adminClient
        .from('students')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError
      const nextNum = (count || 0) + 1
      const studentIdStr = `MLV2026${String(nextNum).padStart(4, '0')}`

      // D. Create student Auth user account in Supabase Auth using their password
      const email = invitation.email.trim().toLowerCase()
      const pw = pData.password || `MlvPgStudent_${Math.floor(1000 + Math.random() * 9000)}!`

      const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: pw,
        email_confirm: true,
        user_metadata: {
          full_name: invitation.full_name,
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

      // E. Calculate standard 11-month agreement end date from joining date
      const jDate = new Date(invitation.joining_date)
      const agreementEnd = new Date(jDate)
      agreementEnd.setMonth(agreementEnd.getMonth() + 11)
      const agreementEndDateStr = agreementEnd.toISOString().split('T')[0]

      // F. Determine manual building/room info for residents with no DB room assigned
      const manualBuildingName = pData.manualBuildingName || null
      const manualRoomNumber = pData.manualRoomNumber || null
      // Build a notes string that captures manual stay info if DB room is not assigned
      const manualStayNotes = (!invitation.room_id && (manualBuildingName || manualRoomNumber))
        ? `Building: ${manualBuildingName || 'N/A'} | Room: ${manualRoomNumber || 'N/A'}`
        : null

      // F. Create the record in students table
      const { data: student, error: studentError } = await adminClient
        .from('students')
        .insert({
          user_id: userId,
          student_id: studentIdStr,
          full_name: invitation.full_name,
          email: email,
          mobile: invitation.phone,
          college_name: pData.collegeName || '—',
          course: pData.course || '—',
          year_of_study: 'Existing Resident',
          parent_name: pData.parentName || '—',
          parent_contact: pData.parentContact || '—',
          permanent_address: pData.permanentAddress || '—',
          emergency_contact: `${pData.emergencyName || '—'} (${pData.emergencyRelationship || '—'})`,
          nationality: 'Indian',
          gender: pData.gender || 'Male',
          room_id: invitation.room_id || null,
          bed_id: bedId,
          joining_date: invitation.joining_date,
          agreement_end_date: agreementEndDateStr,
          profile_photo_url: pData.photoUrl || null,
          notes: manualStayNotes,
          is_active: true
        })
        .select()
        .single()

      if (studentError) {
        // Cleanup auth user on database failure
        await adminClient.auth.admin.deleteUser(userId)
        throw studentError
      }

      // G. Fetch room rent to set up fees
      let monthlyAmount = 8000
      if (invitation.room_id) {
        const { data: roomData } = await adminClient
          .from('rooms')
          .select('monthly_rent')
          .eq('id', invitation.room_id)
          .maybeSingle()
        if (roomData) {
          monthlyAmount = roomData.monthly_rent || 8000
        }
      }

      // H. Create initial Fee schedule record
      const { data: fee, error: feeError } = await adminClient
        .from('fees')
        .insert({
          student_id: student.id,
          monthly_amount: parseFloat(monthlyAmount.toString()),
          security_deposit: 5000, // standard deposit
          security_deposit_paid: true, // Mark paid since they are existing resident
          plan_type: 'monthly'
        })
        .select()
        .single()

      if (feeError) {
        console.error('[admin invitations action] Fee creation failed:', feeError)
        // Non-fatal — proceed without installments
      }

      // I. Generate monthly installments for the 11-month stay (only if fee was created)
      if (fee) {
        const start = new Date(invitation.joining_date)
        const end = agreementEnd
        let instNo = 1
        const installmentsToInsert = []

        const current = new Date(start)
        while (current < end) {
          installmentsToInsert.push({
            student_id: student.id,
            fee_id: fee.id,
            installment_no: instNo++,
            due_date: current.toISOString().split('T')[0],
            amount: parseFloat(monthlyAmount.toString()),
            status: 'pending'
          })
          current.setMonth(current.getMonth() + 1)
        }

        if (installmentsToInsert.length > 0) {
          await adminClient.from('installments').insert(installmentsToInsert)
        }
      }


      // J. Save Aadhaar and College ID into documents vault
      const docsToInsert = []
      if (pData.aadharUrl) {
        docsToInsert.push({
          student_id: student.id,
          doc_type: 'aadhar',
          file_url: pData.aadharUrl,
          file_name: 'Aadhaar Card.jpg',
          verified: true,
          verified_at: new Date().toISOString()
        })
      }
      if (pData.collegeIdUrl) {
        docsToInsert.push({
          student_id: student.id,
          doc_type: 'college_id',
          file_url: pData.collegeIdUrl,
          file_name: 'College ID.jpg',
          verified: true,
          verified_at: new Date().toISOString()
        })
      }
      if (docsToInsert.length > 0) {
        await adminClient.from('documents').insert(docsToInsert)
      }

      // K. Set Bed to occupied if database bed is allocated
      if (bedId) {
        await adminClient
          .from('beds')
          .update({ status: 'occupied' })
          .eq('id', bedId)
      }

      // L. Mark Invitation as active
      await adminClient
        .from('resident_invitations')
        .update({
          status: 'active',
          student_id: student.id
        })
        .eq('id', invitationId)

      // M. Simulated dispatches for active dashboard credentials
      const loginUrl = `${request.nextUrl.origin}/student-login`
      console.log('\n--- EMAIL ACTIVATION DISPATCH ---')
      console.log(`To: ${email}`)
      console.log(`Subject: Your MLV PG Student Portal is Active!`)
      console.log(`Body:\nHello ${invitation.full_name},\n\nYour MLV PG Student Dashboard is now active!\n\nYou can access your dashboard here: ${loginUrl}\n\nLogin Email: ${email}\nStudent ID: ${studentIdStr}\nPassword: [The password you configured]\n\nRegards,\nMLV PG Services`)
      console.log('---------------------------------\n')

      console.log('\n--- WHATSAPP ACTIVATION DISPATCH ---')
      console.log(`To: ${invitation.phone}`)
      console.log(`Body:\nHello ${invitation.full_name},\n\nYour MLV PG Student Dashboard has been activated!\n\nAccess dashboard: ${loginUrl}\nUser: ${email}\nID: ${studentIdStr}\n\nRegards,\nMLV PG Services`)
      console.log('------------------------------------\n')

      return NextResponse.json({
        success: true,
        studentId: studentIdStr,
        email
      }, { status: 200 })
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })

  } catch (err: any) {
    console.error('[admin invitations action POST]', err)
    return NextResponse.json({ error: err.message || 'Failed to execute invitation action' }, { status: 500 })
  }
}

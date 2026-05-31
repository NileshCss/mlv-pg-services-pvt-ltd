import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatchNotification } from '@/lib/admin/notifications'

// POST /api/auth/student/create-account
// Called by admin when converting an applicant to resident
// Creates Supabase Auth account + inserts student row + sends welcome email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      application_id,
      full_name,
      email,
      mobile,
      college_name,
      course,
      year_of_study,
      parent_name,
      parent_contact,
      permanent_address,
      emergency_contact,
      nationality,
      gender,
      room_id,
      bed_id,
      joining_date,
      agreement_end_date,
      monthly_amount,
      security_deposit,
      temp_password,
    } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Generate temporary password if not provided
    const password = temp_password || generateTempPassword()

    // Generate student ID: MLV-STU-XXXX
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true })
    const studentNum = String((count || 0) + 1).padStart(4, '0')
    const student_id = `MLV-STU-${studentNum}`

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'student' },
      user_metadata: { full_name, student_id },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 })
      }
      throw authError
    }

    // 2. Insert student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: authData.user.id,
        application_id: application_id || null,
        student_id,
        full_name,
        email,
        mobile: mobile || null,
        college_name: college_name || null,
        course: course || null,
        year_of_study: year_of_study || null,
        parent_name: parent_name || null,
        parent_contact: parent_contact || null,
        permanent_address: permanent_address || null,
        emergency_contact: emergency_contact || null,
        nationality: nationality || 'Indian',
        gender: gender || null,
        room_id: room_id || null,
        bed_id: bed_id || null,
        joining_date: joining_date || null,
        agreement_end_date: agreement_end_date || null,
        is_active: true,
      })
      .select()
      .single()

    if (studentError) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw studentError
    }

    // 3. Create fee record if monthly_amount is provided
    if (monthly_amount) {
      await supabase.from('fees').insert({
        student_id: student.id,
        monthly_amount: Number(monthly_amount),
        security_deposit: Number(security_deposit || 0),
        plan_type: 'monthly',
      })
    }

    // 4. Update bed status
    if (bed_id) {
      await supabase.from('beds').update({ status: 'occupied' }).eq('id', bed_id)
    }

    // 5. Update room status to occupied if all beds filled
    if (room_id) {
      const { count: totalBeds } = await supabase
        .from('beds').select('*', { count: 'exact', head: true }).eq('room_id', room_id)
      const { count: occupiedBeds } = await supabase
        .from('beds').select('*', { count: 'exact', head: true }).eq('room_id', room_id).eq('status', 'occupied')
      if (totalBeds && occupiedBeds && occupiedBeds >= totalBeds) {
        await supabase.from('rooms').update({ status: 'occupied' }).eq('id', room_id)
      }
    }

    // 6. Mark application as converted
    if (application_id) {
      await supabase
        .from('pre_registrations')
        .update({ status: 'confirmed' })
        .eq('application_id', application_id)
    }

    // 7. Send welcome email
    const welcomeHtml = `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1A1A2E;">
        <h2 style="color: #C9A84C; margin-bottom: 4px;">MLV PG Services</h2>
        <p style="color: #8A8AA0; font-size: 12px;">Premium Student PG, Bangalore</p>
        <hr style="border: 1px solid #EBEBF0; margin: 16px 0;" />
        <h3>Welcome to MLV PG, ${full_name}! 🎉</h3>
        <p>Your student account has been created. Here are your login credentials:</p>
        <div style="background: #F8F6F1; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #C9A84C;">
          <p><strong>Student ID:</strong> ${student_id}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Temporary Password:</strong> <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
        </div>
        <p>Please log in at <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://mlvpg.com'}/student-login" style="color: #C9A84C;">mlvpg.com/student-login</a> and change your password immediately.</p>
        <p style="color: #8A8AA0; font-size: 12px; margin-top: 24px;">MLV PG Services | Opposite Acharya Institute, Soladevanahalli, Bangalore</p>
      </div>
    `

    try {
      if (process.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MLV PG Services <noreply@mlvpg.com>',
            to: [email],
            subject: `Welcome to MLV PG — Your Login Credentials`,
            html: welcomeHtml,
          }),
        })
      } else {
        console.log(`[Welcome Email] To: ${email} | Student ID: ${student_id} | Temp Password: ${password}`)
      }
    } catch (emailErr) {
      console.warn('Welcome email send failed:', emailErr)
    }

    // 8. Audit log
    await supabase.from('audit_logs').insert({
      action: 'student_account_created',
      entity: 'students',
      entity_id: student.id,
      details: { student_id, email, room_id, bed_id },
    })

    // Trigger Admin/Student Notification for student check-in
    try {
      await dispatchNotification({
        title: 'Student Account Activated',
        message: `${full_name} has checked in and room allocated.`,
        type: 'student',
        priority: 'high',
        metadata: {
          student_name: full_name,
          student_id,
          email,
          phone: mobile || 'None',
          joining_date: joining_date || 'None',
          status: 'Check-In Active'
        }
      })
    } catch (notifErr: any) {
      console.warn('[Notification Error] Failed to dispatch check-in alert:', notifErr.message)
    }

    return NextResponse.json({
      success: true,
      student_id,
      student: student,
      temp_password: password,
    }, { status: 201 })
  } catch (err: any) {
    console.error('create-account error:', err)
    return NextResponse.json({ error: err.message || 'Failed to create student account' }, { status: 500 })
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

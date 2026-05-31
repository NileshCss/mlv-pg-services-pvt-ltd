import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatchNotification } from '@/lib/admin/notifications'

// POST /api/applications/submit
// Called after OTP verification to finalize application + send confirmation email

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateApplicationId(): string {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `MLV-${year}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      full_name,
      phone,
      email,
      gender,
      college_name,
      course,
      room_preference,
      check_in_date,
      parent_contact,
      food_preference,
      additional_notes,
      aadhar_url,
      photo_url,
      college_id_url,
    } = body

    // Validate required fields
    const required = ['full_name', 'phone', 'email', 'gender', 'college_name', 'course', 'room_preference', 'check_in_date', 'parent_contact', 'food_preference']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const supabase = getServiceClient()

    // ── Check if an application already exists for this email ──
    const { data: existing } = await supabase
      .from('pre_registrations')
      .select('application_id')
      .eq('email', email)
      .maybeSingle()

    let finalAppId: string

    const applicationPayload = {
      full_name,
      phone,
      email,
      gender,
      college_name,
      course,
      room_preference,
      check_in_date,
      parent_contact,
      food_preference,
      additional_notes: additional_notes || null,
      aadhar_url: aadhar_url || null,
      photo_url: photo_url || null,
      college_id_url: college_id_url || null,
      status: 'otp_verified',
      otp_verified: true,
      otp_verified_at: new Date().toISOString(),
      deposit_status: 'pending',
    }

    if (existing?.application_id) {
      // ── Already registered — update the existing record ──────
      finalAppId = existing.application_id
      const { error: updateError } = await supabase
        .from('pre_registrations')
        .update(applicationPayload)
        .eq('application_id', finalAppId)

      if (updateError) {
        console.error('Application update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    } else {
      // ── New applicant — generate unique ID and insert ─────────
      let applicationId = generateApplicationId()
      let attempts = 0
      while (attempts < 5) {
        const { data: idConflict } = await supabase
          .from('pre_registrations')
          .select('application_id')
          .eq('application_id', applicationId)
          .maybeSingle()
        if (!idConflict) break
        applicationId = generateApplicationId()
        attempts++
      }

      finalAppId = applicationId
      const { error: insertError } = await supabase
        .from('pre_registrations')
        .insert({ ...applicationPayload, application_id: finalAppId })

      if (insertError) {
        console.error('Application insert error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    // ── Send confirmation email ───────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mlvpg.com'
    const trackingUrl = `${siteUrl}/track-application?id=${finalAppId}`
    const slipUrl = `${siteUrl}/slip/${finalAppId}`

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; color: #1A1A2E;">
        <div style="background: linear-gradient(135deg, #1A1A2E, #2A2A4E); padding: 28px 32px; border-radius: 12px 12px 0 0;">
          <h2 style="color: #C9A84C; margin: 0 0 4px 0; font-size: 22px;">MLV PG Services</h2>
          <p style="color: #8A8AA0; font-size: 12px; margin: 0;">Premium Student PG · Near Acharya College, Bangalore</p>
        </div>
        <div style="border: 1px solid #EBEBF0; border-top: none; padding: 28px 32px; border-radius: 0 0 12px 12px;">
          <h3 style="margin-top: 0;">🎉 Application Received Successfully!</h3>
          <p>Dear <strong>${full_name}</strong>,</p>
          <p>Your application to MLV PG Services has been submitted. We are reviewing it and will contact you shortly.</p>

          <div style="background: #F8F6F1; border-left: 4px solid #C9A84C; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #8A8AA0; text-transform: uppercase; letter-spacing: 1px;">Application ID</p>
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #C9A84C; font-family: monospace;">${finalAppId}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #EBEBF0;">
              <td style="padding: 8px 0; color: #8A8AA0;">Room Preference</td>
              <td style="padding: 8px 0; font-weight: bold;">${room_preference}</td>
            </tr>
            <tr style="border-bottom: 1px solid #EBEBF0;">
              <td style="padding: 8px 0; color: #8A8AA0;">Expected Join Date</td>
              <td style="padding: 8px 0; font-weight: bold;">${check_in_date}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #8A8AA0;">Security Deposit</td>
              <td style="padding: 8px 0; font-weight: bold; color: #F59E0B;">₹5,000 — Pending</td>
            </tr>
          </table>

          <div style="background: #FEF9C3; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400E;">
              ⚠️ <strong>Important:</strong> Your seat will only be confirmed after security deposit payment of ₹5,000.
              Pay online at the link below or visit us in person.
            </p>
          </div>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background: #C9A84C; color: #1A1A2E; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              Track Application →
            </a>
            <a href="${slipUrl}" style="display: inline-block; padding: 12px 24px; background: white; border: 2px solid #C9A84C; color: #C9A84C; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
              Download Temp Slip
            </a>
          </div>

          <p style="margin-top: 28px; font-size: 13px; color: #8A8AA0;">
            Questions? Call us at <strong>+91 80963 0649</strong> or WhatsApp us.<br/>
            MLV PG Services | Opp. Acharya Institute, Soladevanahalli, Bangalore
          </p>
        </div>
      </div>
    `

    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key') {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MLV PG Services <noreply@mlvpg.com>',
            to: [email],
            subject: `Application Received — ${finalAppId} | MLV PG Services`,
            html: emailHtml,
          }),
        })
        if (!emailRes.ok) {
          const emailErr = await emailRes.text()
          console.warn('Resend email failed:', emailErr)
        }
      } else {
        console.log(`[Confirmation Email] To: ${email} | App ID: ${finalAppId} | Tracking: ${trackingUrl}`)
      }
    } catch (emailErr) {
      console.warn('Email send failed (non-critical):', emailErr)
    }

    // Trigger Admin Notification
    try {
      await dispatchNotification({
        title: 'Application Fully Submitted',
        message: `${full_name} has completed registration verification and is awaiting seat confirmation.`,
        type: 'registration',
        priority: 'high',
        metadata: {
          student_name: full_name,
          phone,
          email,
          college: college_name,
          course,
          room_preference,
          joining_date: check_in_date,
          application_id: finalAppId,
          status: 'OTP Verified'
        }
      })
    } catch (notifErr: any) {
      console.warn('[Notification Error] Failed to dispatch submit application alert:', notifErr.message)
    }

    return NextResponse.json(
      { success: true, application_id: finalAppId },
      { status: 201 }
    )
  } catch (err: unknown) {
    console.error('Application submit error:', err)
    const message = err instanceof Error ? err.message : 'Failed to submit application'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

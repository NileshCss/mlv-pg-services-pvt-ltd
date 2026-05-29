import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/auth/student/verify-otp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, purpose } = body

    if (!email || !otp || !purpose) {
      return NextResponse.json({ error: 'Email, OTP and purpose are required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find the latest valid OTP for this email + purpose
    const { data: token, error } = await supabase
      .from('otp_tokens')
      .select('*')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !token) {
      return NextResponse.json(
        { error: 'OTP has expired or is invalid. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check max attempts
    if (token.attempts >= token.max_attempts) {
      await supabase.from('otp_tokens').update({ used: true }).eq('id', token.id)
      return NextResponse.json(
        { error: 'Maximum attempts reached. Please request a new OTP.', attemptsLeft: 0 },
        { status: 400 }
      )
    }

    // Increment attempt counter first
    await supabase
      .from('otp_tokens')
      .update({ attempts: token.attempts + 1 })
      .eq('id', token.id)

    // Verify OTP
    if (token.otp_code !== otp) {
      const attemptsLeft = token.max_attempts - token.attempts - 1
      return NextResponse.json(
        { error: `Incorrect OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left.`, attemptsLeft },
        { status: 400 }
      )
    }

    // Mark as used
    await supabase.from('otp_tokens').update({ used: true }).eq('id', token.id)

    return NextResponse.json({ success: true, message: 'OTP verified successfully' })
  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

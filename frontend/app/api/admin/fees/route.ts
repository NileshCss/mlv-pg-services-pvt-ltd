import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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

// ── GET /api/admin/fees — fetch fee stats or all installments ─────────────
export async function GET(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createServerClient()
    
    // Fetch all installments with student names
    const { data: installments, error } = await supabase
      .from('installments')
      .select('*, students(full_name, student_id)')
      .order('due_date', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: installments }, { status: 200 })
  } catch (err: any) {
    console.error('[admin fees GET]', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch fee details' }, { status: 500 })
  }
}

// ── POST /api/admin/fees — record a manual payment receipt ────────────────
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
      studentId,
      installmentId,
      amount,
      paymentMode,
      transactionId,
      type,
      notes
    } = body

    if (!studentId || !amount || !paymentMode || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const nowStr = new Date().toISOString()

    // 1. Insert transaction into payments table
    const { data: payment, error: payError } = await adminClient
      .from('payments')
      .insert({
        student_id: studentId,
        installment_id: installmentId || null,
        amount: parseFloat(amount),
        payment_mode: paymentMode,
        transaction_id: transactionId || null,
        type: type,
        notes: notes || '',
        recorded_by: session.user.id,
        created_at: nowStr
      })
      .select()
      .single()

    if (payError) throw payError

    // 2. If it's a monthly installment, update installment status to 'paid'
    if (installmentId) {
      const { error: instError } = await adminClient
        .from('installments')
        .update({
          status: 'paid',
          paid_at: nowStr,
          receipt_url: `/receipts/${payment.id}` // Mock or reference URL
        })
        .eq('id', installmentId)

      if (instError) throw instError
    }

    // 3. If type is security deposit, update the main fees configuration
    if (type === 'security_deposit') {
      const { error: feeError } = await adminClient
        .from('fees')
        .update({
          security_deposit_paid: true,
          security_deposit_paid_at: nowStr,
          payment_mode: paymentMode
        })
        .eq('student_id', studentId)

      if (feeError) throw feeError
    }

    // 4. Update stay dates if type is renewal (handled in renewals workflow, but here for consistency)

    return NextResponse.json({ success: true, paymentId: payment.id }, { status: 201 })

  } catch (err: any) {
    console.error('[admin fees POST]', err)
    return NextResponse.json({ error: err.message || 'Failed to record fee payment' }, { status: 500 })
  }
}

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dispatchNotification } from '@/lib/admin/notifications'

// POST /api/payment/verify
// Verifies Razorpay HMAC signature, then records payment in Supabase

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      application_id,   // pre_registration application_id (for deposit payments)
      student_id,       // enrolled student UUID (for monthly/renewal payments)
      installment_id,   // optional, for installment payments
      payment_type,     // 'security_deposit' | 'monthly_fee' | 'renewal' | 'late_fee'
      amount,           // in INR
    } = await req.json()

    // ── 1. Verify Razorpay signature ────────────────────────
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    // ── 2. Record payment based on type ─────────────────────
    if (payment_type === 'security_deposit' && application_id) {
      // Update pre_registrations deposit status
      const { error: updateError } = await supabase
        .from('pre_registrations')
        .update({
          deposit_status: 'paid',
          deposit_payment_id: razorpay_payment_id,
          deposit_paid_at: new Date().toISOString(),
          status: 'deposit_paid',
        })
        .eq('application_id', application_id)

      if (updateError) {
        console.error('Deposit update error:', updateError)
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
      }

      // Trigger Admin Notification
      try {
        await dispatchNotification({
          title: 'Deposit Payment Verified',
          message: `Razorpay security deposit of ₹${amount} received from application ${application_id}.`,
          type: 'payment',
          priority: 'high',
          metadata: {
            application_id: application_id,
            amount: `₹${amount}`,
            payment_type: 'security_deposit',
            transaction_id: razorpay_payment_id,
            status: 'paid'
          }
        })
      } catch (notifErr: any) {
        console.warn('[Notification Error] Failed to dispatch deposit payment alert:', notifErr.message)
      }
    } else if (student_id) {
      // Record in payments table for enrolled students
      const paymentRecord: Record<string, unknown> = {
        student_id,
        amount: Number(amount),
        payment_mode: 'razorpay',
        transaction_id: razorpay_payment_id,
        type: payment_type === 'monthly_fee' ? 'monthly' : payment_type || 'other',
        payment_type,
        razorpay_order_id,
        razorpay_payment_id,
        status: 'paid',
        paid_at: new Date().toISOString(),
      }

      if (installment_id) {
        paymentRecord.installment_id = installment_id
        // Also mark the installment as paid
        await supabase
          .from('installments')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', installment_id)
      }

      const { error: payError } = await supabase.from('payments').insert(paymentRecord)

      if (payError) {
        console.error('Payment insert error:', payError)
        return NextResponse.json({ success: false, error: payError.message }, { status: 500 })
      }

      // Trigger Admin Notification
      try {
        await dispatchNotification({
          title: 'Payment Received',
          message: `Online payment of ₹${amount} recorded for student.`,
          type: 'payment',
          priority: payment_type === 'late_fee' ? 'medium' : 'high',
          metadata: {
            student_id,
            amount: `₹${amount}`,
            payment_type: payment_type || 'other',
            transaction_id: razorpay_payment_id,
            status: 'paid'
          }
        })
      } catch (notifErr: any) {
        console.warn('[Notification Error] Failed to dispatch student payment alert:', notifErr.message)
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Either application_id (for deposit) or student_id is required' },
        { status: 400 }
      )
    }

    // ── 3. Audit log ─────────────────────────────────────────
    try {
      await supabase.from('audit_logs').insert({
        action: 'payment_verified',
        entity: payment_type === 'security_deposit' ? 'pre_registrations' : 'payments',
        entity_id: application_id || student_id,
        details: {
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          payment_type,
        },
      })
    } catch {
      // Non-critical — don't fail if audit log fails
    }

    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
    })
  } catch (err: unknown) {
    console.error('Payment verify error:', err)
    const message = err instanceof Error ? err.message : 'Payment verification failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

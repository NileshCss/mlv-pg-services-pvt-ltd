import Razorpay from 'razorpay'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/payment/create-order
// Creates a Razorpay order server-side and returns the order ID

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await req.json()

    if (!amount || !receipt) {
      return NextResponse.json(
        { error: 'amount and receipt are required' },
        { status: 400 }
      )
    }

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
      return NextResponse.json(
        { error: 'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local' },
        { status: 503 }
      )
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert INR to paise
      currency,
      receipt,
      notes: notes || {},
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err: unknown) {
    console.error('Razorpay create-order error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create payment order'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

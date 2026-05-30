'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface RazorpayButtonProps {
  amount: number           // in INR (not paise)
  label: string
  receipt: string
  notes?: Record<string, string>
  onSuccess: (paymentId: string) => void
  onFailure?: (error: unknown) => void
  disabled?: boolean
  className?: string
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export default function RazorpayButton({
  amount,
  label,
  receipt,
  notes = {},
  onSuccess,
  onFailure,
  disabled = false,
  className = '',
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // 1. Create order server-side
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt, notes }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create payment order')
      }

      // 2. Load Razorpay checkout script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        throw new Error('Payment gateway failed to load. Please check your internet connection.')
      }

      // 3. Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'MLV PG Services Pvt Ltd',
        description: label,
        order_id: orderData.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // 4. Verify payment server-side
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                application_id: notes.type === 'security_deposit' ? receipt : undefined,
                student_id: notes.student_id || undefined,
                installment_id: notes.installment_id || undefined,
                payment_type: notes.type || 'security_deposit',
                amount,
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id)
            } else {
              throw new Error(verifyData.error || 'Payment verification failed')
            }
          } catch (verifyErr) {
            setError('Payment made but verification failed. Please contact support.')
            onFailure?.(verifyErr)
          }
        },
        prefill: {
          name: notes.name || '',
          email: notes.email || '',
          contact: notes.phone || '',
        },
        theme: { color: '#C9A84C' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.'
      setError(message)
      onFailure?.(err)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={loading || disabled}
        className={`relative h-12 px-6 rounded-full font-bold text-sm inline-flex items-center 
                   justify-center gap-2 transition-all duration-200 w-full
                   bg-[#C9A84C] hover:bg-[#b8963e] text-white
                   disabled:opacity-60 disabled:cursor-not-allowed
                   shadow-[0_4px_16px_rgba(201,168,76,0.35)] hover:shadow-[0_6px_20px_rgba(201,168,76,0.5)]
                   active:scale-[0.98] ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" />
            Processing…
          </>
        ) : (
          <>
            <span>💳</span>
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  )
}

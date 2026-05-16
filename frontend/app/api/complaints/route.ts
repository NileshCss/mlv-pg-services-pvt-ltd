import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || ''
  if (url && svcKey) return createServiceClient(url, svcKey)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createServiceClient(url, anonKey)
}

/** Auto-generate complaint ID: MLV-YYYY-NNNN */
function generateComplaintId(seq: number): string {
  const year = new Date().getFullYear()
  const pad  = String(seq).padStart(4, '0')
  return `MLV-${year}-${pad}`
}

/** Send WhatsApp notification via CallMeBot API */
async function sendWhatsAppNotification(complaint: {
  complaintId: string
  studentName: string
  roomNumber: string
  phone: string
  category: string
  urgency: string
  details: string
  createdAt: string
}) {
  const apiKey = process.env.CALLMEBOT_API_KEY
  const phone  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918809630649'

  const urgencyEmoji = complaint.urgency === 'high' ? '🔴' : complaint.urgency === 'medium' ? '🟡' : '🟢'
  const urgencyLabel = complaint.urgency === 'high' ? 'High / Urgent' : complaint.urgency === 'medium' ? 'Medium' : 'Low'

  const dateStr = new Date(complaint.createdAt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  })

  const message = `🚨 *New Complaint Received*

🆔 Complaint ID: ${complaint.complaintId}
👤 Student: ${complaint.studentName}
🏠 Room No: ${complaint.roomNumber}
📞 Phone: ${complaint.phone}
📋 Category: ${complaint.category}
${urgencyEmoji} Urgency: ${urgencyLabel}

💬 Details:
"${complaint.details.slice(0, 200)}${complaint.details.length > 200 ? '...' : ''}"

⏰ Submitted: ${dateStr}

👉 View Dashboard:
https://mlv-pg-services-pvt-ltd-frontend.vercel.app/admin/complaints`

  if (apiKey) {
    // CallMeBot API
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
    try {
      await fetch(url)
    } catch (err) {
      console.error('[WhatsApp CallMeBot]', err)
    }
  } else {
    // Fallback: log the WA URL (admin can click manually)
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    console.log('[WhatsApp Fallback - No CallMeBot key] URL:', waUrl)
  }
}

// ── GET /api/complaints — admin: list all complaints ──────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status   = searchParams.get('status')
    const category = searchParams.get('category')
    const urgency  = searchParams.get('urgency')
    const search   = searchParams.get('search')

    const client = getServiceClient()
    let query = client
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })

    if (status   && status   !== 'all') query = query.eq('status',   status)
    if (category && category !== 'all') query = query.eq('category', category)
    if (urgency  && urgency  !== 'all') query = query.eq('urgency',  urgency)
    if (search) {
      query = query.or(
        `student_name.ilike.%${search}%,room_number.ilike.%${search}%,complaint_id.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data, count }, { status: 200 })
  } catch (err) {
    console.error('[complaints GET]', err)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

// ── POST /api/complaints — public: submit a new complaint ─────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, roomNumber, phone, category, details, urgency, photoUrl } = body

    // Validate required fields
    if (!studentName?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!roomNumber?.trim())  return NextResponse.json({ error: 'Room number is required' }, { status: 400 })
    if (!phone?.trim())       return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    if (!category?.trim())    return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    if (!details?.trim() || details.trim().length < 20)
      return NextResponse.json({ error: 'Details must be at least 20 characters' }, { status: 400 })

    const client = getServiceClient()

    // Robust ID generation: get the highest existing sequence number from complaint_ids
    // This avoids duplicate key errors when records are deleted or simultaneous inserts happen
    const { data: lastComplaint } = await client
      .from('complaints')
      .select('complaint_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextSeq = 1
    if (lastComplaint?.complaint_id) {
      const parts = lastComplaint.complaint_id.split('-') // ['MLV', '2026', '0001']
      const lastNum = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(lastNum)) nextSeq = lastNum + 1
    }
    const complaintId = generateComplaintId(nextSeq)

    const now = new Date().toISOString()
    const { error } = await client
      .from('complaints')
      .insert({
        complaint_id:  complaintId,
        student_name:  studentName.trim(),
        room_number:   roomNumber.trim(),
        phone:         phone.trim(),
        category:      category.trim(),
        details:       details.trim(),
        urgency:       urgency || 'medium',
        status:        'pending',
        photo_url:     photoUrl || null,
        admin_notes:   '',
        created_at:    now,
        updated_at:    now,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Fire-and-forget WhatsApp notification
    sendWhatsAppNotification({
      complaintId,
      studentName:  studentName.trim(),
      roomNumber:   roomNumber.trim(),
      phone:        phone.trim(),
      category:     category.trim(),
      urgency:      urgency || 'medium',
      details:      details.trim(),
      createdAt:    now,
    }).catch(console.error)

    return NextResponse.json({ complaintId }, { status: 201 })
  } catch (err) {
    console.error('[complaints POST]', err)
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 })
  }
}

// ── PATCH /api/complaints — admin: update status + notes ─────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, adminNotes } = body

    if (!id) return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 })

    const client = getServiceClient()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (status     !== undefined) updates.status      = status
    if (adminNotes !== undefined) updates.admin_notes = adminNotes
    if (status === 'resolved')    updates.resolved_at = new Date().toISOString()

    const { data, error } = await client
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[complaints PATCH]', err)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}

// ── DELETE /api/complaints?id=xxx — admin: delete ─────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const client = getServiceClient()
    const { error } = await client.from('complaints').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[complaints DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 })
  }
}

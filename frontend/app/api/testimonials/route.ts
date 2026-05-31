import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { dispatchNotification } from '@/lib/admin/notifications'

// Actual Supabase schema for the testimonials table:
// id, created_at, updated_at, student_name, course, college_name,
// message, rating, image_url, is_approved, is_featured, college (legacy/unused)

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (serviceKey && url) {
    return createServiceClient(url, serviceKey)
  }
  return null
}

// POST /api/testimonials — public submit (is_approved: false, pending review)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { student_name, college, rating, review } = body

    if (!student_name?.trim() || !review?.trim()) {
      return NextResponse.json({ error: 'Name and review are required' }, { status: 400 })
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
    }

    const client = getServiceClient() || await createServerClient()

    // Map frontend fields to actual DB column names:
    // review  → message
    // college → college_name
    // status  → is_approved (boolean: false = pending)
    const { data, error } = await client
      .from('testimonials')
      .insert({
        student_name: student_name.trim(),
        college_name: college?.trim() || null,
        rating: Number(rating),
        message: review.trim(),
        is_approved: false,
        is_featured: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Trigger Admin Notification
    try {
      await dispatchNotification({
        title: 'New Student Review Submitted',
        message: `${student_name.trim()} has submitted a review with a rating of ${rating}/5.`,
        type: 'review',
        priority: rating <= 2 ? 'high' : 'medium',
        metadata: {
          student_name: student_name.trim(),
          college: college?.trim() || 'None',
          rating: `${rating}/5`,
          review_text: review.trim(),
          status: 'Pending Approval'
        }
      })
    } catch (notifErr: any) {
      console.warn('[Notification Error] Failed to dispatch review alert:', notifErr.message)
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/testimonials — public fetch
// ?featured=true  → all is_approved reviews, featured ones sorted first (limit 6)
// (no params)     → all is_approved reviews (limit 20)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forHomepage = searchParams.get('featured') === 'true'

    const client = getServiceClient() || await createServerClient()

    // Always filter by is_approved = true.
    // For the homepage we show up to 6 reviews, featuring ones first.
    // Simply approving a review in the admin is enough to make it appear.
    let query = client
      .from('testimonials')
      .select('id, created_at, student_name, course, college_name, message, rating, image_url, is_approved, is_featured')
      .eq('is_approved', true)
      .order('is_featured', { ascending: false })   // featured reviews bubble to top
      .order('created_at', { ascending: false })

    if (forHomepage) {
      query = query.limit(6)
    } else {
      query = query.limit(20)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize DB shape → frontend Testimonial interface
    const normalized = (data || []).map((row: any) => ({
      id: row.id,
      student_name: row.student_name,
      college: row.college_name || row.course || null,
      rating: row.rating,
      review: row.message,
      photo_url: row.image_url || null,
      status: 'approved',
      is_featured: row.is_featured,
      created_at: row.created_at,
    }))

    return NextResponse.json({ data: normalized }, { status: 200 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

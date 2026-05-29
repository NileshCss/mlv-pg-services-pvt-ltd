import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/testimonials?featured=true — public fetch approved+featured reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featuredOnly = searchParams.get('featured') === 'true'

    const client = getServiceClient() || await createServerClient()

    let query = client
      .from('testimonials')
      .select('id, created_at, student_name, course, college_name, message, rating, image_url, is_approved, is_featured')
      .order('created_at', { ascending: false })

    if (featuredOnly) {
      // Use is_approved (boolean) and is_featured — correct DB columns
      query = query.eq('is_featured', true).eq('is_approved', true).limit(6)
    } else {
      // Public listing: only return approved reviews
      query = query.eq('is_approved', true).limit(20)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize DB shape to the frontend Testimonial interface:
    // DB: message, college_name, is_approved  →  Frontend: review, college, status
    const normalized = (data || []).map((row: any) => ({
      id: row.id,
      student_name: row.student_name,
      college: row.college_name || row.course || null,
      rating: row.rating,
      review: row.message,
      photo_url: row.image_url || null,
      status: row.is_approved ? 'approved' : 'pending',
      is_featured: row.is_featured,
      created_at: row.created_at,
    }))

    return NextResponse.json({ data: normalized }, { status: 200 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

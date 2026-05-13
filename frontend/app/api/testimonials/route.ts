import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (serviceKey && url) {
    return createServiceClient(url, serviceKey)
  }
  return null
}

// POST /api/testimonials — public submit (status: pending)
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

    const { data, error } = await client
      .from('testimonials')
      .insert({
        student_name: student_name.trim(),
        college: college?.trim() || null,
        rating: Number(rating),
        review: review.trim(),
        status: 'pending',
        is_featured: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}

// GET /api/testimonials?featured=true — public fetch featured reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featuredOnly = searchParams.get('featured') === 'true'

    const client = getServiceClient() || await createServerClient()

    let query = client.from('testimonials').select('*').order('created_at', { ascending: false })

    if (featuredOnly) {
      query = query.eq('is_featured', true).eq('status', 'approved').limit(6)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

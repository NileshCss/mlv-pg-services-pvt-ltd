import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Use service client to bypass RLS for inserting anonymous forms
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Validate required fields
    const required = [
      'full_name',
      'phone',
      'email',
      'gender',
      'college_name',
      'course',
      'room_preference',
      'check_in_date',
      'parent_contact',
      'food_preference',
    ]

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('pre_registrations')
      .insert([
        {
          full_name: body.full_name,
          phone: body.phone,
          email: body.email,
          gender: body.gender,
          college_name: body.college_name,
          course: body.course,
          room_preference: body.room_preference,
          check_in_date: body.check_in_date,
          parent_contact: body.parent_contact,
          food_preference: body.food_preference,
          additional_notes: body.additional_notes || null,
          status: body.status || 'new',
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // TODO: Send admin notification email
    // TODO: Send confirmation email to user

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('pre_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

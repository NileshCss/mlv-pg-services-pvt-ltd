import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dispatchNotification } from '@/lib/admin/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Validate required fields
    const required = ['name', 'phone', 'email', 'subject', 'message']

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
      .from('contact')
      .insert([
        {
          name: body.name,
          phone: body.phone,
          email: body.email,
          subject: body.subject,
          message: body.message,
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

    // Trigger Admin Notification
    try {
      await dispatchNotification({
        title: 'New Contact Request Submitted',
        message: `${body.name} has submitted a new inquiry/contact request.`,
        type: 'contact',
        priority: 'medium',
        metadata: {
          visitor_name: body.name,
          phone: body.phone,
          email: body.email,
          subject: body.subject,
          message: body.message
        }
      })
    } catch (notifErr: any) {
      console.warn('[Notification Error] Failed to dispatch contact alert:', notifErr.message)
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('contact')
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
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (serviceKey && url) return createServiceClient(url, serviceKey)
  return null
}

async function getClient() {
  return getServiceClient() || await createServerClient()
}

// GET /api/notices — public fetch of all active notices
export async function GET() {
  try {
    const client = await getClient()
    const { data, error } = await client
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[notices GET]', err)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

// POST /api/notices — admin: create a new notice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, emoji, is_active, order } = body

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Notice text is required' }, { status: 400 })
    }

    const client = await getClient()
    const { data, error } = await client
      .from('notices')
      .insert({
        text: text.trim(),
        emoji: emoji?.trim() || '📢',
        is_active: is_active ?? true,
        order: order ?? 99,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[notices POST]', err)
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}

// PUT /api/notices — admin: update a notice
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, text, emoji, is_active, order } = body

    if (!id) return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 })

    const client = await getClient()
    const { data, error } = await client
      .from('notices')
      .update({
        text: text?.trim(),
        emoji: emoji?.trim(),
        is_active,
        order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('[notices PUT]', err)
    return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 })
  }
}

// DELETE /api/notices?id=xxx — admin: delete a notice
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 })

    const client = await getClient()
    const { error } = await client.from('notices').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[notices DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 })
  }
}

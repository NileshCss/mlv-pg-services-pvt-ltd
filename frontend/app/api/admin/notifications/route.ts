import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

async function getCallerSession() {
  try {
    const serverClient = await createServerClient()
    const { data: { session } } = await serverClient.auth.getSession()
    return session
  } catch {
    return null
  }
}

// ── GET /api/admin/notifications — fetch notifications log with filters & pagination ──────
export async function GET(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // category
    const priority = searchParams.get('priority')
    const readStatus = searchParams.get('readStatus') // 'unread', 'read', or 'all'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = adminClient
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply Filters
    if (type && type !== 'all') {
      query = query.eq('type', type)
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }
    if (readStatus === 'unread') {
      query = query.eq('read_status', false)
    } else if (readStatus === 'read') {
      query = query.eq('read_status', true)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`)
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    // Fetch unread count globally
    const { count: unreadCount } = await adminClient
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read_status', false)

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      unreadCount: unreadCount || 0,
      page,
      limit,
    }, { status: 200 })

  } catch (err: any) {
    console.error('[admin notifications GET]', err)
    return NextResponse.json({ error: err.message || 'Failed to fetch notifications' }, { status: 500 })
  }
}

// ── PATCH /api/admin/notifications — mark single or all notifications as read ──────
export async function PATCH(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { id, markAll } = body

    let query = adminClient.from('notifications').update({ read_status: true, updated_at: new Date().toISOString() })

    if (markAll) {
      // Mark all as read
      query = query.eq('read_status', false)
    } else if (id) {
      // Mark specific notification as read
      query = query.eq('id', id)
    } else {
      return NextResponse.json({ error: 'Parameters missing' }, { status: 400 })
    }

    const { data, error } = await query.select()
    if (error) throw error

    return NextResponse.json({ success: true, count: data?.length || 0 }, { status: 200 })

  } catch (err: any) {
    console.error('[admin notifications PATCH]', err)
    return NextResponse.json({ error: err.message || 'Failed to update notifications' }, { status: 500 })
  }
}

// ── DELETE /api/admin/notifications — delete single or bulk read logs ──────
export async function DELETE(request: NextRequest) {
  const session = await getCallerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = getAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearRead = searchParams.get('clearRead') === 'true'

    let query = adminClient.from('notifications').delete()

    if (clearRead) {
      // Clear all read notifications
      query = query.eq('read_status', true)
    } else if (id) {
      // Delete specific notification
      query = query.eq('id', id)
    } else {
      return NextResponse.json({ error: 'ID or clearRead query is required' }, { status: 400 })
    }

    const { error } = await query
    if (error) throw error

    return NextResponse.json({ success: true }, { status: 200 })

  } catch (err: any) {
    console.error('[admin notifications DELETE]', err)
    return NextResponse.json({ error: err.message || 'Failed to delete notifications' }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    const status   = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const search   = searchParams.get('search')
    const sortBy   = searchParams.get('sortBy')   || 'created_at'
    const sortOrder= searchParams.get('sortOrder') || 'desc'
    const page     = parseInt(searchParams.get('page')  || '1')
    const limit    = parseInt(searchParams.get('limit') || '25')
    const offset   = (page - 1) * limit

    let query = supabase.from('tickets').select('*', { count: 'exact' })

    if (status   && status   !== 'all') query = query.eq('status',   status)
    if (priority && priority !== 'all') query = query.eq('priority', priority)
    if (category && category !== 'all') query = query.eq('category', category)
    if (search?.trim()) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,` +
        `ticket_id.ilike.%${search}%,subject.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      tickets:    data,
      total:      count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const {
      customer_name, customer_email, subject, description,
      priority = 'Medium', category = 'General', assigned_to,
    } = body

    if (!customer_name || !customer_email || !subject || !description) {
      return NextResponse.json({ error: 'Missing required fields: customer_name, customer_email, subject, description' }, { status: 400 })
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Generate sequential ticket ID
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })

    const ticket_id = `TKT-${String((count || 0) + 1).padStart(3, '0')}`

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ticket_id,
        customer_name:  customer_name.trim(),
        customer_email: customer_email.trim().toLowerCase(),
        subject:        subject.trim(),
        description:    description.trim(),
        priority,
        category,
        assigned_to:    assigned_to?.trim() || null,
        status:         'Open',
      })
      .select()
      .single()

    if (error) throw error

    // Log creation activity
    await supabase.from('activity_log').insert({
      ticket_id:    data.ticket_id,
      action:       'ticket_created',
      new_value:    'Open',
      performed_by: 'Support Agent',
    })

    return NextResponse.json({
      ticket_id:  data.ticket_id,
      created_at: data.created_at,
      data,
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

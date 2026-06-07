import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', params.id)
      .single()

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const [{ data: notes }, { data: activity }] = await Promise.all([
      supabase.from('notes').select('*').eq('ticket_id', params.id).order('created_at', { ascending: false }),
      supabase.from('activity_log').select('*').eq('ticket_id', params.id).order('created_at', { ascending: false }),
    ])

    return NextResponse.json({ ...ticket, notes: notes || [], activity: activity || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { status, priority, category, assigned_to, note } = body

    const { data: current } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', params.id)
      .single()

    if (!current) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    const updates: Record<string, any> = {}
    const logs: any[] = []

    if (status && status !== current.status) {
      updates.status = status
      if (status === 'Resolved' || status === 'Closed') {
        updates.resolved_at = new Date().toISOString()
      }
      logs.push({ ticket_id: params.id, action: 'status_changed', old_value: current.status, new_value: status, performed_by: 'Support Agent' })
    }
    if (priority && priority !== current.priority) {
      updates.priority = priority
      logs.push({ ticket_id: params.id, action: 'priority_changed', old_value: current.priority, new_value: priority, performed_by: 'Support Agent' })
    }
    if (category && category !== current.category) {
      updates.category = category
      logs.push({ ticket_id: params.id, action: 'category_changed', old_value: current.category, new_value: category, performed_by: 'Support Agent' })
    }
    if (assigned_to !== undefined && assigned_to !== current.assigned_to) {
      updates.assigned_to = assigned_to || null
      logs.push({ ticket_id: params.id, action: 'assigned', old_value: current.assigned_to, new_value: assigned_to, performed_by: 'Support Agent' })
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('tickets').update(updates).eq('ticket_id', params.id)
      if (error) throw error
    }

    if (note?.trim()) {
      await supabase.from('notes').insert({ ticket_id: params.id, note_text: note.trim(), author: 'Support Agent' })
      logs.push({ ticket_id: params.id, action: 'note_added', new_value: note.trim().substring(0, 100), performed_by: 'Support Agent' })
    }

    if (logs.length > 0) await supabase.from('activity_log').insert(logs)

    const { data: updated } = await supabase.from('tickets').select('*').eq('ticket_id', params.id).single()

    return NextResponse.json({ success: true, updated_at: updated?.updated_at, data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

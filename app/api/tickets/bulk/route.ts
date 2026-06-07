import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { ticket_ids, status, priority, assigned_to } = await request.json()

    if (!ticket_ids?.length) return NextResponse.json({ error: 'ticket_ids required' }, { status: 400 })

    const updates: Record<string, any> = {}
    if (status) updates.status = status
    if (priority) updates.priority = priority
    if (assigned_to !== undefined) updates.assigned_to = assigned_to

    if ((status === 'Resolved' || status === 'Closed')) updates.resolved_at = new Date().toISOString()

    const { error } = await supabase.from('tickets').update(updates).in('ticket_id', ticket_ids)
    if (error) throw error

    await supabase.from('activity_log').insert(
      ticket_ids.map((id: string) => ({
        ticket_id: id, action: 'bulk_updated',
        new_value: Object.entries(updates).filter(([k]) => k !== 'resolved_at').map(([k,v]) => `${k}: ${v}`).join(', '),
        performed_by: 'Support Agent',
      }))
    )

    return NextResponse.json({ success: true, updated: ticket_ids.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: tickets } = await supabase
      .from('tickets')
      .select('status, priority, category, created_at, resolved_at')

    if (!tickets) return NextResponse.json({ error: 'No data' }, { status: 500 })

    const daily = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      daily.push({ date: dateStr, day: d.toLocaleDateString('en', { weekday: 'short' }), count: tickets.filter(t => t.created_at.startsWith(dateStr)).length })
    }

    const resolved = tickets.filter(t => t.resolved_at && t.created_at)
    const avgResolution = resolved.length === 0 ? 0 : Math.round(
      resolved.reduce((acc, t) => acc + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / 3600000, 0) / resolved.length
    )

    return NextResponse.json({
      total:       tickets.length,
      open:        tickets.filter(t => t.status === 'Open').length,
      in_progress: tickets.filter(t => t.status === 'In Progress').length,
      closed:      tickets.filter(t => t.status === 'Closed').length,
      resolved:    tickets.filter(t => t.status === 'Resolved').length,
      critical:    tickets.filter(t => t.priority === 'Critical').length,
      by_category: {
        Technical: tickets.filter(t => t.category === 'Technical').length,
        Billing:   tickets.filter(t => t.category === 'Billing').length,
        'Feature Request': tickets.filter(t => t.category === 'Feature Request').length,
        General:   tickets.filter(t => t.category === 'General').length,
        Bug:       tickets.filter(t => t.category === 'Bug').length,
      },
      by_priority: {
        Critical: tickets.filter(t => t.priority === 'Critical').length,
        High:     tickets.filter(t => t.priority === 'High').length,
        Medium:   tickets.filter(t => t.priority === 'Medium').length,
        Low:      tickets.filter(t => t.priority === 'Low').length,
      },
      daily_created:       daily,
      avg_resolution_hours: avgResolution,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { StatusBadge } from '@/components/tickets/StatusBadge'
import { PriorityBadge } from '@/components/tickets/PriorityBadge'
import { timeAgo } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { Ticket } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  const [{ data: allTickets }, { data: recent }] = await Promise.all([
    supabase.from('tickets').select('status, priority, category, created_at, resolved_at'),
    supabase.from('tickets').select('*').order('created_at', { ascending: false }).limit(6),
  ])

  const tickets = allTickets || []

  const stats = {
    total:       tickets.length,
    open:        tickets.filter(t => t.status === 'Open').length,
    in_progress: tickets.filter(t => t.status === 'In Progress').length,
    closed:      tickets.filter(t => t.status === 'Closed').length,
    resolved:    tickets.filter(t => t.status === 'Resolved').length,
    critical:    tickets.filter(t => t.priority === 'Critical').length,
  }

  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return {
      day:   d.toLocaleDateString('en', { weekday: 'short' }),
      count: tickets.filter(t => t.created_at.startsWith(dateStr)).length,
    }
  })

  const byCategory = {
    Technical:         tickets.filter(t => t.category === 'Technical').length,
    Billing:           tickets.filter(t => t.category === 'Billing').length,
    'Feature Request': tickets.filter(t => t.category === 'Feature Request').length,
    General:           tickets.filter(t => t.category === 'General').length,
    Bug:               tickets.filter(t => t.category === 'Bug').length,
  }

  const byPriority = {
    Critical: tickets.filter(t => t.priority === 'Critical').length,
    High:     tickets.filter(t => t.priority === 'High').length,
    Medium:   tickets.filter(t => t.priority === 'Medium').length,
    Low:      tickets.filter(t => t.priority === 'Low').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.open} open · {stats.critical > 0 ? `${stats.critical} critical · ` : ''}overview of all support activity
          </p>
        </div>
        <Link href="/tickets/new" className="btn-primary flex items-center gap-1.5">
          <Plus size={14} /> New Ticket
        </Link>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <DashboardCharts dailyData={dailyData} byCategory={byCategory} byPriority={byPriority} />

      {/* Recent tickets */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Tickets</h2>
          <Link href="/tickets" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(recent as Ticket[] || []).map(ticket => (
            <Link
              key={ticket.ticket_id}
              href={`/tickets/${ticket.ticket_id}`}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
            >
              <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 w-20 flex-shrink-0">
                {ticket.ticket_id}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {ticket.subject}
                </p>
                <p className="text-xs text-slate-400 truncate">{ticket.customer_name} · {ticket.customer_email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge   status={ticket.status}     />
                <PriorityBadge priority={ticket.priority} />
                <span className="text-xs text-slate-400 hidden sm:block w-20 text-right">{timeAgo(ticket.created_at)}</span>
              </div>
            </Link>
          ))}
          {(!recent || recent.length === 0) && (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400 text-sm">No tickets yet.</p>
              <Link href="/tickets/new" className="text-indigo-600 text-xs mt-1 inline-block hover:underline">Create your first ticket →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

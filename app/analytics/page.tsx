import { createClient } from '@/lib/supabase/server'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { Clock, TrendingUp, Star, Target } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = createClient()

  const { data: tickets } = await supabase
    .from('tickets')
    .select('status, priority, category, created_at, resolved_at, customer_email, ai_sentiment')

  const all = tickets || []

  // Last 30 days daily
  const daily30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    const dateStr = d.toISOString().split('T')[0]
    const label   = i % 5 === 0 ? d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''
    return { date: dateStr, label, count: all.filter(t => t.created_at.startsWith(dateStr)).length }
  })

  // Resolved with resolution time
  const resolvedTickets = all.filter(t => t.resolved_at && t.created_at)
  const resolutionTimes = resolvedTickets.map(t => ({
    hours: Math.round((new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime()) / 3600000),
    category: t.category,
  }))
  const avgResolutionHours = resolutionTimes.length > 0
    ? Math.round(resolutionTimes.reduce((a, r) => a + r.hours, 0) / resolutionTimes.length)
    : 0

  // Top customers by ticket count
  const emailCounts: Record<string, number> = {}
  all.forEach(t => { emailCounts[t.customer_email] = (emailCounts[t.customer_email] || 0) + 1 })
  const topCustomers = Object.entries(emailCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([email, count]) => ({ email, count }))

  // Sentiment breakdown
  const sentiments = ['Positive', 'Neutral', 'Frustrated', 'Angry']
  const sentimentData = sentiments.map(s => ({
    name:  s,
    count: all.filter(t => t.ai_sentiment === s).length,
  })).filter(x => x.count > 0)

  // Category breakdown with resolution rate
  const categoryStats = ['Technical','Billing','Feature Request','General','Bug'].map(cat => {
    const inCat   = all.filter(t => t.category === cat)
    const resolved = inCat.filter(t => t.status === 'Resolved' || t.status === 'Closed')
    return {
      name:           cat,
      total:          inCat.length,
      resolved:       resolved.length,
      resolution_pct: inCat.length > 0 ? Math.round((resolved.length / inCat.length) * 100) : 0,
    }
  }).filter(c => c.total > 0)

  const byPriority = {
    Critical: all.filter(t => t.priority === 'Critical').length,
    High:     all.filter(t => t.priority === 'High').length,
    Medium:   all.filter(t => t.priority === 'Medium').length,
    Low:      all.filter(t => t.priority === 'Low').length,
  }

  const openRate = all.length > 0 ? Math.round((all.filter(t => t.status === 'Open').length / all.length) * 100) : 0
  const resolveRate = all.length > 0 ? Math.round(((all.filter(t => t.status === 'Resolved' || t.status === 'Closed').length) / all.length) * 100) : 0

  const kpis = [
    { label: 'Avg Resolution Time', value: avgResolutionHours > 0 ? `${avgResolutionHours}h` : 'N/A', sub: 'from open to resolved', icon: Clock, color: 'text-indigo-500' },
    { label: 'Resolution Rate',     value: `${resolveRate}%`,  sub: 'tickets closed or resolved',       icon: Target,    color: 'text-emerald-500' },
    { label: 'Open Rate',           value: `${openRate}%`,     sub: 'tickets still open',              icon: TrendingUp, color: 'text-amber-500'  },
    { label: 'Total Volume',        value: all.length,          sub: 'tickets all time',                icon: Star,      color: 'text-violet-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Deep insights into your support operations.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <Icon size={18} className={`${color} mb-3`} />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts
        daily30={daily30}
        categoryStats={categoryStats}
        byPriority={byPriority}
        sentimentData={sentimentData}
        topCustomers={topCustomers}
      />
    </div>
  )
}

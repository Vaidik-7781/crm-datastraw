'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts'

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#EF4444', High: '#F97316', Medium: '#EAB308', Low: '#22C55E',
}
const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#22C55E', Neutral: '#94A3B8', Frustrated: '#F59E0B', Angry: '#EF4444',
}
const CAT_COLORS = ['#6366F1','#F59E0B','#10B981','#94A3B8','#EF4444']

const TT_STYLE = { background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }
const LABEL_STYLE = { color: '#CBD5E1' }

interface Props {
  daily30:       { date: string; label: string; count: number }[]
  categoryStats: { name: string; total: number; resolved: number; resolution_pct: number }[]
  byPriority:    Record<string, number>
  sentimentData: { name: string; count: number }[]
  topCustomers:  { email: string; count: number }[]
}

export function AnalyticsCharts({ daily30, categoryStats, byPriority, sentimentData, topCustomers }: Props) {
  const priorityBar = Object.entries(byPriority).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-4">
      {/* 30-day volume line chart */}
      <div className="card p-6">
        <h3 className="section-title mb-5">Ticket Volume — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={daily30}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94A3B8" interval={0} />
            <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" allowDecimals={false} />
            <Tooltip contentStyle={TT_STYLE} labelStyle={LABEL_STYLE} itemStyle={{ color: '#818CF8' }} />
            <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2.5}
              dot={false} activeDot={{ r: 5, fill: '#6366F1' }} name="Tickets" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category breakdown with resolution rate */}
        <div className="card p-6">
          <h3 className="section-title mb-5">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryStats} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94A3B8" allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#94A3B8" width={90} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={LABEL_STYLE}
                formatter={(v: any, n: string) => [v, n === 'total' ? 'Total' : 'Resolved']} />
              <Bar dataKey="total"    radius={[0,4,4,0]} name="Total"    fill="#E2E8F0" />
              <Bar dataKey="resolved" radius={[0,4,4,0]} name="Resolved" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {categoryStats.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{c.name}</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{c.resolution_pct}% resolved</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority distribution */}
        <div className="card p-6">
          <h3 className="section-title mb-5">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" allowDecimals={false} />
              <Tooltip contentStyle={TT_STYLE} labelStyle={LABEL_STYLE} />
              <Bar dataKey="value" radius={[4,4,0,0]} name="Tickets">
                {priorityBar.map(({ name }) => (
                  <Cell key={name} fill={PRIORITY_COLORS[name] || '#6366F1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment pie */}
        {sentimentData.length > 0 && (
          <div className="card p-6">
            <h3 className="section-title mb-5">AI Sentiment Analysis</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                    paddingAngle={3} dataKey="count">
                    {sentimentData.map(({ name }) => (
                      <Cell key={name} fill={SENTIMENT_COLORS[name] || '#6366F1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {sentimentData.map(({ name, count }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_COLORS[name] }} />
                      {name}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Based on AI-analyzed tickets. Run "Analyze with AI" on tickets to populate.
            </p>
          </div>
        )}

        {/* Top customers */}
        <div className="card p-6">
          <h3 className="section-title mb-5">Top Customers by Ticket Volume</h3>
          {topCustomers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map(({ email, count }, i) => {
                const pct = Math.round((count / (topCustomers[0]?.count || 1)) * 100)
                return (
                  <div key={email}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] font-medium">{email}</span>
                      <span className="font-bold text-slate-900 dark:text-white ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

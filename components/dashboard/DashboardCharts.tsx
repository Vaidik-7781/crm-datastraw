'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  Technical:        '#6366F1',
  Billing:          '#F59E0B',
  'Feature Request':'#10B981',
  General:          '#94A3B8',
  Bug:              '#EF4444',
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High:     '#F97316',
  Medium:   '#EAB308',
  Low:      '#22C55E',
}

interface Props {
  dailyData:   { day: string; count: number }[]
  byCategory:  Record<string, number>
  byPriority:  Record<string, number>
}

export function DashboardCharts({ dailyData, byCategory, byPriority }: Props) {
  const categoryPie = Object.entries(byCategory).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }))
  const priorityBar = Object.entries(byPriority).map(([name, value]) => ({ name, value }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Line chart: tickets per day */}
      <div className="card p-5 lg:col-span-2">
        <h3 className="section-title mb-4">Tickets This Week</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#CBD5E1' }}
              itemStyle={{ color: '#818CF8' }}
            />
            <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} activeDot={{ r: 5 }} name="Tickets" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart: by category */}
      <div className="card p-5">
        <h3 className="section-title mb-4">By Category</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
              {categoryPie.map(({ name }) => (
                <Cell key={name} fill={CATEGORY_COLORS[name] || '#6366F1'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#CBD5E1' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1">
          {categoryPie.map(({ name, value }) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[name] }} />
                {name}
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart: by priority */}
      <div className="card p-5 lg:col-span-3">
        <h3 className="section-title mb-4">By Priority</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={priorityBar} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" allowDecimals={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94A3B8" width={60} />
            <Tooltip
              contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: '#F1F5F9' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Tickets">
              {priorityBar.map(({ name }) => (
                <Cell key={name} fill={PRIORITY_COLORS[name] || '#6366F1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

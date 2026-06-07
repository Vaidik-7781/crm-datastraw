import { Ticket, AlertTriangle, Clock, CheckCircle, TrendingUp, Zap } from 'lucide-react'

interface Stats {
  total: number; open: number; in_progress: number
  closed: number; resolved: number; critical: number
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Total Tickets',
      value: stats.total,
      icon: Ticket,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/50',
    },
    {
      label: 'Open',
      value: stats.open,
      icon: AlertTriangle,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/50',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/50',
    },
    {
      label: 'Resolved',
      value: stats.resolved + stats.closed,
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
    {
      label: 'Critical',
      value: stats.critical,
      icon: Zap,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-100 dark:border-red-900/50',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div key={label} className={`card p-4 border ${border}`}>
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
            <Icon size={17} className={color} />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

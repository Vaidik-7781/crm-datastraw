import { ActivityLog } from '@/lib/types'
import { timeAgo, ACTION_LABELS, ACTION_ICONS } from '@/lib/utils'

export function ActivityTimeline({ activity }: { activity: ActivityLog[] }) {
  if (activity.length === 0) {
    return <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">No activity yet.</p>
  }

  return (
    <div className="space-y-3">
      {activity.map((log, i) => (
        <div key={log.id} className="flex gap-2.5">
          <div className="flex flex-col items-center">
            <span className="text-base leading-none">{ACTION_ICONS[log.action] ?? '📋'}</span>
            {i < activity.length - 1 && <div className="w-px flex-1 bg-slate-100 dark:bg-slate-800 mt-1.5" />}
          </div>
          <div className="flex-1 pb-3">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {ACTION_LABELS[log.action] ?? log.action}
            </p>
            {log.old_value && log.new_value && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                <span className="line-through">{log.old_value}</span>
                {' → '}
                <span className="text-indigo-500 font-medium">{log.new_value}</span>
              </p>
            )}
            {!log.old_value && log.new_value && (
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[160px]">{log.new_value}</p>
            )}
            <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
              {log.performed_by} · {timeAgo(log.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

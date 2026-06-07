import { PRIORITY_BG, PRIORITY_DOT } from '@/lib/utils'
import { TicketPriority } from '@/lib/types'

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BG[priority] || PRIORITY_BG['Medium']}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[priority] || 'bg-yellow-500'}`} />
      {priority}
    </span>
  )
}

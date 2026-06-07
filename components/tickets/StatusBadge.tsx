import { STATUS_BG } from '@/lib/utils'
import { TicketStatus } from '@/lib/types'

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BG[status] || STATUS_BG['Open']}`}>
      {status}
    </span>
  )
}

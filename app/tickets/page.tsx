import { TicketTable } from '@/components/tickets/TicketTable'

export const dynamic = 'force-dynamic'

export default function TicketsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">All Tickets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Search, filter, sort, and manage all support tickets.
        </p>
      </div>
      <TicketTable />
    </div>
  )
}

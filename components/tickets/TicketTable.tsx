'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/useDebounce'
import { Ticket } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { timeAgo, getSLAStatus, cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Search, Download, ChevronUp, ChevronDown,
  CheckSquare, Square, Minus, RefreshCw, ExternalLink,
} from 'lucide-react'

export function TicketTable() {
  const [tickets,    setTickets]    = useState<Ticket[]>([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('all')
  const [priority,   setPriority]   = useState('all')
  const [category,   setCategory]   = useState('all')
  const [sortBy,     setSortBy]     = useState('created_at')
  const [sortOrder,  setSortOrder]  = useState('desc')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkApplying, setBulkApplying] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const LIMIT = 25

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ search: debouncedSearch, status, priority, category, sortBy, sortOrder, page: String(page), limit: String(LIMIT) })
      const res  = await fetch(`/api/tickets?${q}`)
      const data = await res.json()
      setTickets(data.tickets || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, priority, category, sortBy, sortOrder, page])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortOrder('desc') }
    setPage(1)
  }

  const toggleSelect   = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const selectAll      = () => setSelected(tickets.map(t => t.ticket_id))
  const clearSelected  = () => setSelected([])

  const handleBulkUpdate = async () => {
    if (!bulkStatus || !selected.length) { toast.error('Select tickets and a status'); return }
    setBulkApplying(true)
    try {
      const res = await fetch('/api/tickets/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_ids: selected, status: bulkStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Updated ${selected.length} ticket${selected.length > 1 ? 's' : ''}`)
      clearSelected(); setBulkStatus(''); fetchTickets()
    } catch { toast.error('Bulk update failed') }
    finally { setBulkApplying(false) }
  }

  const handleExport = () => {
    const q = new URLSearchParams({ status, search: debouncedSearch })
    window.open(`/api/tickets/export?${q}`, '_blank')
  }

  const resetFilters = () => {
    setSearch(''); setStatus('all'); setPriority('all'); setCategory('all'); setPage(1)
  }

  const totalPages = Math.ceil(total / LIMIT)
  const allSelected = selected.length === tickets.length && tickets.length > 0
  const someSelected = selected.length > 0 && !allSelected

  const SortBtn = ({ col }: { col: string }) => (
    sortBy === col
      ? (sortOrder === 'asc' ? <ChevronUp size={12} className="text-indigo-500" /> : <ChevronDown size={12} className="text-indigo-500" />)
      : <ChevronUp size={12} className="text-slate-300 dark:text-slate-600" />
  )

  const SLABadge = ({ ticket }: { ticket: Ticket }) => {
    const sla = getSLAStatus(ticket.created_at, ticket.status)
    if (sla === 'overdue') return <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">⚠ Overdue</span>
    if (sla === 'warning') return <span className="text-[10px] text-amber-500 font-medium">⏱ 24h+</span>
    return null
  }

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input pl-9"
            placeholder="Search by name, email, ID, subject…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="select w-auto" value={status}   onChange={e => { setStatus(e.target.value);   setPage(1) }}>
            <option value="all">All Status</option>
            {['Open','In Progress','Closed','Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select w-auto" value={priority} onChange={e => { setPriority(e.target.value); setPage(1) }}>
            <option value="all">All Priority</option>
            {['Critical','High','Medium','Low'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="select w-auto" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
            <option value="all">All Category</option>
            {['Technical','Billing','Bug','Feature Request','General'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={resetFilters} className="btn-secondary p-2" title="Reset filters"><RefreshCw size={13} /></button>
          <button onClick={handleExport} className="btn-secondary flex items-center gap-1.5 text-xs">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Count + Bulk actions ── */}
      <div className="flex items-center justify-between min-h-[28px]">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading…' : `${total} ticket${total !== 1 ? 's' : ''} found`}
        </p>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{selected.length} selected</span>
            <select className="select w-auto text-xs py-1" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
              <option value="">Change status…</option>
              {['Open','In Progress','Closed','Resolved'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={handleBulkUpdate} disabled={bulkApplying || !bulkStatus} className="btn-primary text-xs py-1 disabled:opacity-50">
              {bulkApplying ? '…' : 'Apply'}
            </button>
            <button onClick={clearSelected} className="btn-secondary text-xs py-1">Clear</button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                <th className="w-10 px-4 py-3 text-center">
                  <button onClick={allSelected ? clearSelected : selectAll} className="flex items-center justify-center">
                    {allSelected  ? <CheckSquare size={14} className="text-indigo-600" />
                    : someSelected ? <Minus size={14} className="text-indigo-600" />
                    :               <Square  size={14} className="text-slate-300 dark:text-slate-600" />}
                  </button>
                </th>
                {[
                  { key: 'ticket_id',     label: 'ID'       },
                  { key: 'customer_name', label: 'Customer' },
                  { key: 'subject',       label: 'Subject'  },
                  { key: 'status',        label: 'Status'   },
                  { key: 'priority',      label: 'Priority' },
                  { key: 'category',      label: 'Category' },
                  { key: 'created_at',    label: 'Created'  },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">{label} <SortBtn col={key} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className={cn('h-3.5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse', j === 2 ? 'w-40' : 'w-20')} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No tickets found.</p>
                    <button onClick={resetFilters} className="text-indigo-600 text-xs mt-1 hover:underline">Reset filters</button>
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => {
                  const isSelected = selected.includes(ticket.ticket_id)
                  return (
                    <tr
                      key={ticket.ticket_id}
                      className={cn(
                        'group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors',
                        isSelected && 'bg-indigo-50/70 dark:bg-indigo-950/20'
                      )}
                    >
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleSelect(ticket.ticket_id)}>
                          {isSelected
                            ? <CheckSquare size={14} className="text-indigo-600" />
                            : <Square size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/tickets/${ticket.ticket_id}`}
                          className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {ticket.ticket_id}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{ticket.customer_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[140px]">{ticket.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{ticket.subject}</p>
                        <SLABadge ticket={ticket} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge   status={ticket.status}     /></td>
                      <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 capitalize">{ticket.category}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{timeAgo(ticket.created_at)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(1)}           disabled={page === 1}          className="btn-secondary text-xs py-1 px-2 disabled:opacity-40">«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}          className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Prev</button>
              <span className="text-xs text-slate-600 dark:text-slate-400 px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next</button>
              <button onClick={() => setPage(totalPages)}  disabled={page === totalPages} className="btn-secondary text-xs py-1 px-2 disabled:opacity-40">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

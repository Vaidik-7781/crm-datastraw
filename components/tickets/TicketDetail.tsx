'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Ticket, Note, ActivityLog } from '@/lib/types'
import { StatusBadge } from './StatusBadge'
import { PriorityBadge } from './PriorityBadge'
import { NotesSection } from './NotesSection'
import { ActivityTimeline } from './ActivityTimeline'
import {
  formatDateTime, timeAgo, getSLAStatus, getSLAHours,
  STATUSES, PRIORITIES, CATEGORIES, SENTIMENT_EMOJI, SENTIMENT_COLOR,
} from '@/lib/utils'
import { toast } from 'sonner'
import { Brain, Mail, Clock, AlertCircle, ArrowLeft, Copy, CheckCircle } from 'lucide-react'

export function TicketDetail({ ticket: initial }: { ticket: Ticket }) {
  const [ticket,   setTicket]   = useState(initial)
  const [notes,    setNotes]    = useState<Note[]>(initial.notes || [])
  const [activity, setActivity] = useState<ActivityLog[]>(initial.activity || [])
  const [updating, setUpdating] = useState(false)
  const [analyzing,setAnalyzing]= useState(false)
  const [copied,   setCopied]   = useState(false)

  const refreshActivity = async () => {
    const res = await fetch(`/api/tickets/${ticket.ticket_id}/activity`)
    const data = await res.json()
    if (Array.isArray(data)) setActivity(data)
  }

  const handleUpdate = async (updates: Record<string, any>) => {
    setUpdating(true)
    try {
      const res  = await fetch(`/api/tickets/${ticket.ticket_id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket(prev => ({ ...prev, ...data.data }))
      toast.success('Ticket updated')
      await refreshActivity()
    } catch (e: any) { toast.error(e.message || 'Update failed') }
    finally { setUpdating(false) }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const res  = await fetch(`/api/tickets/${ticket.ticket_id}/analyze`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTicket(prev => ({
        ...prev,
        ai_category:           data.analysis.category,
        ai_priority:           data.analysis.priority,
        ai_sentiment:          data.analysis.sentiment,
        ai_summary:            data.analysis.summary,
        ai_suggested_response: data.analysis.suggested_response,
      }))
      toast.success('AI analysis complete ✓')
      await refreshActivity()
    } catch (e: any) {
      toast.error(e.message || 'AI analysis failed — check ANTHROPIC_API_KEY')
    } finally { setAnalyzing(false) }
  }

  const copyResponse = () => {
    if (!ticket.ai_suggested_response) return
    navigator.clipboard.writeText(ticket.ai_suggested_response)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNoteAdded = (note: Note) => {
    setNotes(prev => [note, ...prev])
    setActivity(prev => [{
      id: `tmp-${Date.now()}`, ticket_id: ticket.ticket_id,
      action: 'note_added', old_value: null, new_value: note.note_text.substring(0, 80),
      performed_by: note.author, created_at: new Date().toISOString(),
    }, ...prev])
  }

  const sla      = getSLAStatus(ticket.created_at, ticket.status)
  const slaHours = getSLAHours(ticket.created_at)

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/tickets" className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft size={13} /> Tickets
            </Link>
            <span>/</span>
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{ticket.ticket_id}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{ticket.subject}</h1>
          <p className="text-xs text-slate-400 mt-1">Created {formatDateTime(ticket.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {sla === 'overdue' && (
            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-2 py-1 rounded-full font-medium">
              <AlertCircle size={11} /> Overdue ({slaHours}h)
            </span>
          )}
          {sla === 'warning' && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
              <Clock size={11} /> {slaHours}h open
            </span>
          )}
          <StatusBadge   status={ticket.status}     />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: description + AI + notes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="card p-6">
            <h3 className="section-title mb-4">Issue Description</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* AI Analysis */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title flex items-center gap-2">
                <Brain size={13} className="text-violet-500" /> AI Analysis
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Brain size={12} className="text-violet-500" />
                {analyzing ? 'Analyzing…' : ticket.ai_summary ? 'Re-analyze' : 'Analyze with AI'}
              </button>
            </div>

            {ticket.ai_summary ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'AI Category',  value: ticket.ai_category  },
                    { label: 'AI Priority',  value: ticket.ai_priority  },
                  ].filter(x => x.value).map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                    </div>
                  ))}
                  {ticket.ai_sentiment && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Customer Sentiment</p>
                      <p className={`text-sm font-medium ${SENTIMENT_COLOR[ticket.ai_sentiment] || ''}`}>
                        {SENTIMENT_EMOJI[ticket.ai_sentiment]} {ticket.ai_sentiment}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Summary</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ticket.ai_summary}</p>
                </div>

                {ticket.ai_suggested_response && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">💬 AI Draft Response</p>
                      <button onClick={copyResponse} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                        {copied ? <CheckCircle size={11} /> : <Copy size={11} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ticket.ai_suggested_response}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Brain size={36} className="mx-auto mb-3 text-slate-200 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-500">Click "Analyze with AI" to get:</p>
                <p className="text-xs text-slate-400 mt-1">Category · Priority suggestion · Customer sentiment · Draft response</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <NotesSection ticketId={ticket.ticket_id} notes={notes} onNoteAdded={handleNoteAdded} />
        </div>

        {/* RIGHT: customer + update + meta + timeline */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Customer</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {ticket.customer_name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.customer_name}</p>
                <p className="text-xs text-slate-500 truncate">{ticket.customer_email}</p>
              </div>
            </div>
            <a
              href={`mailto:${ticket.customer_email}?subject=Re: [${ticket.ticket_id}] ${ticket.subject}`}
              className="btn-secondary w-full flex items-center justify-center gap-1.5 text-xs"
            >
              <Mail size={12} /> Send Email
            </a>
          </div>

          {/* Update Panel */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Update Ticket</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Status</label>
                <select className="select" value={ticket.status} disabled={updating}
                  onChange={e => handleUpdate({ status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="select" value={ticket.priority} disabled={updating}
                  onChange={e => handleUpdate({ priority: e.target.value })}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Category</label>
                <select className="select" value={ticket.category} disabled={updating}
                  onChange={e => handleUpdate({ category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assigned To</label>
                <input className="input" defaultValue={ticket.assigned_to || ''} placeholder="Agent name"
                  onBlur={e => { if (e.target.value !== ticket.assigned_to) handleUpdate({ assigned_to: e.target.value }) }}
                />
              </div>
              {updating && <p className="text-xs text-indigo-500 text-center">Saving…</p>}
            </div>
          </div>

          {/* Meta */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Details</h3>
            <dl className="space-y-2 text-sm">
              {[
                { t: 'Ticket ID',  v: <span className="font-mono font-semibold">{ticket.ticket_id}</span> },
                { t: 'Category',   v: ticket.category   },
                { t: 'Assigned',   v: ticket.assigned_to || <span className="text-slate-400">Unassigned</span> },
                { t: 'Created',    v: timeAgo(ticket.created_at)  },
                { t: 'Updated',    v: timeAgo(ticket.updated_at)  },
                ...(ticket.resolved_at ? [{ t: 'Resolved', v: <span className="text-emerald-600">{timeAgo(ticket.resolved_at)}</span> }] : []),
              ].map(({ t, v }) => (
                <div key={t} className="flex justify-between gap-2">
                  <dt className="text-slate-400 shrink-0">{t}</dt>
                  <dd className="text-slate-800 dark:text-slate-200 text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Activity timeline */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Activity Timeline</h3>
            <ActivityTimeline activity={activity} />
          </div>
        </div>
      </div>
    </div>
  )
}

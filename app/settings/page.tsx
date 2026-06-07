'use client'
import { useState, useEffect } from 'react'
import { QuickReply } from '@/lib/types'
import { toast } from 'sonner'
import { Plus, Trash2, Edit2, Check, X, MessageSquarePlus, Copy } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default function SettingsPage() {
  const [replies,  setReplies]  = useState<QuickReply[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId,   setEditId]   = useState<string | null>(null)
  const [form,     setForm]     = useState({ title: '', body: '' })
  const [saving,   setSaving]   = useState(false)

  const fetchReplies = async () => {
    setLoading(true)
    const res  = await fetch('/api/quick-replies')
    const data = await res.json()
    setReplies(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchReplies() }, [])

  const resetForm = () => {
    setForm({ title: '', body: '' }); setShowForm(false); setEditId(null)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) { toast.error('Title and body are required'); return }
    setSaving(true)
    try {
      const url    = editId ? `/api/quick-replies/${editId}` : '/api/quick-replies'
      const method = editId ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(editId ? 'Template updated' : 'Template created')
      resetForm(); fetchReplies()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleEdit = (r: QuickReply) => {
    setForm({ title: r.title, body: r.body }); setEditId(r.id); setShowForm(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete template "${title}"?`)) return
    const res = await fetch(`/api/quick-replies/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Template deleted'); fetchReplies() }
    else toast.error('Failed to delete template')
  }

  const handleCopy = (body: string) => {
    navigator.clipboard.writeText(body)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage quick reply templates for faster agent responses.
        </p>
      </div>

      {/* Quick Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Quick Reply Templates</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Saved responses agents can instantly use when replying to tickets.
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-1.5">
            <Plus size={14} /> New Template
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card p-6 border-indigo-200 dark:border-indigo-900/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquarePlus size={14} className="text-indigo-500" />
              {editId ? 'Edit Template' : 'New Quick Reply Template'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label">Template Title *</label>
                <input
                  className="input"
                  placeholder="e.g. Acknowledge Receipt, Request More Info…"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
                <p className="text-xs text-slate-400 mt-1">A short name agents see when selecting templates.</p>
              </div>
              <div>
                <label className="label">Response Body *</label>
                <textarea
                  rows={5}
                  className="input resize-none"
                  placeholder="Type the full response text here…"
                  value={form.body}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                />
                <p className="text-xs text-slate-400 mt-1">{form.body.length} characters</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
                <Check size={13} /> {saving ? 'Saving…' : editId ? 'Update Template' : 'Save Template'}
              </button>
              <button onClick={resetForm} className="btn-secondary flex items-center gap-1.5">
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Templates list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : replies.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquarePlus size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-slate-500 font-medium">No quick reply templates yet.</p>
            <p className="text-sm text-slate-400 mt-1">Create templates to speed up agent responses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {replies.map(reply => (
              <div key={reply.id} className="card p-5 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{reply.title}</h4>
                      <span className="text-xs text-slate-400">· updated {timeAgo(reply.updated_at)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {reply.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleCopy(reply.body)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 transition-colors" title="Copy text">
                      <Copy size={13} />
                    </button>
                    <button onClick={() => handleEdit(reply)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(reply.id, reply.title)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 text-center">
          {replies.length} template{replies.length !== 1 ? 's' : ''} — available in the Notes section of every ticket.
        </p>
      </div>
    </div>
  )
}

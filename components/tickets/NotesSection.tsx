'use client'
import { useState, useEffect } from 'react'
import { Note, QuickReply } from '@/lib/types'
import { timeAgo } from '@/lib/utils'
import { toast } from 'sonner'
import { MessageSquare, Send, ChevronDown, Trash2, Zap } from 'lucide-react'

interface Props {
  ticketId:    string
  notes:       Note[]
  onNoteAdded: (note: Note) => void
}

export function NotesSection({ ticketId, notes, onNoteAdded }: Props) {
  const [text,         setText]        = useState('')
  const [author,       setAuthor]      = useState('Support Agent')
  const [posting,      setPosting]     = useState(false)
  const [quickReplies, setQR]          = useState<QuickReply[]>([])
  const [showQR,       setShowQR]      = useState(false)
  const [localNotes,   setLocalNotes]  = useState<Note[]>(notes)
  const [deletingId,   setDeletingId]  = useState<string | null>(null)

  useEffect(() => { setLocalNotes(notes) }, [notes])

  useEffect(() => {
    fetch('/api/quick-replies')
      .then(r => r.json())
      .then(d => setQR(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const applyQR = (body: string) => { setText(body); setShowQR(false) }

  const handleSubmit = async () => {
    if (!text.trim()) { toast.error('Note cannot be empty'); return }
    setPosting(true)
    try {
      const res  = await fetch(`/api/tickets/${ticketId}/notes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: text.trim(), author: author.trim() || 'Support Agent' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newNote = data as Note
      setLocalNotes(prev => [newNote, ...prev])
      onNoteAdded(newNote)
      setText('')
      toast.success('Note added')
    } catch (e: any) { toast.error(e.message) }
    finally { setPosting(false) }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return
    setDeletingId(noteId)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/notes/${noteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setLocalNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('Note deleted')
    } catch { toast.error('Failed to delete note') }
    finally { setDeletingId(null) }
  }

  return (
    <div className="card p-6">
      <h3 className="section-title flex items-center gap-2 mb-5">
        <MessageSquare size={14} className="text-indigo-500" />
        Notes &amp; Comments ({localNotes.length})
      </h3>

      {/* Compose */}
      <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <input
          className="input text-xs" placeholder="Your name (e.g. Sarah K.)"
          value={author} onChange={e => setAuthor(e.target.value)}
        />

        {quickReplies.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowQR(v => !v)}
              className="btn-secondary flex items-center gap-1.5 text-xs w-full justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Zap size={11} className="text-amber-500" /> Quick Replies
              </span>
              <ChevronDown size={12} className={`transition-transform ${showQR ? 'rotate-180' : ''}`} />
            </button>
            {showQR && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                {quickReplies.map(qr => (
                  <button key={qr.id} onClick={() => applyQR(qr.body)}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 group">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">{qr.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{qr.body}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          className="input resize-none text-sm" rows={4}
          placeholder="Add an internal note or customer response draft…"
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }}
          onClick={() => setShowQR(false)}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Ctrl+Enter to submit · {text.length} chars</p>
          <button onClick={handleSubmit} disabled={posting || !text.trim()}
            className="btn-primary flex items-center gap-1.5 text-xs disabled:opacity-50">
            <Send size={12} /> {posting ? 'Posting…' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {localNotes.length === 0 ? (
        <div className="text-center py-6">
          <MessageSquare size={28} className="mx-auto text-slate-200 dark:text-slate-700 mb-2" />
          <p className="text-sm text-slate-400">No notes yet. Add the first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {localNotes.map(note => (
            <div key={note.id} className="flex gap-3 group">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: `hsl(${(note.author.charCodeAt(0) * 37) % 360}, 60%, 52%)` }}
              >
                {note.author?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{note.author}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{timeAgo(note.created_at)}</span>
                    <button
                      onClick={() => handleDelete(note.id)} disabled={deletingId === note.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-950/40 rounded text-slate-300 hover:text-red-500"
                      title="Delete note"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{note.note_text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

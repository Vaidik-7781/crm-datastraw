'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { PRIORITIES, CATEGORIES } from '@/lib/utils'

interface FormData {
  customer_name:  string
  customer_email: string
  subject:        string
  description:    string
  priority:       string
  category:       string
  assigned_to:    string
}

const INITIAL: FormData = {
  customer_name:  '',
  customer_email: '',
  subject:        '',
  description:    '',
  priority:       'Medium',
  category:       'General',
  assigned_to:    '',
}

export default function NewTicketPage() {
  const router   = useRouter()
  const [form,     setForm]     = useState<FormData>(INITIAL)
  const [errors,   setErrors]   = useState<Partial<FormData>>({})
  const [loading,  setLoading]  = useState(false)

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.customer_name.trim())                                  e.customer_name  = 'Customer name is required'
    if (!form.customer_email.trim())                                 e.customer_email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) e.customer_email = 'Invalid email address'
    if (!form.subject.trim())                                        e.subject        = 'Subject is required'
    if (!form.description.trim())                                    e.description    = 'Description is required'
    else if (form.description.trim().length < 10)                   e.description    = 'Description must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix the errors below'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/tickets', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          customer_name:  form.customer_name.trim(),
          customer_email: form.customer_email.trim().toLowerCase(),
          subject:        form.subject.trim(),
          description:    form.description.trim(),
          priority:       form.priority,
          category:       form.category,
          assigned_to:    form.assigned_to.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create ticket')
      toast.success(`Ticket ${data.ticket_id} created!`)
      router.push(`/tickets/${data.ticket_id}`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ id, label, required, error, children }: {
    id: string; label: string; required?: boolean; error?: string; children: React.ReactNode
  }) => (
    <div>
      <label htmlFor={id} className="label">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/tickets" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-3">
          <ArrowLeft size={13} /> Back to Tickets
        </Link>
        <h1 className="page-title">Create New Ticket</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Fill in the details below. A unique Ticket ID will be auto-generated.
        </p>
      </div>

      {/* Form */}
      <div className="card p-6 space-y-5">
        {/* Customer info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="customer_name" label="Customer Name" required error={errors.customer_name}>
            <input
              id="customer_name" className={`input ${errors.customer_name ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Jane Smith" value={form.customer_name} onChange={set('customer_name')}
            />
          </Field>
          <Field id="customer_email" label="Customer Email" required error={errors.customer_email}>
            <input
              id="customer_email" type="email" className={`input ${errors.customer_email ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="jane@company.com" value={form.customer_email} onChange={set('customer_email')}
            />
          </Field>
        </div>

        {/* Subject */}
        <Field id="subject" label="Issue Subject" required error={errors.subject}>
          <input
            id="subject" className={`input ${errors.subject ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Brief description of the issue…" value={form.subject} onChange={set('subject')}
          />
        </Field>

        {/* Description */}
        <Field id="description" label="Full Description" required error={errors.description}>
          <textarea
            id="description" rows={5}
            className={`input resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="Describe the issue in detail. Include steps to reproduce, error messages, and expected behavior…"
            value={form.description} onChange={set('description')}
          />
          <p className="text-xs text-slate-400 mt-1">{form.description.length} characters</p>
        </Field>

        {/* Priority + Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="priority" label="Priority">
            <select id="priority" className="select" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field id="category" label="Category">
            <select id="category" className="select" value={form.category} onChange={set('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {/* Assigned to */}
        <Field id="assigned_to" label="Assign To (optional)">
          <input
            id="assigned_to" className="input"
            placeholder="Agent name (e.g. Sarah K.)" value={form.assigned_to} onChange={set('assigned_to')}
          />
        </Field>

        {/* Priority guide */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Priority Guide</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
            <span><span className="text-red-500 font-medium">Critical</span> — System down, data loss</span>
            <span><span className="text-orange-500 font-medium">High</span> — Feature broken, blocks work</span>
            <span><span className="text-yellow-500 font-medium">Medium</span> — Workaround exists</span>
            <span><span className="text-green-500 font-medium">Low</span> — Cosmetic or enhancement</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <Link href="/tickets" className="btn-secondary">Cancel</Link>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {loading ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { Agent } from '@/lib/types'
import { toast } from 'sonner'
import { UserPlus, Trash2, Edit2, Check, X, Users, Shield, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#EC4899']
const ROLES  = ['Admin', 'Agent', 'Viewer'] as const

const ROLE_ICONS: Record<string, React.ReactNode> = {
  Admin:  <Shield size={11} />,
  Agent:  <Users  size={11} />,
  Viewer: <Eye    size={11} />,
}

const ROLE_COLORS: Record<string, string> = {
  Admin:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Agent:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Viewer: 'bg-slate-100  text-slate-600  dark:bg-slate-800       dark:text-slate-400',
}

export default function AgentsPage() {
  const [agents,  setAgents]  = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId,  setEditId]  = useState<string | null>(null)

  const [form, setForm] = useState({ name: '', email: '', role: 'Agent' as typeof ROLES[number], avatar_color: '#6366F1' })
  const [saving, setSaving] = useState(false)

  const fetchAgents = async () => {
    setLoading(true)
    const res  = await fetch('/api/agents')
    const data = await res.json()
    setAgents(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchAgents() }, [])

  const resetForm = () => {
    setForm({ name: '', email: '', role: 'Agent', avatar_color: '#6366F1' })
    setShowForm(false)
    setEditId(null)
  }

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email required'); return }
    setSaving(true)
    try {
      const url    = editId ? `/api/agents/${editId}` : '/api/agents'
      const method = editId ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(editId ? 'Agent updated' : 'Agent added')
      resetForm(); fetchAgents()
    } catch (e: any) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleEdit = (agent: Agent) => {
    setForm({ name: agent.name, email: agent.email, role: agent.role, avatar_color: agent.avatar_color })
    setEditId(agent.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from the team?`)) return
    const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success(`${name} removed`); fetchAgents() }
    else toast.error('Failed to remove agent')
  }

  const toggleActive = async (agent: Agent) => {
    const res = await fetch(`/api/agents/${agent.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !agent.is_active }),
    })
    if (res.ok) { fetchAgents() }
  }

  const stats = {
    total:   agents.length,
    active:  agents.filter(a => a.is_active).length,
    admins:  agents.filter(a => a.role === 'Admin').length,
    agents:  agents.filter(a => a.role === 'Agent').length,
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your support team members and their roles.
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-1.5">
          <UserPlus size={14} /> Add Agent
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: stats.total,  color: 'text-indigo-600' },
          { label: 'Active',       value: stats.active,  color: 'text-emerald-600' },
          { label: 'Admins',       value: stats.admins,  color: 'text-violet-600' },
          { label: 'Agents',       value: stats.agents,  color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">
            {editId ? 'Edit Agent' : 'Add New Agent'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Sarah Kumar" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="sarah@company.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                disabled={!!editId} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="select" value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as typeof ROLES[number] }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Avatar Color</label>
              <div className="flex items-center gap-2 mt-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(p => ({ ...p, avatar_color: c }))}
                    className={cn('w-7 h-7 rounded-full transition-all', form.avatar_color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : '')}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center gap-1.5 disabled:opacity-60">
              <Check size={13} /> {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Agent'}
            </button>
            <button onClick={resetForm} className="btn-secondary flex items-center gap-1.5">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Agents table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                {['Agent', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No agents yet. Click "Add Agent" to get started.
                  </td>
                </tr>
              ) : agents.map(agent => (
                <tr key={agent.id} className={cn('hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors', !agent.is_active && 'opacity-50')}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: agent.avatar_color }}>
                        {agent.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{agent.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', ROLE_COLORS[agent.role])}>
                      {ROLE_ICONS[agent.role]} {agent.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(agent)}
                      className={cn('text-xs font-medium px-2.5 py-1 rounded-full transition-colors',
                        agent.is_active
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-slate-200')}>
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {new Date(agent.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(agent)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(agent.id, agent.name)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-slate-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role guide */}
      <div className="card p-5">
        <h3 className="section-title mb-3">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          {[
            { role: 'Admin',  desc: 'Full access — manage agents, settings, and all tickets', color: 'text-violet-600' },
            { role: 'Agent',  desc: 'Can create, update, and respond to tickets',             color: 'text-indigo-600' },
            { role: 'Viewer', desc: 'Read-only access — can view tickets but not edit',       color: 'text-slate-500'  },
          ].map(({ role, desc, color }) => (
            <div key={role} className="flex gap-3">
              <span className={cn('flex items-center gap-1 font-semibold text-xs shrink-0 mt-0.5', color)}>
                {ROLE_ICONS[role]} {role}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

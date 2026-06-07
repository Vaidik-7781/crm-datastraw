import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string) {
  return format(new Date(date), 'MMM d, yyyy · HH:mm')
}

export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function getSLAStatus(createdAt: string, status: string) {
  if (status === 'Closed' || status === 'Resolved') return 'resolved'
  const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
  if (hours > 48) return 'overdue'
  if (hours > 24) return 'warning'
  return 'ok'
}

export function getSLAHours(createdAt: string) {
  return Math.round((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60))
}

// ---- Color maps ----

export const STATUS_BG: Record<string, string> = {
  'Open':        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Closed':      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  'Resolved':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export const PRIORITY_BG: Record<string, string> = {
  'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'High':     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Medium':   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Low':      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export const PRIORITY_DOT: Record<string, string> = {
  'Critical': 'bg-red-500',
  'High':     'bg-orange-500',
  'Medium':   'bg-yellow-500',
  'Low':      'bg-green-500',
}

export const SENTIMENT_EMOJI: Record<string, string> = {
  'Positive':   '😊',
  'Neutral':    '😐',
  'Frustrated': '😤',
  'Angry':      '😠',
}

export const SENTIMENT_COLOR: Record<string, string> = {
  'Positive':   'text-emerald-600 dark:text-emerald-400',
  'Neutral':    'text-slate-500',
  'Frustrated': 'text-amber-600 dark:text-amber-400',
  'Angry':      'text-red-600 dark:text-red-400',
}

export const ACTION_LABELS: Record<string, string> = {
  ticket_created:   'Ticket created',
  status_changed:   'Status changed',
  priority_changed: 'Priority changed',
  category_changed: 'Category changed',
  assigned:         'Ticket assigned',
  note_added:       'Note added',
  note_deleted:     'Note deleted',
  bulk_updated:     'Bulk updated',
  ai_analyzed:      'AI analysis run',
}

export const ACTION_ICONS: Record<string, string> = {
  ticket_created:   '🎫',
  status_changed:   '🔄',
  priority_changed: '⚡',
  category_changed: '🏷️',
  assigned:         '👤',
  note_added:       '📝',
  note_deleted:     '🗑️',
  bulk_updated:     '⚙️',
  ai_analyzed:      '🤖',
}

export const STATUSES   = ['Open', 'In Progress', 'Closed', 'Resolved'] as const
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export const CATEGORIES = ['Technical', 'Billing', 'Feature Request', 'General', 'Bug'] as const

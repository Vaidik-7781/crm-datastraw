export type TicketStatus = 'Open' | 'In Progress' | 'Closed' | 'Resolved'
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type TicketCategory = 'Technical' | 'Billing' | 'Feature Request' | 'General' | 'Bug'

export interface Ticket {
  id: string
  ticket_id: string
  customer_name: string
  customer_email: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  assigned_to: string | null
  ai_category: string | null
  ai_priority: string | null
  ai_sentiment: string | null
  ai_summary: string | null
  ai_suggested_response: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  notes?: Note[]
  activity?: ActivityLog[]
}

export interface Note {
  id: string
  ticket_id: string
  note_text: string
  author: string
  created_at: string
}

export interface ActivityLog {
  id: string
  ticket_id: string
  action: string
  old_value: string | null
  new_value: string | null
  performed_by: string
  created_at: string
}

export interface TicketStats {
  total: number
  open: number
  in_progress: number
  closed: number
  resolved: number
  critical: number
  by_category: Record<string, number>
  by_priority: Record<string, number>
  daily_created: { date: string; count: number }[]
  avg_resolution_hours: number
}

export interface PaginatedTickets {
  tickets: Ticket[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TicketFilters {
  status: string
  priority: string
  category: string
  search: string
  sortBy: string
  sortOrder: string
  page: number
}

export interface Agent {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Agent' | 'Viewer'
  avatar_color: string
  is_active: boolean
  created_at: string
}

export interface QuickReply {
  id: string
  title: string
  body: string
  created_at: string
  updated_at: string
}

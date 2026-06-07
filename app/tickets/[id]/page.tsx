import { createClient } from '@/lib/supabase/server'
import { TicketDetail } from '@/components/tickets/TicketDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Ticket } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${params.id} — SupportDesk` }
}

export default async function TicketDetailPage({ params }: Props) {
  const supabase = createClient()

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', params.id)
    .single()

  if (error || !ticket) notFound()

  const [{ data: notes }, { data: activity }] = await Promise.all([
    supabase.from('notes').select('*').eq('ticket_id', params.id).order('created_at', { ascending: false }),
    supabase.from('activity_log').select('*').eq('ticket_id', params.id).order('created_at', { ascending: false }),
  ])

  const fullTicket: Ticket = {
    ...ticket,
    notes:    notes    || [],
    activity: activity || [],
  }

  return <TicketDetail ticket={fullTicket} />
}

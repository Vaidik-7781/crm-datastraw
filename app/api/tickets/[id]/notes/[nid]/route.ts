import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; nid: string } }
) {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', params.nid)
      .eq('ticket_id', params.id)
    if (error) throw error
    await supabase.from('activity_log').insert({
      ticket_id: params.id, action: 'note_deleted',
      new_value: `Note ${params.nid.slice(0,8)} deleted`,
      performed_by: 'Support Agent',
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

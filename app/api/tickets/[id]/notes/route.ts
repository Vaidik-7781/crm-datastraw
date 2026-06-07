import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { note_text, author = 'Support Agent' } = await request.json()

    if (!note_text?.trim()) return NextResponse.json({ error: 'note_text is required' }, { status: 400 })

    const { data, error } = await supabase
      .from('notes')
      .insert({ ticket_id: params.id, note_text: note_text.trim(), author })
      .select()
      .single()

    if (error) throw error

    await supabase.from('activity_log').insert({
      ticket_id: params.id, action: 'note_added',
      new_value: note_text.trim().substring(0, 100), performed_by: author,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

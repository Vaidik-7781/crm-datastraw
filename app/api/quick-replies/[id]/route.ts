import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { title, body } = await request.json()
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('quick_replies')
      .update({ title: title.trim(), body: body.trim() })
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('quick_replies').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

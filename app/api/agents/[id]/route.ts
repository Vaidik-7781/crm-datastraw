import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const updates: Record<string, any> = {}
    if (body.name)         updates.name         = body.name.trim()
    if (body.role)         updates.role         = body.role
    if (body.avatar_color) updates.avatar_color = body.avatar_color
    if (body.is_active !== undefined) updates.is_active = body.is_active
    const { data, error } = await supabase
      .from('agents').update(updates).eq('id', params.id).select().single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('agents').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

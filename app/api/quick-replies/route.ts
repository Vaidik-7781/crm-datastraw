import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('quick_replies')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { title, body } = await request.json()
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('quick_replies')
      .insert({ title: title.trim(), body: body.trim() })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('agents')
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
    const { name, email, role = 'Agent', avatar_color = '#6366F1' } = await request.json()
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('agents')
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), role, avatar_color })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

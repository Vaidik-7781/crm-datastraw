import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase.from('tickets').select('*').order('created_at', { ascending: false })
    if (status && status !== 'all') query = query.eq('status', status)
    if (search?.trim()) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,ticket_id.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    const cols = ['ticket_id','customer_name','customer_email','subject','status','priority','category','assigned_to','created_at','updated_at']
    const rows = [
      cols.join(','),
      ...(data || []).map(t => cols.map(c => `"${String((t as any)[c] ?? '').replace(/"/g,'""')}"`).join(','))
    ]

    return new NextResponse(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tickets-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

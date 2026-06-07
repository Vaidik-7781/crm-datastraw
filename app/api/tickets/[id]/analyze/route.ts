import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()

    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('ticket_id', params.id)
      .single()

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI not configured. Set ANTHROPIC_API_KEY in environment.' }, { status: 503 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a customer support AI assistant. Analyze the following support ticket and return ONLY a valid JSON object with no other text.

Ticket Subject: ${ticket.subject}
Customer Description: ${ticket.description}
Customer Email: ${ticket.customer_email}

Return ONLY this JSON structure:
{
  "category": "one of: Technical, Billing, Feature Request, General, Bug",
  "priority": "one of: Low, Medium, High, Critical",
  "sentiment": "one of: Positive, Neutral, Frustrated, Angry",
  "summary": "one concise sentence describing the core issue",
  "suggested_response": "a helpful, empathetic 2-3 sentence draft response to send to the customer addressing their issue"
}`,
      }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim()
    const analysis = JSON.parse(cleaned)

    await supabase.from('tickets').update({
      ai_category:           analysis.category,
      ai_priority:           analysis.priority,
      ai_sentiment:          analysis.sentiment,
      ai_summary:            analysis.summary,
      ai_suggested_response: analysis.suggested_response,
    }).eq('ticket_id', params.id)

    await supabase.from('activity_log').insert({
      ticket_id:    params.id,
      action:       'ai_analyzed',
      new_value:    `Category: ${analysis.category} | Priority: ${analysis.priority} | Sentiment: ${analysis.sentiment}`,
      performed_by: 'AI (Claude)',
    })

    return NextResponse.json({ success: true, analysis })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

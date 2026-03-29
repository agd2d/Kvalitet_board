import { NextRequest, NextResponse } from 'next/server'
import { createPortalAdminClient } from '@/lib/supabase/portal'

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('task_id')
  if (!taskId) return NextResponse.json({ error: 'task_id påkrævet' }, { status: 400 })

  const db = createPortalAdminClient()
  const { data, error } = await db
    .from('messages')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { task_id, content, sender_id, sender_type } = body

  if (!task_id || !content) {
    return NextResponse.json({ error: 'task_id og content er påkrævet' }, { status: 400 })
  }

  const db = createPortalAdminClient()
  const { data, error } = await db
    .from('messages')
    .insert({ task_id, content, sender_id, sender_type: sender_type ?? 'admin' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}

import { NextRequest, NextResponse } from 'next/server'
import { createPortalAdminClient } from '@/lib/supabase/portal'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status, scheduled_at } = body

  if (!id || !status) {
    return NextResponse.json({ error: 'id og status er påkrævet' }, { status: 400 })
  }

  const db = createPortalAdminClient()
  const update: Record<string, unknown> = { status }

  if (scheduled_at) update.scheduled_at = scheduled_at
  if (status === 'afsluttet') update.completed_at = new Date().toISOString()

  const { error } = await db.from('tasks').update(update).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

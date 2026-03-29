import { NextRequest, NextResponse } from 'next/server'
import { createPortalAdminClient } from '@/lib/supabase/portal'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { task_id, employee_name, employee_role } = body

  if (!task_id || !employee_name) {
    return NextResponse.json({ error: 'task_id og employee_name er påkrævet' }, { status: 400 })
  }

  const db = createPortalAdminClient()
  const { data, error } = await db
    .from('task_employees')
    .insert({ task_id, employee_name, employee_role: employee_role ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ employee: data })
}

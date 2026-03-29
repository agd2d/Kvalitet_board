export const dynamic = 'force-dynamic'

import { createPortalAdminClient } from '@/lib/supabase/portal'
import TaskAdminList from './TaskAdminList'

export default async function OpgaverPage() {
  const db = createPortalAdminClient()

  const [{ data: tasks }, { data: feedback }] = await Promise.all([
    db.from('tasks').select(`
      id, title, status, scheduled_at, completed_at, created_at,
      services(name),
      profiles(company_name, contact_name),
      task_employees(id, employee_name, employee_role)
    `).order('created_at', { ascending: false }),
    db.from('task_feedback').select('task_id, rating, comment'),
  ])

  const feedbackMap = Object.fromEntries(
    (feedback ?? []).map((f: { task_id: string; rating: number; comment: string | null }) => [f.task_id, f])
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Opgaver</h1>
      <p className="text-gray-500 text-sm">Opdatér status, tilføj medarbejdere og se kundefeedback.</p>
      <TaskAdminList tasks={tasks ?? []} feedbackMap={feedbackMap} />
    </div>
  )
}

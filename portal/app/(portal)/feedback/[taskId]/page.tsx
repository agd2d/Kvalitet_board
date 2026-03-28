import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import FeedbackForm from '@/components/FeedbackForm'

export default async function FeedbackPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('id, title, status, task_feedback(id)')
    .eq('id', taskId)
    .eq('customer_id', user.id)
    .single()

  if (!task) notFound()
  if (task.status !== 'afsluttet') redirect(`/booking/${taskId}`)
  if (task.task_feedback && task.task_feedback.length > 0) redirect(`/booking/${taskId}`)

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Giv feedback</h1>
      <p className="text-gray-500 mb-2">Opgave: <span className="font-medium text-gray-700">{task.title}</span></p>
      <p className="text-gray-500 mb-8 text-sm">Din vurdering hjælper os med at forbedre vores service.</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <FeedbackForm taskId={taskId} userId={user.id} />
      </div>
    </div>
  )
}

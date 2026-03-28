import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Task, TaskStatus } from '@/lib/types'
import TaskCard from '@/components/TaskCard'
import Link from 'next/link'

const STATUS_ORDER: TaskStatus[] = ['igangværende', 'planlagt', 'afventer', 'afsluttet']

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      services (id, name),
      task_employees (id, employee_name, employee_role),
      task_feedback (id, rating, comment)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  const allTasks = (tasks ?? []) as Task[]

  const counts = {
    igangværende: allTasks.filter(t => t.status === 'igangværende').length,
    planlagt: allTasks.filter(t => t.status === 'planlagt').length,
    afventer: allTasks.filter(t => t.status === 'afventer').length,
    afsluttet: allTasks.filter(t => t.status === 'afsluttet').length,
  }

  const pendingFeedback = allTasks.filter(
    t => t.status === 'afsluttet' && (!t.task_feedback || t.task_feedback.length === 0)
  )

  const grouped = STATUS_ORDER.reduce<Record<string, Task[]>>((acc, status) => {
    acc[status] = allTasks.filter(t => t.status === status)
    return acc
  }, {} as Record<string, Task[]>)

  const sectionLabels: Record<string, string> = {
    igangværende: 'Igangværende',
    planlagt: 'Planlagte',
    afventer: 'Afventer bekræftelse',
    afsluttet: 'Afsluttede',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Goddag{profile?.contact_name ? `, ${profile.contact_name}` : ''}
          </h1>
          {profile?.company_name && (
            <p className="text-gray-500 mt-0.5">{profile.company_name}</p>
          )}
        </div>
        <Link
          href="/booking"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Book ydelse
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Igangværende', value: counts.igangværende, color: 'purple' },
          { label: 'Planlagte', value: counts.planlagt, color: 'blue' },
          { label: 'Afventer', value: counts.afventer, color: 'yellow' },
          { label: 'Afsluttede', value: counts.afsluttet, color: 'green' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Feedback reminder */}
      {pendingFeedback.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-800">
              Du har {pendingFeedback.length} afsluttet {pendingFeedback.length === 1 ? 'opgave' : 'opgaver'} uden feedback
            </p>
            <p className="text-sm text-amber-700 mt-0.5">Din vurdering hjælper os med at forbedre vores service</p>
          </div>
          <Link
            href={`/feedback/${pendingFeedback[0].id}`}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            Giv feedback
          </Link>
        </div>
      )}

      {/* Task sections */}
      {allTasks.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">Ingen opgaver endnu</p>
          <p className="text-sm mt-1">Book din første ydelse for at komme i gang</p>
          <Link href="/booking" className="inline-block mt-4 text-blue-600 hover:underline text-sm font-medium">
            Book en ydelse →
          </Link>
        </div>
      ) : (
        STATUS_ORDER.map(status => {
          const statusTasks = grouped[status]
          if (statusTasks.length === 0) return null
          return (
            <section key={status}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                {sectionLabels[status]}
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {statusTasks.length}
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {statusTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}

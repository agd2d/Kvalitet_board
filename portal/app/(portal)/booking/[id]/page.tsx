import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { Task } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import RatingStars from '@/components/RatingStars'
import Link from 'next/link'

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('da-DK', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: taskData } = await supabase
    .from('tasks')
    .select(`
      *,
      services (id, name, description, duration_hours),
      task_employees (id, employee_name, employee_role, assigned_at),
      task_feedback (id, rating, comment, created_at)
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .single()

  if (!taskData) notFound()
  const task = taskData as Task

  const feedback = task.task_feedback?.[0]

  const statusTimeline = [
    { status: 'afventer', label: 'Afventer bekræftelse' },
    { status: 'planlagt', label: 'Planlagt' },
    { status: 'igangværende', label: 'Igangværende' },
    { status: 'afsluttet', label: 'Afsluttet' },
  ]
  const currentIndex = statusTimeline.findIndex(s => s.status === task.status)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{task.title}</h1>
        <StatusBadge status={task.status} />
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Status</h2>
        <div className="flex items-center">
          {statusTimeline.map((step, index) => {
            const isDone = index <= currentIndex
            const isLast = index === statusTimeline.length - 1
            return (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isDone
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {isDone ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center w-16 ${isDone ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div className={`flex-1 h-0.5 mx-1 mb-5 ${index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-700">Detaljer</h2>
        {task.services && (
          <div>
            <p className="text-xs text-gray-500">Ydelse</p>
            <p className="font-medium">{task.services.name}</p>
          </div>
        )}
        {task.description && (
          <div>
            <p className="text-xs text-gray-500">Beskrivelse</p>
            <p className="text-gray-700">{task.description}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-xs text-gray-500">Oprettet</p>
            <p className="text-sm font-medium">{formatDateTime(task.created_at)}</p>
          </div>
          {task.scheduled_at && (
            <div>
              <p className="text-xs text-gray-500">Planlagt</p>
              <p className="text-sm font-medium">{formatDateTime(task.scheduled_at)}</p>
            </div>
          )}
          {task.completed_at && (
            <div>
              <p className="text-xs text-gray-500">Afsluttet</p>
              <p className="text-sm font-medium">{formatDateTime(task.completed_at)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Employees */}
      {task.task_employees && task.task_employees.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Medarbejdere på opgaven</h2>
          <div className="space-y-2">
            {task.task_employees.map(emp => (
              <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {emp.employee_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{emp.employee_name}</p>
                  {emp.employee_role && <p className="text-xs text-gray-500">{emp.employee_role}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Din vurdering</h2>
          <RatingStars value={feedback.rating} readonly />
          {feedback.comment && <p className="text-gray-600 mt-2 text-sm italic">"{feedback.comment}"</p>}
        </div>
      ) : task.status === 'afsluttet' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <p className="text-green-800 font-medium">Opgaven er afsluttet – del din oplevelse</p>
          <Link
            href={`/feedback/${task.id}`}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            Giv feedback
          </Link>
        </div>
      ) : null}

      {/* Chat link */}
      <Link
        href={`/chat?task=${task.id}`}
        className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-blue-300 transition-colors group"
      >
        <span className="text-2xl">💬</span>
        <div>
          <p className="font-medium text-gray-800 group-hover:text-blue-700">Åbn beskeder for denne opgave</p>
          <p className="text-xs text-gray-500">Kommunikér direkte med Hvidbjerg Service</p>
        </div>
        <span className="ml-auto text-gray-400 group-hover:text-blue-600">→</span>
      </Link>
    </div>
  )
}

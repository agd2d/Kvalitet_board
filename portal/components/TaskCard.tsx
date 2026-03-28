import Link from 'next/link'
import { Task } from '@/lib/types'
import StatusBadge from './StatusBadge'
import RatingStars from './RatingStars'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('da-DK', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

export default function TaskCard({ task }: { task: Task }) {
  const feedback = task.task_feedback?.[0]
  const employees = task.task_employees ?? []

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          {task.services && (
            <p className="text-sm text-gray-500 mt-0.5">{task.services.name}</p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
        <span>Oprettet: {formatDate(task.created_at)}</span>
        {task.scheduled_at && <span>Planlagt: {formatDate(task.scheduled_at)}</span>}
        {task.completed_at && <span>Afsluttet: {formatDate(task.completed_at)}</span>}
      </div>

      {employees.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {employees.map(emp => (
            <span key={emp.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100">
              <span>👤</span> {emp.employee_name}
            </span>
          ))}
        </div>
      )}

      {feedback && (
        <div className="mt-2">
          <RatingStars value={feedback.rating} readonly />
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Link
          href={`/booking/${task.id}`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Se detaljer →
        </Link>
        {task.status === 'afsluttet' && !feedback && (
          <Link
            href={`/feedback/${task.id}`}
            className="text-sm text-green-600 hover:text-green-800 font-medium ml-4"
          >
            Giv feedback →
          </Link>
        )}
      </div>
    </div>
  )
}

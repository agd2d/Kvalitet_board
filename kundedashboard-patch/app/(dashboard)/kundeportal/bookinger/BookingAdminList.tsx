'use client'

import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'afventer', label: 'Afventer', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'planlagt', label: 'Planlagt', color: 'bg-blue-100 text-blue-800' },
  { value: 'igangværende', label: 'Igangværende', color: 'bg-purple-100 text-purple-800' },
  { value: 'afsluttet', label: 'Afsluttet', color: 'bg-green-100 text-green-800' },
]

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  scheduled_at: string | null
  created_at: string
  services: { name: string } | null
  profiles: { company_name: string | null; contact_name: string | null; phone: string | null } | null
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BookingAdminList({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initial)
  const [filter, setFilter] = useState('alle')
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(taskId: string, status: string, scheduledAt?: string) {
    setUpdating(taskId)
    const res = await fetch('/api/portal/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId, status, scheduled_at: scheduledAt || undefined }),
    })
    if (res.ok) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, scheduled_at: scheduledAt ?? t.scheduled_at } : t))
    }
    setUpdating(null)
  }

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: 'alle', label: 'Alle' }, ...STATUS_OPTIONS].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === opt.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
            <span className="ml-1.5 text-xs opacity-70">
              {opt.value === 'alle' ? tasks.length : tasks.filter(t => t.status === opt.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          Ingen ordrer i denne kategori
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(task => {
          const statusCfg = STATUS_OPTIONS.find(s => s.value === task.status)
          return (
            <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <div className="flex gap-3 mt-0.5 text-sm text-gray-500">
                    <span>{task.profiles?.company_name ?? task.profiles?.contact_name ?? '—'}</span>
                    {task.profiles?.phone && <span>📞 {task.profiles.phone}</span>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg?.color ?? 'bg-gray-100 text-gray-700'}`}>
                  {statusCfg?.label ?? task.status}
                </span>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 mb-3">{task.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                <span>Modtaget: {formatDate(task.created_at)}</span>
                {task.services && <span>Ydelse: {task.services.name}</span>}
                {task.scheduled_at && <span>Planlagt: {formatDate(task.scheduled_at)}</span>}
              </div>

              {/* Statusknapper */}
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.filter(s => s.value !== task.status).map(opt => (
                  <button
                    key={opt.value}
                    disabled={updating === task.id}
                    onClick={() => updateStatus(task.id, opt.value)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {updating === task.id ? '...' : `Sæt til: ${opt.label}`}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

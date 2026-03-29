'use client'

import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'afventer', label: 'Afventer', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'planlagt', label: 'Planlagt', color: 'bg-blue-100 text-blue-800' },
  { value: 'igangværende', label: 'Igangværende', color: 'bg-purple-100 text-purple-800' },
  { value: 'afsluttet', label: 'Afsluttet', color: 'bg-green-100 text-green-800' },
]

type Employee = { id: string; employee_name: string; employee_role: string | null }
type Task = {
  id: string; title: string; status: string; scheduled_at: string | null
  completed_at: string | null; created_at: string
  services: { name: string } | null
  profiles: { company_name: string | null; contact_name: string | null } | null
  task_employees: Employee[]
}
type Feedback = { rating: number; comment: string | null }

function Stars({ n }: { n: number }) {
  return <span className="text-yellow-400">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

export default function TaskAdminList({
  tasks: initial,
  feedbackMap,
}: {
  tasks: Task[]
  feedbackMap: Record<string, Feedback>
}) {
  const [tasks, setTasks] = useState(initial)
  const [filter, setFilter] = useState('alle')
  const [updating, setUpdating] = useState<string | null>(null)
  const [addingEmployee, setAddingEmployee] = useState<string | null>(null)
  const [empName, setEmpName] = useState('')
  const [empRole, setEmpRole] = useState('')

  async function updateStatus(id: string, status: string) {
    setUpdating(id)
    const res = await fetch('/api/portal/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    setUpdating(null)
  }

  async function addEmployee(taskId: string) {
    if (!empName.trim()) return
    const res = await fetch('/api/portal/tasks/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, employee_name: empName, employee_role: empRole || null }),
    })
    if (res.ok) {
      const { employee } = await res.json()
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, task_employees: [...t.task_employees, employee] }
          : t
      ))
    }
    setEmpName('')
    setEmpRole('')
    setAddingEmployee(null)
  }

  const filtered = filter === 'alle' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div className="space-y-4">
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

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          Ingen opgaver i denne kategori
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(task => {
          const statusCfg = STATUS_OPTIONS.find(s => s.value === task.status)
          const fb = feedbackMap[task.id]
          return (
            <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{task.profiles?.company_name ?? task.profiles?.contact_name ?? '—'}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg?.color ?? 'bg-gray-100 text-gray-700'}`}>
                  {statusCfg?.label ?? task.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                <span>Oprettet: {formatDate(task.created_at)}</span>
                {task.scheduled_at && <span>Planlagt: {formatDate(task.scheduled_at)}</span>}
                {task.completed_at && <span>Afsluttet: {formatDate(task.completed_at)}</span>}
                {task.services && <span>Ydelse: {task.services.name}</span>}
              </div>

              {/* Medarbejdere */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1.5">Medarbejdere</p>
                <div className="flex flex-wrap gap-1.5">
                  {task.task_employees.map(e => (
                    <span key={e.id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100">
                      👤 {e.employee_name}{e.employee_role ? ` – ${e.employee_role}` : ''}
                    </span>
                  ))}
                  {addingEmployee === task.id ? (
                    <div className="flex gap-1.5 flex-wrap">
                      <input value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Navn" className="border border-gray-200 rounded px-2 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      <input value={empRole} onChange={e => setEmpRole(e.target.value)} placeholder="Rolle (valgfri)" className="border border-gray-200 rounded px-2 py-0.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      <button onClick={() => addEmployee(task.id)} className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded hover:bg-blue-700">Tilføj</button>
                      <button onClick={() => setAddingEmployee(null)} className="text-xs text-gray-400 hover:text-gray-600">Annuller</button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingEmployee(task.id)} className="text-xs text-blue-600 hover:underline">+ Tilføj medarbejder</button>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {fb && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-sm">
                  <Stars n={fb.rating} />
                  {fb.comment && <p className="text-gray-600 mt-0.5 italic text-xs">"{fb.comment}"</p>}
                </div>
              )}

              {/* Statusknapper */}
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.filter(s => s.value !== task.status).map(opt => (
                  <button
                    key={opt.value}
                    disabled={updating === task.id}
                    onClick={() => updateStatus(task.id, opt.value)}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {updating === task.id ? '...' : `→ ${opt.label}`}
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

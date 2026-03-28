import { TaskStatus } from '@/lib/types'

const config: Record<TaskStatus, { label: string; classes: string }> = {
  afventer:     { label: 'Afventer',     classes: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  planlagt:     { label: 'Planlagt',     classes: 'bg-blue-100 text-blue-800 border-blue-200' },
  igangværende: { label: 'Igangværende', classes: 'bg-purple-100 text-purple-800 border-purple-200' },
  afsluttet:    { label: 'Afsluttet',    classes: 'bg-green-100 text-green-800 border-green-200' },
}

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, classes } = config[status] ?? config.afventer
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {label}
    </span>
  )
}

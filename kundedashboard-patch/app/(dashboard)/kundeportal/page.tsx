export const dynamic = 'force-dynamic'

import { createPortalAdminClient } from '@/lib/supabase/portal'
import Link from 'next/link'

function statusLabel(s: string) {
  const map: Record<string, string> = {
    afventer: 'Afventer', planlagt: 'Planlagt',
    igangværende: 'Igangværende', afsluttet: 'Afsluttet',
  }
  return map[s] ?? s
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    afventer: 'bg-yellow-100 text-yellow-800',
    planlagt: 'bg-blue-100 text-blue-800',
    igangværende: 'bg-purple-100 text-purple-800',
    afsluttet: 'bg-green-100 text-green-800',
  }
  return map[s] ?? 'bg-gray-100 text-gray-700'
}

export default async function KundeportalPage() {
  const db = createPortalAdminClient()

  const [
    { data: tasks },
    { data: messages },
    { data: newBookings },
  ] = await Promise.all([
    db.from('tasks').select('id, title, status, created_at, profiles(company_name, contact_name)').order('created_at', { ascending: false }).limit(5),
    db.from('messages').select('id, content, created_at, sender_type, task_id').eq('sender_type', 'customer').order('created_at', { ascending: false }).limit(5),
    db.from('tasks').select('id, title, created_at, profiles(company_name, contact_name)').eq('status', 'afventer').order('created_at', { ascending: false }),
  ])

  const stats = await Promise.all([
    db.from('tasks').select('id', { count: 'exact' }).eq('status', 'afventer'),
    db.from('tasks').select('id', { count: 'exact' }).eq('status', 'igangværende'),
    db.from('tasks').select('id', { count: 'exact' }).eq('status', 'planlagt'),
    db.from('task_feedback').select('rating'),
  ])

  const [afventer, igangvaerende, planlagt, feedbackRes] = stats
  const ratings = (feedbackRes.data ?? []).map((f: { rating: number }) => f.rating)
  const avgRating = ratings.length ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : '—'

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kundeportal – Overblik</h1>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nye ordrer', value: afventer.count ?? 0, color: 'text-yellow-600' },
          { label: 'Igangværende', value: igangvaerende.count ?? 0, color: 'text-purple-600' },
          { label: 'Planlagte', value: planlagt.count ?? 0, color: 'text-blue-600' },
          { label: 'Gns. rating', value: avgRating, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Nye ordrer der venter */}
      {(newBookings ?? []).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-yellow-800">Nye ordrer der venter svar</h2>
            <Link href="/kundeportal/bookinger" className="text-sm text-yellow-700 hover:underline">Se alle →</Link>
          </div>
          <div className="space-y-2">
            {(newBookings ?? []).map((b: { id: string; title: string; created_at: string; profiles: { company_name: string | null; contact_name: string | null } | null }) => (
              <Link key={b.id} href={`/kundeportal/bookinger?id=${b.id}`} className="flex items-center justify-between bg-white rounded-lg border border-yellow-100 px-4 py-2.5 hover:border-yellow-300 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.profiles?.company_name ?? b.profiles?.contact_name ?? '—'}</p>
                </div>
                <p className="text-xs text-gray-400">{formatDate(b.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Seneste opgaver */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Seneste opgaver</h2>
            <Link href="/kundeportal/opgaver" className="text-sm text-blue-600 hover:underline">Se alle →</Link>
          </div>
          <div className="space-y-2">
            {(tasks ?? []).length === 0 && <p className="text-sm text-gray-400">Ingen opgaver endnu</p>}
            {(tasks ?? []).map((t: { id: string; title: string; status: string; created_at: string; profiles: { company_name: string | null; contact_name: string | null } | null }) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.profiles?.company_name ?? '—'}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>
                  {statusLabel(t.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Seneste kundebeskeder */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Seneste kundebeskeder</h2>
            <Link href="/kundeportal/beskeder" className="text-sm text-blue-600 hover:underline">Se alle →</Link>
          </div>
          <div className="space-y-2">
            {(messages ?? []).length === 0 && <p className="text-sm text-gray-400">Ingen beskeder endnu</p>}
            {(messages ?? []).map((m: { id: string; content: string; created_at: string; task_id: string }) => (
              <Link key={m.id} href={`/kundeportal/beskeder?task=${m.task_id}`} className="block py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded">
                <p className="text-sm text-gray-700 truncate">{m.content}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(m.created_at)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

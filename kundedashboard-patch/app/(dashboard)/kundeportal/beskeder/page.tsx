export const dynamic = 'force-dynamic'

import { createPortalAdminClient } from '@/lib/supabase/portal'
import AdminChatWindow from './AdminChatWindow'

export default async function BeskederPage({
  searchParams,
}: {
  searchParams: Promise<{ task?: string }>
}) {
  const { task: taskParam } = await searchParams
  const db = createPortalAdminClient()

  const { data: tasks } = await db
    .from('tasks')
    .select('id, title, status, profiles(company_name, contact_name)')
    .order('created_at', { ascending: false })

  const activeTaskId = taskParam ?? (tasks?.[0]?.id ?? null)

  // Hent system bruger-id til admin-svar (vi bruger en fast admin sender_id)
  // Admin sender beskeder med sender_type = 'admin'
  const ADMIN_SENDER_ID = '00000000-0000-0000-0000-000000000000'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Kundebeskeder</h1>
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        {/* Opgaveliste */}
        <div className="w-60 flex-shrink-0 bg-white rounded-xl border border-gray-200 overflow-y-auto">
          <div className="px-3 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opgaver</p>
          </div>
          {(tasks ?? []).map((t: { id: string; title: string; status: string; profiles: { company_name: string | null; contact_name: string | null } | null }) => (
            <a
              key={t.id}
              href={`/kundeportal/beskeder?task=${t.id}`}
              className={`block px-3 py-2.5 text-sm border-b border-gray-50 transition-colors ${
                t.id === activeTaskId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <p className="truncate">{t.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {t.profiles?.company_name ?? t.profiles?.contact_name ?? '—'}
              </p>
            </a>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 min-w-0">
          {activeTaskId ? (
            <AdminChatWindow
              taskId={activeTaskId}
              adminSenderId={ADMIN_SENDER_ID}
              supabaseUrl={process.env.PORTAL_SUPABASE_URL!}
              supabaseAnonKey={process.env.NEXT_PUBLIC_PORTAL_ANON_KEY!}
            />
          ) : (
            <div className="h-full bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
              Vælg en opgave for at se beskeder
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

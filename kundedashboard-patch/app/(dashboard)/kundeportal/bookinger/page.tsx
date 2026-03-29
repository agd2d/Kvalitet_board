export const dynamic = 'force-dynamic'

import { createPortalAdminClient } from '@/lib/supabase/portal'
import BookingAdminList from './BookingAdminList'

export default async function BookingerPage() {
  const db = createPortalAdminClient()

  const { data: tasks } = await db
    .from('tasks')
    .select(`
      id, title, description, status, scheduled_at, created_at,
      services(name),
      profiles(company_name, contact_name, phone)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Ordrer & Bookinger</h1>
      <p className="text-gray-500 text-sm">Administrér kundeordrer – opdatér status og planlæg opgaver.</p>
      <BookingAdminList tasks={tasks ?? []} />
    </div>
  )
}

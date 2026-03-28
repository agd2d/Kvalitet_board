import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BookingForm from '@/components/BookingForm'
import { Service } from '@/lib/types'

export default async function BookingPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('name')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Book en ydelse</h1>
      <p className="text-gray-500 mb-8">
        Udfyld formularen herunder. Vi bekræfter din booking hurtigst muligt.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <BookingForm
          services={(services ?? []) as Service[]}
          userId={user.id}
        />
      </div>
    </div>
  )
}

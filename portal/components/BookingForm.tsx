'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Service } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function BookingForm({ services, userId }: { services: Service[]; userId: string }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('tasks').insert({
      customer_id: userId,
      service_id: serviceId || null,
      title,
      description: description || null,
      status: 'afventer',
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    })

    if (error) {
      setError('Noget gik galt. Prøv igen.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().slice(0, 16)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {services.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ydelse</label>
          <select
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}{s.duration_hours ? ` (ca. ${s.duration_hours} timer)` : ''}
              </option>
            ))}
          </select>
          {services.find(s => s.id === serviceId)?.description && (
            <p className="text-xs text-gray-500 mt-1">
              {services.find(s => s.id === serviceId)?.description}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Opgavebeskrivelse *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Fx: Rengøring af lager, bygning C"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Uddybende beskrivelse</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Eventuelle særlige ønsker eller oplysninger..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ønsket dato og tidspunkt</label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          min={minDateStr}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Vi bekræfter den endelige tid via beskedfunktionen</p>
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Sender booking...' : 'Send booking'}
      </button>
    </form>
  )
}

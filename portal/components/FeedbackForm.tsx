'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import RatingStars from './RatingStars'

export default function FeedbackForm({ taskId, userId }: { taskId: string; userId: string }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError('Vælg venligst et antal stjerner.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('task_feedback').insert({
      task_id: taskId,
      customer_id: userId,
      rating,
      comment: comment.trim() || null,
    })

    if (error) {
      setError('Noget gik galt. Prøv igen.')
      setLoading(false)
      return
    }

    router.push(`/booking/${taskId}`)
    router.refresh()
  }

  const ratingLabels = ['', 'Meget utilfreds', 'Utilfreds', 'Neutral', 'Tilfreds', 'Meget tilfreds']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hvor tilfreds var du med opgaven?
        </label>
        <RatingStars value={rating} onChange={setRating} />
        {rating > 0 && (
          <p className="text-sm text-gray-500 mt-2">{ratingLabels[rating]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kommentar <span className="text-gray-400 font-normal">(valgfri)</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Fortæl os hvad vi gjorde godt, eller hvad vi kan gøre bedre..."
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuller
        </button>
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Sender...' : 'Send feedback'}
        </button>
      </div>
    </form>
  )
}

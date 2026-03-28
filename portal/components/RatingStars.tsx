'use client'

interface RatingStarsProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
}

export default function RatingStars({ value, onChange, readonly = false }: RatingStarsProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          }`}
          aria-label={`${star} stjerner`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

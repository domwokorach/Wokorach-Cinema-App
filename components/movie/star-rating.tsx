'use client'

import { useState, useCallback } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value?: number
  onRate?: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function StarRating({
  value = 0,
  onRate,
  size = 'md',
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const starSize = sizeMap[size]
  const displayValue = hoverValue ?? value

  const handleMouseMove = useCallback(
    (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
      if (readOnly) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const isHalf = x < rect.width / 2
      setHoverValue(starIndex + (isHalf ? 0.5 : 1))
    },
    [readOnly]
  )

  const handleClick = useCallback(
    (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
      if (readOnly || !onRate) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const isHalf = x < rect.width / 2
      const rating = starIndex + (isHalf ? 0.5 : 1)
      onRate(rating)
    },
    [readOnly, onRate]
  )

  const handleMouseLeave = useCallback(() => {
    if (!readOnly) {
      setHoverValue(null)
    }
  }, [readOnly])

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = displayValue >= i + 1
        const halfFilled = !filled && displayValue >= i + 0.5

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            className={cn(
              'relative transition-transform',
              !readOnly && 'cursor-pointer hover:scale-110',
              readOnly && 'cursor-default'
            )}
            onMouseMove={(e) => handleMouseMove(i, e)}
            onClick={(e) => handleClick(i, e)}
          >
            {/* Background star (empty) */}
            <Star
              className={cn(starSize, 'text-zinc-600')}
              strokeWidth={1.5}
            />

            {/* Filled star overlay */}
            {(filled || halfFilled) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: halfFilled ? '50%' : '100%' }}
              >
                <Star
                  className={cn(starSize, 'fill-yellow-400 text-yellow-400')}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </button>
        )
      })}

      {/* Current rating display */}
      {displayValue > 0 && (
        <span className="ml-1 text-xs text-zinc-400">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  )
}

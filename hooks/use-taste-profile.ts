'use client'

import { useState, useCallback, useEffect } from 'react'
import type { TasteProfile, ReactionType } from '@/types/taste'

interface UseTasteProfileReturn {
  profile: TasteProfile | null
  loading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  rateMovie: (movieId: number, rating?: number, reaction?: ReactionType) => Promise<void>
}

export function useTasteProfile(): UseTasteProfileReturn {
  const [profile, setProfile] = useState<TasteProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/taste/profile')

      if (!response.ok) {
        if (response.status === 404) {
          setProfile(null)
          return
        }
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch taste profile')
      }

      const data: TasteProfile = await response.json()
      setProfile(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const rateMovie = useCallback(
    async (movieId: number, rating?: number, reaction?: ReactionType) => {
      try {
        const response = await fetch('/api/taste/rate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movie_id: movieId,
            rating,
            reaction,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to rate movie')
        }

        // Refresh profile after rating
        await fetchProfile()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(message)
        throw err
      }
    },
    [fetchProfile]
  )

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    rateMovie,
  }
}

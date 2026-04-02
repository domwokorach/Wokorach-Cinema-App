'use client'

import { useState, useCallback } from 'react'
import { useRecommendationStore } from '@/stores/recommendation-store'
import type { RecommendedMovie, RecommendResponse } from '@/types/recommendation'

interface UseRecommendationsOptions {
  mood?: string
  genre_ids?: number[]
  decade?: string
  streaming_only?: boolean
  exclude_watched?: boolean
  count?: number
}

interface UseRecommendationsReturn {
  recommendations: RecommendedMovie[]
  loading: boolean
  error: string | null
  sessionId: string
  getRecommendations: (query: string, options?: UseRecommendationsOptions) => Promise<void>
  reset: () => void
}

export function useRecommendations(): UseRecommendationsReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedMovie[]>([])
  const [sessionId, setSessionId] = useState('')

  const store = useRecommendationStore()

  const getRecommendations = useCallback(
    async (query: string, options?: UseRecommendationsOptions) => {
      setLoading(true)
      setError(null)
      store.setLoading(true)
      store.setQuery(query)

      try {
        const response = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            mood: options?.mood,
            genre_ids: options?.genre_ids,
            decade: options?.decade,
            streaming_only: options?.streaming_only ?? false,
            exclude_watched: options?.exclude_watched ?? true,
            count: options?.count ?? 5,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to get recommendations')
        }

        const data: RecommendResponse = await response.json()

        setRecommendations(data.recommendations)
        setSessionId(data.session_id)

        // Update store
        store.setRecommendations(
          data.recommendations.map((r) => ({
            id: r.tmdb_id,
            title: r.title,
            year: r.year,
            posterPath: r.poster_path,
            backdropPath: r.backdrop_path,
            overview: r.overview,
            voteAverage: r.vote_average,
            genreIds: r.genre_ids,
            reason: r.explanation,
          }))
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(message)
      } finally {
        setLoading(false)
        store.setLoading(false)
      }
    },
    [store]
  )

  const reset = useCallback(() => {
    setRecommendations([])
    setError(null)
    setSessionId('')
    store.reset()
  }, [store])

  return {
    recommendations,
    loading,
    error,
    sessionId,
    getRecommendations,
    reset,
  }
}

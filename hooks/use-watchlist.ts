'use client'

import { useState, useCallback, useEffect } from 'react'
import type { WatchlistItem } from '@/types/movie'

interface UseWatchlistReturn {
  watchlist: WatchlistItem[]
  loading: boolean
  error: string | null
  fetchWatchlist: () => Promise<void>
  addToWatchlist: (movieId: number, addedFrom?: string) => Promise<void>
  removeFromWatchlist: (id: string) => Promise<void>
  isInWatchlist: (movieId: number) => boolean
}

export function useWatchlist(): UseWatchlistReturn {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWatchlist = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/watchlist')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch watchlist')
      }

      const data = await response.json()
      setWatchlist(data.watchlist ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addToWatchlist = useCallback(
    async (movieId: number, addedFrom?: string) => {
      try {
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movie_id: movieId,
            added_from: addedFrom,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to add to watchlist')
        }

        // Refresh watchlist
        await fetchWatchlist()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(message)
        throw err
      }
    },
    [fetchWatchlist]
  )

  const removeFromWatchlist = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/watchlist/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to remove from watchlist')
        }

        // Update local state immediately
        setWatchlist((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(message)
        throw err
      }
    },
    []
  )

  const isInWatchlist = useCallback(
    (movieId: number) => {
      return watchlist.some((item) => item.movie_id === movieId)
    },
    [watchlist]
  )

  useEffect(() => {
    fetchWatchlist()
  }, [fetchWatchlist])

  return {
    watchlist,
    loading,
    error,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
  }
}

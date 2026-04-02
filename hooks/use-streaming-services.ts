'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserStreamingService } from '@/types/movie'

interface UseStreamingServicesReturn {
  services: UserStreamingService[]
  loading: boolean
  error: string | null
  fetchServices: () => Promise<void>
  updateServices: (
    providers: { id: number; name: string; logo: string }[]
  ) => Promise<void>
  hasProvider: (providerId: number) => boolean
}

export function useStreamingServices(): UseStreamingServicesReturn {
  const [services, setServices] = useState<UserStreamingService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setServices([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('user_streaming_services')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setServices(data ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateServices = useCallback(
    async (providers: { id: number; name: string; logo: string }[]) => {
      setError(null)

      try {
        const response = await fetch('/api/streaming', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider_ids: providers }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update streaming services')
        }

        // Refresh from server
        await fetchServices()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(message)
        throw err
      }
    },
    [fetchServices]
  )

  const hasProvider = useCallback(
    (providerId: number) => {
      return services.some((s) => s.provider_id === providerId)
    },
    [services]
  )

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return {
    services,
    loading,
    error,
    fetchServices,
    updateServices,
    hasProvider,
  }
}

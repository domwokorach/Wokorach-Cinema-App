import { NextRequest, NextResponse } from 'next/server'
import { getTrending } from '@/lib/tmdb/client'
import { syncMovie } from '@/lib/tmdb/sync'
import { syncWatchProviders } from '@/lib/tmdb/watch-providers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = {
      trending_synced: 0,
      providers_refreshed: 0,
      errors: [] as string[],
    }

    // Sync trending movies (2 pages = ~40 movies)
    for (const page of [1, 2]) {
      const trending = await getTrending('week', page)

      for (const movie of trending.results) {
        try {
          await syncMovie(movie.id)
          stats.trending_synced++
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          stats.errors.push(`Sync movie ${movie.id}: ${message}`)
          console.error(`Failed to sync movie ${movie.id}:`, message)
        }
      }
    }

    // Refresh watch providers for recently synced movies
    const admin = createAdminClient()
    const { data: recentMovies } = await admin
      .from('movies')
      .select('tmdb_id')
      .order('synced_at', { ascending: false })
      .limit(50)

    if (recentMovies) {
      for (const movie of recentMovies) {
        try {
          await syncWatchProviders(movie.tmdb_id, 'US')
          stats.providers_refreshed++
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          stats.errors.push(`Providers ${movie.tmdb_id}: ${message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}

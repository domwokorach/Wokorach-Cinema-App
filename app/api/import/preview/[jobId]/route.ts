import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ImportMatch } from '@/lib/import/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: job, error: jobError } = await admin
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 })
    }

    const matches = (job.preview_data as unknown as ImportMatch[]) ?? []
    const matched = matches.filter((m) => m.tmdb_id !== null)
    const unmatched = matches.filter((m) => m.tmdb_id === null)

    // Check which are already rated by looking up movie_ids
    const matchedTmdbIds = matched.map((m) => m.tmdb_id!).filter(Boolean)
    const { data: movies } = await admin
      .from('movies')
      .select('id, tmdb_id')
      .in('tmdb_id', matchedTmdbIds.length > 0 ? matchedTmdbIds : [0])

    const tmdbToMovieId = new Map((movies ?? []).map((m) => [m.tmdb_id, m.id]))
    const movieIds = (movies ?? []).map((m) => m.id)

    const { data: existingRatings } = await admin
      .from('ratings')
      .select('movie_id')
      .eq('user_id', user.id)
      .in('movie_id', movieIds.length > 0 ? movieIds : [0])

    const alreadyRatedMovieIds = new Set(
      (existingRatings ?? []).map((r) => r.movie_id)
    )

    return NextResponse.json({
      job_id: job.id,
      source: job.source,
      status: job.status,
      total: job.raw_count,
      matched: matched.map((m) => ({
        ...m,
        already_rated: alreadyRatedMovieIds.has(tmdbToMovieId.get(m.tmdb_id!) ?? 0),
      })),
      unmatched,
      already_rated_count: alreadyRatedMovieIds.size,
    })
  } catch (error) {
    console.error('Import preview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch import preview' },
      { status: 500 }
    )
  }
}

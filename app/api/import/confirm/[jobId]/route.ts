import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ratingToReaction } from '@/lib/import/parsers'
import { recomputeTasteProfile } from '@/lib/ai/taste-analyzer'
import type { ImportMatch } from '@/lib/import/types'

export async function POST(
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

    // Get import job
    const { data: job, error: jobError } = await admin
      .from('import_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 })
    }

    if (job.status === 'completed') {
      return NextResponse.json(
        { error: 'Import already completed' },
        { status: 409 }
      )
    }

    const matches = (job.preview_data as unknown as ImportMatch[]) ?? []
    const matched = matches.filter((m) => m.tmdb_id !== null && m.entry.rating !== null)

    // Get movie ids for matched tmdb_ids
    const matchedTmdbIds = matched.map((m) => m.tmdb_id!).filter(Boolean)
    const { data: movies } = await admin
      .from('movies')
      .select('id, tmdb_id')
      .in('tmdb_id', matchedTmdbIds.length > 0 ? matchedTmdbIds : [0])

    const tmdbToMovieId = new Map((movies ?? []).map((m) => [m.tmdb_id, m.id]))

    // Get existing ratings to skip
    const movieIds = (movies ?? []).map((m) => m.id)
    const { data: existingRatings } = await admin
      .from('ratings')
      .select('movie_id')
      .eq('user_id', user.id)
      .in('movie_id', movieIds.length > 0 ? movieIds : [0])

    const alreadyRatedMovieIds = new Set(
      (existingRatings ?? []).map((r) => r.movie_id)
    )

    // Prepare ratings to insert (skip already-rated)
    const ratingsToInsert = matched
      .filter((m) => {
        const movieId = tmdbToMovieId.get(m.tmdb_id!)
        return movieId && !alreadyRatedMovieIds.has(movieId)
      })
      .map((m) => ({
        user_id: user.id,
        movie_id: tmdbToMovieId.get(m.tmdb_id!)!,
        rating: m.entry.rating!,
        reaction: ratingToReaction(m.entry.rating!),
        source: job.source as 'letterboxd' | 'imdb' | 'csv',
      }))

    let imported = 0

    // Batch insert ratings
    if (ratingsToInsert.length > 0) {
      const BATCH_SIZE = 100
      for (let i = 0; i < ratingsToInsert.length; i += BATCH_SIZE) {
        const batch = ratingsToInsert.slice(i, i + BATCH_SIZE)
        const { error: insertError } = await admin
          .from('ratings')
          .upsert(batch, { onConflict: 'user_id,movie_id' })

        if (insertError) {
          console.error('Batch insert error:', insertError)
        } else {
          imported += batch.length
        }
      }
    }

    const skipped = alreadyRatedMovieIds.size

    // Update import job
    await admin
      .from('import_jobs')
      .update({
        status: 'completed' as const,
        imported_count: imported,
        skipped_count: skipped,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    // Trigger taste recomputation (fire and forget)
    recomputeTasteProfile(user.id).catch((err) =>
      console.error('Taste recomputation error after import:', err)
    )

    return NextResponse.json({
      success: true,
      imported,
      skipped,
    })
  } catch (error) {
    console.error('Import confirm error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm import' },
      { status: 500 }
    )
  }
}

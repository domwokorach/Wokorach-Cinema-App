import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const addToWatchlistSchema = z.object({
  movie_id: z.number().int().positive(),
  added_from: z.enum(['manual', 'recommendation', 'group', 'letterboxd']).optional(),
})

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: watchlist, error } = await admin
      .from('watchlist')
      .select('id, user_id, movie_id, added_from, watched, priority, notes, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Watchlist fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch watchlist' },
        { status: 500 }
      )
    }

    // Fetch movie details for watchlist items
    const movieIds = (watchlist ?? []).map((w) => w.movie_id).filter((id): id is number => id !== null)
    let movies: Record<number, { tmdb_id: number; title: string; poster_path: string | null; vote_average: number | null; runtime: number | null; genres: unknown }> = {}

    if (movieIds.length > 0) {
      const { data: movieData } = await admin
        .from('movies')
        .select('id, tmdb_id, title, poster_path, vote_average, runtime, genres')
        .in('id', movieIds)

      movies = Object.fromEntries((movieData ?? []).map((m) => [m.id, m]))
    }

    const enriched = (watchlist ?? []).map((w) => ({
      ...w,
      movie: w.movie_id ? movies[w.movie_id] ?? null : null,
    }))

    return NextResponse.json({ watchlist: enriched })
  } catch (error) {
    console.error('Watchlist error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addToWatchlistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { movie_id, added_from } = parsed.data

    const admin = createAdminClient()

    // Check if already in watchlist
    const { data: existing } = await admin
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('movie_id', movie_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Movie already in watchlist' },
        { status: 409 }
      )
    }

    const { data: item, error: insertError } = await admin
      .from('watchlist')
      .insert({
        user_id: user.id,
        movie_id,
        added_from: added_from ?? 'manual',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Watchlist insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to add to watchlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    console.error('Watchlist error:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

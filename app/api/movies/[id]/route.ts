import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMovie, getMovieCredits, getMovieKeywords } from '@/lib/tmdb/client'
import { getMovieProviders } from '@/lib/tmdb/watch-providers'
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tmdbId = parseInt(id, 10)

    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Try to fetch from database first
    const { data: cachedMovie } = await admin
      .from('movies')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .single()

    if (cachedMovie) {
      const providers = await getMovieProviders(tmdbId, 'US')
      const streaming = [
        ...providers.flatrate.map((p) => ({ ...p, monetization_type: 'flatrate' as const })),
        ...providers.rent.map((p) => ({ ...p, monetization_type: 'rent' as const })),
        ...providers.buy.map((p) => ({ ...p, monetization_type: 'buy' as const })),
      ]

      return NextResponse.json({
        ...cachedMovie,
        poster_url: getPosterUrl(cachedMovie.poster_path, 'large'),
        backdrop_url: getBackdropUrl(cachedMovie.backdrop_path, 'large'),
        streaming,
      })
    }

    // Fetch from TMDB if not cached
    const [movie, credits, keywords, providers] = await Promise.all([
      getMovie(tmdbId),
      getMovieCredits(tmdbId),
      getMovieKeywords(tmdbId),
      getMovieProviders(tmdbId, 'US'),
    ])

    const streaming = [
      ...providers.flatrate.map((p) => ({ ...p, monetization_type: 'flatrate' as const })),
      ...providers.rent.map((p) => ({ ...p, monetization_type: 'rent' as const })),
      ...providers.buy.map((p) => ({ ...p, monetization_type: 'buy' as const })),
    ]

    const result = {
      tmdb_id: movie.id,
      imdb_id: movie.imdb_id ?? null,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      tagline: movie.tagline ?? null,
      release_date: movie.release_date,
      runtime: movie.runtime,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      poster_path: movie.poster_path,
      poster_url: getPosterUrl(movie.poster_path, 'large'),
      backdrop_path: movie.backdrop_path,
      backdrop_url: getBackdropUrl(movie.backdrop_path, 'large'),
      genres: movie.genres,
      original_language: movie.original_language,
      status: movie.status,
      budget: movie.budget,
      revenue: movie.revenue,
      cast: credits.cast.slice(0, 15).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profile_path: c.profile_path,
        order: c.order,
      })),
      crew: credits.crew
        .filter((c) => ['Director', 'Screenplay', 'Writer', 'Original Music Composer'].includes(c.job))
        .map((c) => ({
          id: c.id,
          name: c.name,
          job: c.job,
          department: c.department,
          profile_path: c.profile_path,
        })),
      keywords: keywords.keywords.map((k) => k.name),
      streaming,
    }

    // Cache in database asynchronously
    admin
      .from('movies')
      .upsert(
        {
          tmdb_id: movie.id,
          imdb_id: movie.imdb_id ?? null,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          tagline: movie.tagline ?? null,
          release_date: movie.release_date || null,
          runtime: movie.runtime,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          popularity: movie.popularity,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          genres: movie.genres.map((g) => g.name),
          genre_ids: movie.genres.map((g) => g.id),
          original_language: movie.original_language,
          status: movie.status,
          budget: movie.budget,
          revenue: movie.revenue,
          synced_at: new Date().toISOString(),
        },
        { onConflict: 'tmdb_id' }
      )
      .then(() => {}, (err) => console.error('Failed to cache movie:', err))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Movie fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    )
  }
}

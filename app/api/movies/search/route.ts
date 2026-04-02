import { NextRequest, NextResponse } from 'next/server'
import { searchMovies } from '@/lib/tmdb/client'
import { getPosterUrl } from '@/lib/tmdb/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const results = await searchMovies(query.trim(), { page: 1 })

    const movies = results.results.slice(0, 10).map((movie) => ({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      poster_url: getPosterUrl(movie.poster_path, 'medium'),
      backdrop_path: movie.backdrop_path,
      genre_ids: movie.genre_ids,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
    }))

    return NextResponse.json({ results: movies })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search movies' },
      { status: 500 }
    )
  }
}

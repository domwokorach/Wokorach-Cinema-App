import { NextResponse } from 'next/server'
import { getTrending } from '@/lib/tmdb/client'
import { getPosterUrl, getBackdropUrl } from '@/lib/tmdb/types'

// Cache trending results for 1 hour
let trendingCache: { data: unknown; timestamp: number } | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET() {
  try {
    // Check in-memory cache
    if (trendingCache && Date.now() - trendingCache.timestamp < CACHE_TTL) {
      return NextResponse.json(trendingCache.data)
    }

    const results = await getTrending('week', 1)

    const movies = results.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      original_title: movie.original_title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      poster_url: getPosterUrl(movie.poster_path, 'medium'),
      backdrop_path: movie.backdrop_path,
      backdrop_url: getBackdropUrl(movie.backdrop_path, 'medium'),
      genre_ids: movie.genre_ids,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
    }))

    const responseData = { results: movies }

    // Update cache
    trendingCache = { data: responseData, timestamp: Date.now() }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Trending error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending movies' },
      { status: 500 }
    )
  }
}

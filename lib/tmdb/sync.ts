import { createAdminClient } from '@/lib/supabase/admin'
import {
  getMovie,
  getMovieCredits,
  getMovieKeywords,
  getMovieWatchProviders,
} from '@/lib/tmdb/client'
import type { TMDBMovie, TMDBCredits, TMDBKeywords, TMDBWatchProviders } from '@/lib/tmdb/types'

// ---------------------------------------------------------------------------
// Types for the combined fetch result
// ---------------------------------------------------------------------------

export interface MovieWithDetails {
  movie: TMDBMovie
  credits: TMDBCredits
  keywords: TMDBKeywords
  watchProviders: TMDBWatchProviders
}

// ---------------------------------------------------------------------------
// Fetch movie with all details in parallel
// ---------------------------------------------------------------------------

/**
 * Fetch a movie's full details, credits, keywords, and watch providers
 * from TMDB in parallel.
 */
export async function fetchMovieWithDetails(tmdbId: number): Promise<MovieWithDetails> {
  const [movie, credits, keywords, watchProviders] = await Promise.all([
    getMovie(tmdbId),
    getMovieCredits(tmdbId),
    getMovieKeywords(tmdbId),
    getMovieWatchProviders(tmdbId),
  ])

  return { movie, credits, keywords, watchProviders }
}

// ---------------------------------------------------------------------------
// Build embedding text
// ---------------------------------------------------------------------------

/**
 * Build a text representation of a movie suitable for embedding generation.
 * Combines title, overview, genres, keywords, director, and top cast into a
 * single string that captures the essence of the movie.
 */
export function buildEmbeddingText(details: MovieWithDetails): string {
  const { movie, credits, keywords } = details

  const parts: string[] = []

  // Title and tagline
  parts.push(`Title: ${movie.title}`)
  if (movie.tagline) {
    parts.push(`Tagline: ${movie.tagline}`)
  }

  // Overview
  if (movie.overview) {
    parts.push(`Overview: ${movie.overview}`)
  }

  // Genres
  if (movie.genres.length > 0) {
    parts.push(`Genres: ${movie.genres.map((g) => g.name).join(', ')}`)
  }

  // Keywords
  if (keywords.keywords.length > 0) {
    parts.push(`Keywords: ${keywords.keywords.map((k) => k.name).join(', ')}`)
  }

  // Director(s)
  const directors = credits.crew.filter((c) => c.job === 'Director')
  if (directors.length > 0) {
    parts.push(`Director: ${directors.map((d) => d.name).join(', ')}`)
  }

  // Top cast (first 5)
  const topCast = credits.cast.slice(0, 5)
  if (topCast.length > 0) {
    parts.push(`Cast: ${topCast.map((c) => c.name).join(', ')}`)
  }

  // Release year
  if (movie.release_date) {
    const year = movie.release_date.split('-')[0]
    parts.push(`Year: ${year}`)
  }

  // Language / Country
  if (movie.original_language) {
    parts.push(`Language: ${movie.original_language}`)
  }
  if (movie.production_countries.length > 0) {
    parts.push(`Countries: ${movie.production_countries.map((c) => c.name).join(', ')}`)
  }

  return parts.join('\n')
}

// ---------------------------------------------------------------------------
// Upsert movie to Supabase
// ---------------------------------------------------------------------------

/**
 * Upsert a movie and its associated metadata into the Supabase `movies` table.
 * Uses the TMDB ID as the conflict key for upsert behavior.
 */
export async function upsertMovie(details: MovieWithDetails): Promise<void> {
  const { movie, credits, keywords } = details

  // Build cast_crew JSON: directors, top cast, and notable crew combined
  const directors = credits.crew
    .filter((c) => c.job === 'Director')
    .map((d) => ({
      id: d.id,
      name: d.name,
      job: 'Director',
      department: 'Directing',
      profile_path: d.profile_path,
    }))

  const topCast = credits.cast.slice(0, 10).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character,
    profile_path: c.profile_path,
    order: c.order,
  }))

  const notableJobs = [
    'Screenplay', 'Writer', 'Story', 'Producer', 'Executive Producer',
    'Original Music Composer', 'Director of Photography',
  ]
  const notableCrew = credits.crew
    .filter((c) => notableJobs.includes(c.job))
    .map((c) => ({
      id: c.id,
      name: c.name,
      job: c.job,
      department: c.department,
      profile_path: c.profile_path,
    }))

  const castCrew = { directors, cast: topCast, crew: notableCrew }

  // Extract keyword names
  const keywordNames = keywords.keywords.map((k) => k.name)

  // Build embedding text
  const embeddingText = buildEmbeddingText(details)

  // Build the row to upsert – matches the Supabase movies table schema
  const row = {
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
    genres: movie.genres as unknown as null,
    keywords: keywordNames as unknown as null,
    cast_crew: castCrew as unknown as null,
    production_countries: movie.production_countries as unknown as null,
    original_language: movie.original_language,
    embedding_text: embeddingText,
    synced_at: new Date().toISOString(),
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('movies')
    .upsert(row, { onConflict: 'tmdb_id' })

  if (error) {
    throw new Error(`Failed to upsert movie ${movie.id} (${movie.title}): ${error.message}`)
  }
}

// ---------------------------------------------------------------------------
// Full sync of a single movie
// ---------------------------------------------------------------------------

/**
 * Complete sync of one movie: fetch all details from TMDB and upsert
 * into the Supabase database.
 *
 * Returns the fetched details for further processing if needed.
 */
export async function syncMovie(tmdbId: number): Promise<MovieWithDetails> {
  const details = await fetchMovieWithDetails(tmdbId)
  await upsertMovie(details)
  return details
}

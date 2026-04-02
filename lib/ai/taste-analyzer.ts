import { generateCompletion } from '@/lib/ai/anthropic'
import { buildTasteSummaryPrompt } from '@/lib/ai/prompts/taste-summary'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Reaction = 'loved' | 'liked' | 'meh' | 'disliked' | 'skip'

export interface Rating {
  tmdb_id: number
  rating: number // 0.5 – 5.0
  reaction?: Reaction
}

export interface MovieData {
  tmdb_id: number
  title: string
  genres: string[] | null
  release_date: string | null
  director: string | null
  keywords: string[] | null
  vote_average: number | null
}

export interface TasteProfile {
  user_id: string
  taste_vector: number[] | null
  genre_scores: Record<string, number>
  decade_scores: Record<string, number>
  director_affinities: { name: string; avg_rating: number; count: number }[]
  theme_tags: string[]
  taste_summary: string
  pacing_pref: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Reaction weight mapping
// ---------------------------------------------------------------------------

const REACTION_WEIGHTS: Record<Reaction, number> = {
  loved: 3.0,
  liked: 1.5,
  meh: 0,
  disliked: -1.0,
  skip: 0,
}

// ---------------------------------------------------------------------------
// Rating → Reaction mapping
// ---------------------------------------------------------------------------

/**
 * Map a 0.5-5.0 star rating to a reaction string.
 */
export function ratingToReaction(rating: number): Reaction {
  if (rating >= 4.5) return 'loved'
  if (rating >= 3.5) return 'liked'
  if (rating >= 2.5) return 'meh'
  if (rating >= 1.0) return 'disliked'
  return 'skip'
}

// ---------------------------------------------------------------------------
// Taste vector computation
// ---------------------------------------------------------------------------

/**
 * Compute a taste vector as the weighted average of movie embeddings based on
 * user reactions. The result is L2-normalized.
 */
export function computeTasteVector(
  ratings: Rating[],
  movieEmbeddings: Map<number, number[]>
): number[] | null {
  const dims = movieEmbeddings.values().next().value?.length
  if (!dims) return null

  const sum = new Float64Array(dims)
  let totalWeight = 0

  for (const r of ratings) {
    const embedding = movieEmbeddings.get(r.tmdb_id)
    if (!embedding) continue

    const reaction = r.reaction ?? ratingToReaction(r.rating)
    const weight = REACTION_WEIGHTS[reaction]
    if (weight === 0) continue

    for (let i = 0; i < dims; i++) {
      sum[i] += embedding[i] * weight
    }
    totalWeight += Math.abs(weight)
  }

  if (totalWeight === 0) return null

  // Average
  for (let i = 0; i < dims; i++) {
    sum[i] /= totalWeight
  }

  // L2 normalize
  let norm = 0
  for (let i = 0; i < dims; i++) {
    norm += sum[i] * sum[i]
  }
  norm = Math.sqrt(norm)

  if (norm === 0) return null

  const result: number[] = new Array(dims)
  for (let i = 0; i < dims; i++) {
    result[i] = sum[i] / norm
  }

  return result
}

// ---------------------------------------------------------------------------
// Genre score computation
// ---------------------------------------------------------------------------

/**
 * Compute genre affinity scores from rated movies.
 * Weighted frequency: each genre in a movie gets the reaction weight, then normalized.
 */
export function computeGenreScores(
  ratings: Rating[],
  movies: Map<number, MovieData>
): Record<string, number> {
  const genreScores: Record<string, number> = {}
  const genreCounts: Record<string, number> = {}

  for (const r of ratings) {
    const movie = movies.get(r.tmdb_id)
    if (!movie?.genres) continue

    const reaction = r.reaction ?? ratingToReaction(r.rating)
    const weight = REACTION_WEIGHTS[reaction]

    for (const genre of movie.genres) {
      genreScores[genre] = (genreScores[genre] ?? 0) + weight
      genreCounts[genre] = (genreCounts[genre] ?? 0) + 1
    }
  }

  // Normalize: weighted score / count to get average affinity per genre
  const result: Record<string, number> = {}
  for (const genre of Object.keys(genreScores)) {
    const count = genreCounts[genre]
    if (count > 0) {
      result[genre] = genreScores[genre] / count
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Decade score computation
// ---------------------------------------------------------------------------

/**
 * Compute era/decade preference scores.
 */
export function computeDecadeScores(
  ratings: Rating[],
  movies: Map<number, MovieData>
): Record<string, number> {
  const decadeScores: Record<string, number> = {}
  const decadeCounts: Record<string, number> = {}

  for (const r of ratings) {
    const movie = movies.get(r.tmdb_id)
    if (!movie?.release_date) continue

    const year = parseInt(movie.release_date.slice(0, 4), 10)
    if (isNaN(year)) continue

    const decade = `${Math.floor(year / 10) * 10}s`
    const reaction = r.reaction ?? ratingToReaction(r.rating)
    const weight = REACTION_WEIGHTS[reaction]

    decadeScores[decade] = (decadeScores[decade] ?? 0) + weight
    decadeCounts[decade] = (decadeCounts[decade] ?? 0) + 1
  }

  const result: Record<string, number> = {}
  for (const decade of Object.keys(decadeScores)) {
    const count = decadeCounts[decade]
    if (count > 0) {
      result[decade] = decadeScores[decade] / count
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Director affinities
// ---------------------------------------------------------------------------

/**
 * Compute director affinities: directors the user consistently rates highly.
 */
export function computeDirectorAffinities(
  ratings: Rating[],
  movies: Map<number, MovieData>
): { name: string; avg_rating: number; count: number }[] {
  const directorRatings: Record<string, { total: number; count: number }> = {}

  for (const r of ratings) {
    const movie = movies.get(r.tmdb_id)
    if (!movie?.director) continue

    if (!directorRatings[movie.director]) {
      directorRatings[movie.director] = { total: 0, count: 0 }
    }

    directorRatings[movie.director].total += r.rating
    directorRatings[movie.director].count += 1
  }

  return Object.entries(directorRatings)
    .filter(([, data]) => data.count >= 2) // Only directors with 2+ rated films
    .map(([name, data]) => ({
      name,
      avg_rating: data.total / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.avg_rating - a.avg_rating)
}

// ---------------------------------------------------------------------------
// Taste summary generation
// ---------------------------------------------------------------------------

/**
 * Use Claude to generate a natural language summary of the user's taste profile.
 */
export async function generateTasteSummary(profile: {
  genre_scores: Record<string, number>
  top_rated_movies: { title: string; year: number; rating: number }[]
  director_affinities: { name: string; avg_rating: number; count: number }[]
  theme_tags: string[]
  decade_scores: Record<string, number>
}): Promise<string> {
  const prompt = buildTasteSummaryPrompt(profile)

  const result = await generateCompletion({
    system: prompt,
    messages: [
      {
        role: 'user',
        content: 'Generate the taste profile summary now.',
      },
    ],
    model: 'claude-sonnet-4-20250514',
    maxTokens: 512,
    temperature: 0.5,
  })

  return result.text.trim()
}

// ---------------------------------------------------------------------------
// Full taste profile recomputation
// ---------------------------------------------------------------------------

/**
 * Fully recompute a user's taste profile from their ratings.
 * Fetches ratings and movie data from Supabase, computes all fields,
 * and updates the taste_profiles table.
 */
export async function recomputeTasteProfile(
  userId: string
): Promise<TasteProfile> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch user ratings
  const { data: ratingsData, error: ratingsError } = await supabase
    .from('ratings')
    .select('tmdb_id, rating')
    .eq('user_id', userId)

  if (ratingsError) {
    throw new Error(`Failed to fetch ratings: ${ratingsError.message}`)
  }

  const ratings: Rating[] = (ratingsData ?? []).map((r) => ({
    tmdb_id: r.tmdb_id,
    rating: r.rating,
    reaction: ratingToReaction(r.rating),
  }))

  if (ratings.length === 0) {
    const emptyProfile: TasteProfile = {
      user_id: userId,
      taste_vector: null,
      genre_scores: {},
      decade_scores: {},
      director_affinities: [],
      theme_tags: [],
      taste_summary: 'Not enough ratings to generate a taste profile yet.',
      pacing_pref: 'neutral',
      updated_at: new Date().toISOString(),
    }

    await supabase.from('taste_profiles').upsert(emptyProfile)
    return emptyProfile
  }

  // Fetch movie data for all rated movies
  const tmdbIds = ratings.map((r) => r.tmdb_id)
  const { data: moviesData, error: moviesError } = await supabase
    .from('movies')
    .select(
      'tmdb_id, title, genres, release_date, director, keywords, vote_average, embedding'
    )
    .in('tmdb_id', tmdbIds)

  if (moviesError) {
    throw new Error(`Failed to fetch movies: ${moviesError.message}`)
  }

  const movies = new Map<number, MovieData>()
  const movieEmbeddings = new Map<number, number[]>()

  for (const m of moviesData ?? []) {
    movies.set(m.tmdb_id, {
      tmdb_id: m.tmdb_id,
      title: m.title,
      genres: m.genres,
      release_date: m.release_date,
      director: m.director,
      keywords: m.keywords,
      vote_average: m.vote_average,
    })
    if (m.embedding) {
      movieEmbeddings.set(m.tmdb_id, m.embedding)
    }
  }

  // Compute all profile fields
  const tasteVector = computeTasteVector(ratings, movieEmbeddings)
  const genreScores = computeGenreScores(ratings, movies)
  const decadeScores = computeDecadeScores(ratings, movies)
  const directorAffinities = computeDirectorAffinities(ratings, movies)

  // Extract theme tags from frequently occurring keywords in highly-rated movies
  const themeTags = extractThemeTags(ratings, movies)

  // Determine pacing preference from genre patterns
  const pacingPref = determinePacingPref(genreScores)

  // Build top-rated movies list for summary generation
  const topRated = ratings
    .filter((r) => r.rating >= 4.0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10)
    .map((r) => {
      const movie = movies.get(r.tmdb_id)
      return {
        title: movie?.title ?? 'Unknown',
        year: movie?.release_date
          ? parseInt(movie.release_date.slice(0, 4), 10)
          : 0,
        rating: r.rating,
      }
    })

  // Generate natural language summary
  const tasteSummary = await generateTasteSummary({
    genre_scores: genreScores,
    top_rated_movies: topRated,
    director_affinities: directorAffinities,
    theme_tags: themeTags,
    decade_scores: decadeScores,
  })

  const profile: TasteProfile = {
    user_id: userId,
    taste_vector: tasteVector,
    genre_scores: genreScores,
    decade_scores: decadeScores,
    director_affinities: directorAffinities,
    theme_tags: themeTags,
    taste_summary: tasteSummary,
    pacing_pref: pacingPref,
    updated_at: new Date().toISOString(),
  }

  // Upsert to database
  const { error: upsertError } = await supabase
    .from('taste_profiles')
    .upsert(profile)

  if (upsertError) {
    throw new Error(
      `Failed to update taste profile: ${upsertError.message}`
    )
  }

  return profile
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract theme tags from keywords of highly-rated movies.
 */
function extractThemeTags(
  ratings: Rating[],
  movies: Map<number, MovieData>
): string[] {
  const keywordCounts: Record<string, number> = {}

  for (const r of ratings) {
    const movie = movies.get(r.tmdb_id)
    if (!movie?.keywords) continue

    const reaction = r.reaction ?? ratingToReaction(r.rating)
    if (reaction !== 'loved' && reaction !== 'liked') continue

    for (const keyword of movie.keywords) {
      keywordCounts[keyword] = (keywordCounts[keyword] ?? 0) + 1
    }
  }

  // Return keywords that appear in 2+ highly-rated movies
  return Object.entries(keywordCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([keyword]) => keyword)
}

/**
 * Determine pacing preference based on genre score patterns.
 */
function determinePacingPref(genreScores: Record<string, number>): string {
  const slowGenres = ['Drama', 'Documentary', 'Art House']
  const fastGenres = ['Action', 'Thriller', 'Horror']

  let slowScore = 0
  let fastScore = 0
  let slowCount = 0
  let fastCount = 0

  for (const genre of slowGenres) {
    if (genreScores[genre] !== undefined) {
      slowScore += genreScores[genre]
      slowCount++
    }
  }

  for (const genre of fastGenres) {
    if (genreScores[genre] !== undefined) {
      fastScore += genreScores[genre]
      fastCount++
    }
  }

  const avgSlow = slowCount > 0 ? slowScore / slowCount : 0
  const avgFast = fastCount > 0 ? fastScore / fastCount : 0

  if (avgSlow > avgFast + 0.5) return 'slow'
  if (avgFast > avgSlow + 0.5) return 'fast'
  return 'mixed'
}

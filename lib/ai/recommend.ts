import { generateJSON, generateCompletion } from '@/lib/ai/anthropic'
import { generateQueryEmbedding } from '@/lib/ai/embeddings'
import { buildRecommendSystemPrompt } from '@/lib/ai/prompts/recommend'
import {
  validateRecommendations,
  backfillRecommendations,
  sanitizeExplanation,
} from '@/lib/ai/validators'
import type { RecommendationItem, CandidateMovie } from '@/lib/ai/validators'
import type { TasteProfile } from '@/lib/ai/taste-analyzer'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedQuery {
  original: string
  mood: string | null
  themes: string[]
  visual_style: string | null
  time_constraint: number | null
  social_context: string | null
  genre_hints: string[]
  era_hint: string | null
  exclude_patterns: string[]
}

export interface RecommendationCandidate {
  tmdb_id: number
  title: string
  year: number
  overview: string
  genres: string[]
  director: string | null
  vote_average: number
  runtime: number | null
  similarity: number
  streaming_providers?: string[]
}

export interface RecommendationResult {
  tmdb_id: number
  title: string
  year: number
  explanation: string
  confidence: number
  match_reasons: string[]
}

export interface RecommendOptions {
  query: string
  userId: string
  tasteProfile: TasteProfile
  count?: number
  streamingProviders?: string[]
  maxRuntime?: number
  excludeRated?: boolean
  minTmdbRating?: number
}

// ---------------------------------------------------------------------------
// Step 1: Parse query with Claude Haiku
// ---------------------------------------------------------------------------

/**
 * Use Claude Haiku to extract structured signals from a natural language query.
 */
export async function parseQuery(query: string): Promise<ParsedQuery> {
  const { data } = await generateJSON<Omit<ParsedQuery, 'original'>>({
    system: `You are a query parser for a movie recommendation engine. Extract structured signals from the user's natural language query.

Extract the following fields:
- mood: The emotional state or desired feeling (e.g., "uplifting", "dark", "cozy", "thrilling"). Null if not specified.
- themes: Array of thematic elements mentioned (e.g., ["revenge", "family", "coming-of-age"]). Empty array if none.
- visual_style: Any visual or stylistic preferences (e.g., "noir", "colorful", "minimalist"). Null if not specified.
- time_constraint: If the user mentions available time, the number of minutes. Null if not specified.
- social_context: Who they're watching with (e.g., "date night", "family", "alone", "friends"). Null if not specified.
- genre_hints: Any genres mentioned or implied (e.g., ["horror", "comedy"]). Empty array if none.
- era_hint: Preferred era if mentioned (e.g., "80s", "modern", "classic"). Null if not specified.
- exclude_patterns: Things they want to avoid (e.g., ["violence", "jump scares"]). Empty array if none.`,
    prompt: query,
    model: 'claude-haiku-4-20250514',
    maxTokens: 1024,
  })

  return {
    original: query,
    ...data,
  }
}

// ---------------------------------------------------------------------------
// Step 2: Vector search via pgvector
// ---------------------------------------------------------------------------

/**
 * Run cosine similarity search using pgvector via a Supabase RPC function.
 */
export async function vectorSearch(
  queryEmbedding: number[],
  limit: number = 100
): Promise<RecommendationCandidate[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.rpc('match_movies', {
    query_embedding: queryEmbedding,
    match_threshold: 0.3,
    match_count: limit,
  })

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`)
  }

  return (data ?? []).map(
    (row: {
      tmdb_id: number
      title: string
      release_date: string | null
      overview: string | null
      genres: string[] | null
      director: string | null
      vote_average: number | null
      runtime: number | null
      similarity: number
      streaming_providers: string[] | null
    }) => ({
      tmdb_id: row.tmdb_id,
      title: row.title,
      year: row.release_date
        ? parseInt(row.release_date.slice(0, 4), 10)
        : 0,
      overview: row.overview ?? '',
      genres: row.genres ?? [],
      director: row.director ?? null,
      vote_average: row.vote_average ?? 0,
      runtime: row.runtime ?? null,
      similarity: row.similarity,
      streaming_providers: row.streaming_providers ?? undefined,
    })
  )
}

// ---------------------------------------------------------------------------
// Step 3: Apply filters
// ---------------------------------------------------------------------------

/**
 * Filter candidates based on streaming availability, runtime, already-rated, and minimum rating.
 */
export function applyFilters(
  candidates: RecommendationCandidate[],
  options: {
    streamingProviders?: string[]
    maxRuntime?: number
    ratedTmdbIds?: Set<number>
    minTmdbRating?: number
  }
): RecommendationCandidate[] {
  let filtered = [...candidates]

  // Filter by streaming provider
  if (options.streamingProviders && options.streamingProviders.length > 0) {
    filtered = filtered.filter((c) => {
      if (!c.streaming_providers || c.streaming_providers.length === 0)
        return false
      return c.streaming_providers.some((p) =>
        options.streamingProviders!.includes(p)
      )
    })
  }

  // Filter by runtime
  if (options.maxRuntime) {
    filtered = filtered.filter(
      (c) => !c.runtime || c.runtime <= options.maxRuntime!
    )
  }

  // Exclude already-rated movies
  if (options.ratedTmdbIds && options.ratedTmdbIds.size > 0) {
    filtered = filtered.filter((c) => !options.ratedTmdbIds!.has(c.tmdb_id))
  }

  // Filter by minimum TMDB rating
  if (options.minTmdbRating) {
    filtered = filtered.filter(
      (c) => c.vote_average >= options.minTmdbRating!
    )
  }

  return filtered
}

// ---------------------------------------------------------------------------
// Step 4: LLM reasoning with Claude Sonnet
// ---------------------------------------------------------------------------

/**
 * Send filtered candidates to Claude Sonnet for final selection and explanation generation.
 */
export async function llmReason(
  candidates: RecommendationCandidate[],
  tasteProfile: TasteProfile,
  parsedQuery: ParsedQuery,
  count: number
): Promise<RecommendationItem[]> {
  // Build candidate list JSON for the prompt
  const candidateListJson = JSON.stringify(
    candidates.map((c) => ({
      tmdb_id: c.tmdb_id,
      title: c.title,
      year: c.year,
      overview: c.overview,
      genres: c.genres,
      director: c.director,
      vote_average: c.vote_average,
      runtime: c.runtime,
      similarity: c.similarity,
    })),
    null,
    2
  )

  const systemPrompt = buildRecommendSystemPrompt({
    taste_summary: tasteProfile.taste_summary,
    genre_scores: tasteProfile.genre_scores,
    theme_tags: tasteProfile.theme_tags,
    pacing_pref: tasteProfile.pacing_pref,
    query: parsedQuery.original,
    mood: parsedQuery.mood,
    watching_with: parsedQuery.social_context,
    time_available: parsedQuery.time_constraint,
    count,
    candidate_list_json: candidateListJson,
  })

  const { data } = await generateJSON<RecommendationItem[]>({
    system: systemPrompt,
    prompt: `Select the best ${count} films from the candidate list and provide personalized explanations.`,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
  })

  return data
}

// ---------------------------------------------------------------------------
// Step 5: Validate
// ---------------------------------------------------------------------------

/**
 * Verify every tmdb_id in the recommendations exists in the candidate pool.
 */
export function validate(
  recommendations: RecommendationItem[],
  candidateIds: Set<number>
): RecommendationItem[] {
  const { valid } = validateRecommendations(recommendations, candidateIds)
  return valid
}

// ---------------------------------------------------------------------------
// Full pipeline orchestrator
// ---------------------------------------------------------------------------

/**
 * Run the complete 5-step recommendation pipeline:
 * 1. Parse query (extract signals with Haiku)
 * 2. Vector search (pgvector cosine similarity)
 * 3. Apply filters (streaming, runtime, rated, rating)
 * 4. LLM reasoning (Claude Sonnet selection + explanations)
 * 5. Validate (anti-hallucination check)
 */
export async function recommend(
  params: RecommendOptions
): Promise<RecommendationResult[]> {
  const {
    query,
    userId,
    tasteProfile,
    count = 5,
    streamingProviders,
    maxRuntime,
    excludeRated = true,
    minTmdbRating,
  } = params

  // Step 1: Parse the query
  const parsedQuery = await parseQuery(query)

  // Apply time constraint from query if maxRuntime not explicitly set
  const effectiveMaxRuntime =
    maxRuntime ?? parsedQuery.time_constraint ?? undefined

  // Step 2: Vector search
  const queryEmbedding = await generateQueryEmbedding(
    query,
    tasteProfile.taste_summary
  )
  const rawCandidates = await vectorSearch(queryEmbedding, 100)

  // Fetch user's rated movie IDs if needed
  let ratedTmdbIds: Set<number> | undefined
  if (excludeRated) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data: ratedData } = await supabase
      .from('ratings')
      .select('tmdb_id')
      .eq('user_id', userId)

    ratedTmdbIds = new Set((ratedData ?? []).map((r) => r.tmdb_id))
  }

  // Step 3: Apply filters
  const filteredCandidates = applyFilters(rawCandidates, {
    streamingProviders,
    maxRuntime: effectiveMaxRuntime,
    ratedTmdbIds,
    minTmdbRating,
  })

  // Ensure we have enough candidates
  if (filteredCandidates.length === 0) {
    return []
  }

  // Take top candidates for LLM reasoning (limit to save tokens)
  const topCandidates = filteredCandidates.slice(0, Math.min(50, filteredCandidates.length))

  // Step 4: LLM reasoning
  const llmResults = await llmReason(
    topCandidates,
    tasteProfile,
    parsedQuery,
    count
  )

  // Step 5: Validate
  const candidateIds = new Set(topCandidates.map((c) => c.tmdb_id))
  const validResults = validate(llmResults, candidateIds)

  // Backfill if we lost recommendations due to hallucination
  const candidateMovies: CandidateMovie[] = topCandidates.map((c) => ({
    tmdb_id: c.tmdb_id,
    title: c.title,
    year: c.year,
    similarity: c.similarity,
  }))

  const finalResults = backfillRecommendations(
    validResults,
    candidateMovies,
    count
  )

  // Sanitize explanations
  return finalResults.map((r) => ({
    tmdb_id: r.tmdb_id,
    title: r.title,
    year: r.year,
    explanation: sanitizeExplanation(r.explanation),
    confidence: r.confidence,
    match_reasons: r.match_reasons,
  }))
}

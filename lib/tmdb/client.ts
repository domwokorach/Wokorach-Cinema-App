import type {
  TMDBMovie,
  TMDBCredits,
  TMDBKeywords,
  TMDBWatchProviders,
  TMDBSearchResult,
  TMDBDiscoverResult,
  TMDBFindResult,
  TMDBGenre,
  TMDBProviderListResult,
  TMDBSearchMovie,
} from '@/lib/tmdb/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY
  if (!key) {
    throw new Error('Missing TMDB_API_KEY environment variable')
  }
  return key
}

// ---------------------------------------------------------------------------
// In-memory cache with TTL
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>()
  private defaultTTL: number

  constructor(defaultTTLMs: number = 10 * 60 * 1000) {
    this.defaultTTL = defaultTTLMs
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return undefined
    }
    return entry.data as T
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
    })
  }

  clear(): void {
    this.store.clear()
  }

  get size(): number {
    return this.store.size
  }
}

// ---------------------------------------------------------------------------
// Rate limiter – token-bucket style (max 40 req/s to stay under TMDB's 50/s)
// ---------------------------------------------------------------------------

class RateLimiter {
  private tokens: number
  private maxTokens: number
  private refillRate: number // tokens per ms
  private lastRefill: number

  constructor(maxRequestsPerSecond: number = 40) {
    this.maxTokens = maxRequestsPerSecond
    this.tokens = maxRequestsPerSecond
    this.refillRate = maxRequestsPerSecond / 1000
    this.lastRefill = Date.now()
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate)
    this.lastRefill = now
  }

  async acquire(): Promise<void> {
    this.refill()
    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }
    // Wait until a token is available
    const waitMs = Math.ceil((1 - this.tokens) / this.refillRate)
    await new Promise((resolve) => setTimeout(resolve, waitMs))
    this.refill()
    this.tokens -= 1
  }
}

// ---------------------------------------------------------------------------
// Shared instances
// ---------------------------------------------------------------------------

const cache = new TTLCache(10 * 60 * 1000) // 10-minute default TTL
const rateLimiter = new RateLimiter(40)

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

export class TMDBError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
  ) {
    super(message)
    this.name = 'TMDBError'
  }
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  cacheTTL?: number,
): Promise<T> {
  const apiKey = getApiKey()

  // Build URL
  const url = new URL(`${TMDB_BASE_URL}${path}`)
  url.searchParams.set('api_key', apiKey)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  // Check cache
  const cacheKey = url.toString()
  const cached = cache.get<T>(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // Rate limit
  await rateLimiter.acquire()

  // Fetch
  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new TMDBError(
      `TMDB API error ${response.status}: ${response.statusText} – ${body}`,
      response.status,
      response.statusText,
    )
  }

  const data = (await response.json()) as T

  // Store in cache
  cache.set(cacheKey, data, cacheTTL)

  return data
}

// ---------------------------------------------------------------------------
// Public API methods
// ---------------------------------------------------------------------------

/**
 * Get full movie details by TMDB ID.
 */
export async function getMovie(movieId: number): Promise<TMDBMovie> {
  return tmdbFetch<TMDBMovie>(`/movie/${movieId}`)
}

/**
 * Get cast and crew credits for a movie.
 */
export async function getMovieCredits(movieId: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${movieId}/credits`)
}

/**
 * Get keywords associated with a movie.
 */
export async function getMovieKeywords(movieId: number): Promise<TMDBKeywords> {
  return tmdbFetch<TMDBKeywords>(`/movie/${movieId}/keywords`)
}

/**
 * Get watch/streaming providers for a movie.
 * Data provided by JustWatch via TMDB.
 */
export async function getMovieWatchProviders(movieId: number): Promise<TMDBWatchProviders> {
  return tmdbFetch<TMDBWatchProviders>(`/movie/${movieId}/watch/providers`)
}

/**
 * Search movies by query string.
 */
export async function searchMovies(
  query: string,
  options: {
    page?: number
    year?: number
    language?: string
    region?: string
    include_adult?: boolean
  } = {},
): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>('/search/movie', {
    query,
    page: options.page ?? 1,
    year: options.year,
    language: options.language ?? 'en-US',
    region: options.region,
    include_adult: options.include_adult ? 'true' : undefined,
  } as Record<string, string | number | undefined>)
}

/**
 * Discover movies with various filters.
 */
export async function discoverMovies(
  options: {
    page?: number
    sort_by?: string
    'vote_count.gte'?: number
    'vote_average.gte'?: number
    with_genres?: string
    with_watch_providers?: string
    watch_region?: string
    language?: string
    year?: number
    primary_release_year?: number
    'primary_release_date.gte'?: string
    'primary_release_date.lte'?: string
    with_original_language?: string
  } = {},
): Promise<TMDBDiscoverResult> {
  const params: Record<string, string | number | undefined> = {
    page: options.page ?? 1,
    sort_by: options.sort_by ?? 'popularity.desc',
    language: options.language ?? 'en-US',
  }

  // Pass through all supported filter params
  if (options['vote_count.gte'] !== undefined) params['vote_count.gte'] = options['vote_count.gte']
  if (options['vote_average.gte'] !== undefined) params['vote_average.gte'] = options['vote_average.gte']
  if (options.with_genres) params.with_genres = options.with_genres
  if (options.with_watch_providers) params.with_watch_providers = options.with_watch_providers
  if (options.watch_region) params.watch_region = options.watch_region
  if (options.year) params.year = options.year
  if (options.primary_release_year) params.primary_release_year = options.primary_release_year
  if (options['primary_release_date.gte']) params['primary_release_date.gte'] = options['primary_release_date.gte']
  if (options['primary_release_date.lte']) params['primary_release_date.lte'] = options['primary_release_date.lte']
  if (options.with_original_language) params.with_original_language = options.with_original_language

  return tmdbFetch<TMDBDiscoverResult>('/discover/movie', params)
}

/**
 * Get trending movies for a given time window.
 */
export async function getTrending(
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1,
): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/trending/movie/${timeWindow}`, {
    page,
    language: 'en-US',
  })
}

/**
 * Find a movie by an external ID (e.g. IMDb ID).
 */
export async function findByExternalId(
  externalId: string,
  source: 'imdb_id' | 'tvdb_id' | 'facebook_id' | 'instagram_id' | 'twitter_id' = 'imdb_id',
): Promise<TMDBFindResult> {
  return tmdbFetch<TMDBFindResult>(`/find/${externalId}`, {
    external_source: source,
  })
}

/**
 * Get the official list of movie genres.
 */
export async function getGenres(language: string = 'en-US'): Promise<TMDBGenre[]> {
  const result = await tmdbFetch<{ genres: TMDBGenre[] }>('/genre/movie/list', {
    language,
  })
  return result.genres
}

/**
 * Get the list of available streaming/watch providers.
 */
export async function getAvailableProviders(
  watchRegion: string = 'US',
): Promise<TMDBProviderListResult> {
  return tmdbFetch<TMDBProviderListResult>('/watch/providers/movie', {
    watch_region: watchRegion,
    language: 'en-US',
  })
}

/**
 * Clear the in-memory cache (useful for testing or manual refresh).
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Convenience: fetch a batch of search-result movies as full TMDBMovie objects.
 * Respects rate limits automatically.
 */
export async function getMoviesBatch(movieIds: number[]): Promise<TMDBMovie[]> {
  const results: TMDBMovie[] = []
  for (const id of movieIds) {
    try {
      const movie = await getMovie(id)
      results.push(movie)
    } catch (error) {
      console.error(`Failed to fetch movie ${id}:`, error)
    }
  }
  return results
}

/**
 * Convenience: resolve genre IDs (from search results) to names.
 */
export function resolveGenreIds(
  genreIds: number[],
  genreMap: Record<number, string>,
): string[] {
  return genreIds
    .map((id) => genreMap[id])
    .filter((name): name is string => name !== undefined)
}

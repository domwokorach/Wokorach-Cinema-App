import { createAdminClient } from '@/lib/supabase/admin'
import { getMovieWatchProviders, getAvailableProviders } from '@/lib/tmdb/client'
import type { TMDBCountryProviders, TMDBProvider } from '@/lib/tmdb/types'

// ---------------------------------------------------------------------------
// Major US streaming provider IDs (TMDB / JustWatch IDs)
// ---------------------------------------------------------------------------

export const US_PROVIDER_IDS = {
  NETFLIX: 8,
  AMAZON_PRIME: 9,
  HULU: 15,
  DISNEY_PLUS: 337,
  APPLE_TV_PLUS: 350,
  PEACOCK: 386,
  PARAMOUNT_PLUS: 531,
  HBO_MAX: 1899,
} as const

export const MAJOR_US_PROVIDER_IDS = Object.values(US_PROVIDER_IDS)

// ---------------------------------------------------------------------------
// Get watch providers for a movie in a specific country
// ---------------------------------------------------------------------------

export interface MovieProviders {
  tmdbId: number
  country: string
  link: string | null
  flatrate: TMDBProvider[]
  rent: TMDBProvider[]
  buy: TMDBProvider[]
  free: TMDBProvider[]
  ads: TMDBProvider[]
}

/**
 * Get streaming/purchase availability for a movie in a specific country.
 * Returns a structured object with providers grouped by availability type.
 */
export async function getMovieProviders(
  tmdbId: number,
  country: string = 'US',
): Promise<MovieProviders> {
  const data = await getMovieWatchProviders(tmdbId)
  const countryData: TMDBCountryProviders | undefined = data.results?.[country]

  return {
    tmdbId,
    country,
    link: countryData?.link ?? null,
    flatrate: countryData?.flatrate ?? [],
    rent: countryData?.rent ?? [],
    buy: countryData?.buy ?? [],
    free: countryData?.free ?? [],
    ads: countryData?.ads ?? [],
  }
}

// ---------------------------------------------------------------------------
// Get the master list of available providers for a country
// ---------------------------------------------------------------------------

export interface ProviderInfo {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

/**
 * Get the master list of streaming providers available in a given country.
 * Optionally filter to only major providers.
 */
export async function getAvailableProvidersList(
  country: string = 'US',
  options: { majorOnly?: boolean } = {},
): Promise<ProviderInfo[]> {
  const data = await getAvailableProviders(country)

  let providers = data.results.map((p) => ({
    provider_id: p.provider_id,
    provider_name: p.provider_name,
    logo_path: p.logo_path,
    display_priority: p.display_priorities?.[country] ?? 999,
  }))

  if (options.majorOnly) {
    providers = providers.filter((p) =>
      MAJOR_US_PROVIDER_IDS.includes(p.provider_id as (typeof MAJOR_US_PROVIDER_IDS)[number]),
    )
  }

  // Sort by display priority (lower = higher priority)
  providers.sort((a, b) => a.display_priority - b.display_priority)

  return providers
}

// ---------------------------------------------------------------------------
// Sync watch providers to database
// ---------------------------------------------------------------------------

/**
 * Sync watch provider data for a movie into the database.
 * Looks up the movie's internal ID from the movies table, then upserts
 * individual provider rows into the watch_providers table.
 */
export async function syncWatchProviders(
  tmdbId: number,
  country: string = 'US',
): Promise<MovieProviders> {
  const providers = await getMovieProviders(tmdbId, country)
  const supabase = createAdminClient()

  // Look up internal movie_id from the movies table
  const { data: movieRow, error: lookupError } = await supabase
    .from('movies')
    .select('id')
    .eq('tmdb_id', tmdbId)
    .single()

  if (lookupError || !movieRow) {
    console.warn(
      `Movie with tmdb_id ${tmdbId} not found in movies table, skipping watch provider sync.`,
    )
    return providers
  }

  const movieId = movieRow.id

  // Build individual provider rows for each monetization type
  type MonetizationType = 'flatrate' | 'rent' | 'buy' | 'free' | 'ads'
  const monetizationTypes: MonetizationType[] = ['flatrate', 'rent', 'buy', 'free', 'ads']

  const rows: {
    movie_id: number
    country_code: string
    provider_id: number
    provider_name: string
    provider_logo: string | null
    monetization: MonetizationType
    tmdb_link: string | null
    synced_at: string
  }[] = []

  const now = new Date().toISOString()

  for (const type of monetizationTypes) {
    for (const provider of providers[type]) {
      rows.push({
        movie_id: movieId,
        country_code: country,
        provider_id: provider.provider_id,
        provider_name: provider.provider_name,
        provider_logo: provider.logo_path,
        monetization: type,
        tmdb_link: providers.link,
        synced_at: now,
      })
    }
  }

  if (rows.length === 0) {
    return providers
  }

  // Delete existing providers for this movie + country, then insert fresh
  const { error: deleteError } = await supabase
    .from('watch_providers')
    .delete()
    .eq('movie_id', movieId)
    .eq('country_code', country)

  if (deleteError) {
    console.warn(
      `Failed to delete old watch providers for movie ${tmdbId}:`,
      deleteError.message,
    )
  }

  const { error: insertError } = await supabase
    .from('watch_providers')
    .insert(rows)

  if (insertError) {
    console.warn(
      `Failed to insert watch providers for movie ${tmdbId}:`,
      insertError.message,
    )
  }

  return providers
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a movie is available on a specific streaming provider in a country.
 */
export async function isAvailableOn(
  tmdbId: number,
  providerId: number,
  country: string = 'US',
): Promise<boolean> {
  const providers = await getMovieProviders(tmdbId, country)
  return providers.flatrate.some((p) => p.provider_id === providerId)
}

/**
 * Get the names of streaming services where a movie is available (flatrate).
 */
export async function getStreamingServiceNames(
  tmdbId: number,
  country: string = 'US',
): Promise<string[]> {
  const providers = await getMovieProviders(tmdbId, country)
  return providers.flatrate.map((p) => p.provider_name)
}

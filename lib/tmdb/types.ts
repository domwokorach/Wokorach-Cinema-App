export interface TMDBMovie {
  id: number
  imdb_id?: string
  title: string
  original_title: string
  overview: string
  tagline?: string
  release_date: string
  runtime: number | null
  vote_average: number
  vote_count: number
  popularity: number
  poster_path: string | null
  backdrop_path: string | null
  genres: { id: number; name: string }[]
  production_countries: { iso_3166_1: string; name: string }[]
  original_language: string
  status: string
  budget: number
  revenue: number
}

export interface TMDBCredits {
  id: number
  cast: TMDBCastMember[]
  crew: TMDBCrewMember[]
}

export interface TMDBCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface TMDBCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TMDBKeywords {
  id: number
  keywords: { id: number; name: string }[]
}

export interface TMDBWatchProviders {
  id: number
  results: Record<string, TMDBCountryProviders>
}

export interface TMDBCountryProviders {
  link: string
  flatrate?: TMDBProvider[]
  rent?: TMDBProvider[]
  buy?: TMDBProvider[]
  free?: TMDBProvider[]
  ads?: TMDBProvider[]
}

export interface TMDBProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

export interface TMDBSearchResult {
  page: number
  results: TMDBSearchMovie[]
  total_pages: number
  total_results: number
}

export interface TMDBSearchMovie {
  id: number
  title: string
  original_title: string
  overview: string
  release_date: string
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
  vote_average: number
  vote_count: number
  popularity: number
  original_language: string
}

export interface TMDBDiscoverResult {
  page: number
  results: TMDBSearchMovie[]
  total_pages: number
  total_results: number
}

export interface TMDBFindResult {
  movie_results: TMDBSearchMovie[]
  tv_results: unknown[]
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBProviderListResult {
  results: {
    provider_id: number
    provider_name: string
    logo_path: string
    display_priorities: Record<string, number>
  }[]
}

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
export const TMDB_POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original',
} as const
export const TMDB_BACKDROP_SIZES = {
  small: 'w300',
  medium: 'w780',
  large: 'w1280',
  original: 'original',
} as const

export function getPosterUrl(path: string | null, size: keyof typeof TMDB_POSTER_SIZES = 'medium'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${TMDB_POSTER_SIZES[size]}${path}`
}

export function getBackdropUrl(path: string | null, size: keyof typeof TMDB_BACKDROP_SIZES = 'medium'): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${TMDB_BACKDROP_SIZES[size]}${path}`
}

// TMDB genre ID to name mapping
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
}

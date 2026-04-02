export interface Movie {
  id: string
  tmdb_id: number
  imdb_id: string | null
  title: string
  original_title: string
  overview: string
  tagline: string | null
  release_date: string
  runtime: number | null
  vote_average: number
  vote_count: number
  popularity: number
  poster_path: string | null
  backdrop_path: string | null
  genres: Genre[]
  original_language: string
  status: string
  budget: number | null
  revenue: number | null
  created_at: string
  updated_at: string
}

export interface Genre {
  id: number
  name: string
}

export interface StreamingProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  monetization_type: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads'
}

export interface MovieWithStreaming extends Movie {
  streaming: StreamingProvider[]
}

export interface MovieSearchResult {
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
}

export interface MovieDetail extends Movie {
  streaming: StreamingProvider[]
  cast: CastMember[]
  crew: CrewMember[]
  keywords: string[]
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface WatchlistItem {
  id: string
  user_id: string
  movie_id: number
  added_from: string | null
  created_at: string
  movie?: Movie
}

export interface UserStreamingService {
  id: number
  user_id: string | null
  provider_id: number
  provider_name: string
  provider_logo: string | null
  created_at: string
}

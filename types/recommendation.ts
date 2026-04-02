import type { StreamingProvider } from './movie'

export interface RecommendRequest {
  query: string
  mood?: string
  genre_ids?: number[]
  decade?: string
  streaming_only?: boolean
  exclude_watched?: boolean
  count?: number
}

export interface RecommendedMovie {
  tmdb_id: number
  title: string
  year: number
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  vote_average: number
  runtime: number | null
  genre_ids: number[]
  match_score: number
  explanation: string
  streaming: StreamingProvider[]
}

export interface RecommendResponse {
  recommendations: RecommendedMovie[]
  session_id: string
  query: string
  model: string
  tokens_used: number
}

export interface RecommendationLog {
  id: string
  user_id: string
  query: string
  mood: string | null
  recommendations: RecommendedMovie[]
  model: string
  tokens_used: number
  session_id: string
  created_at: string
}

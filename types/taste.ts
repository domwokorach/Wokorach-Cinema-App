export interface TasteProfile {
  id: number
  user_id: string
  taste_vector: number[] | null
  genre_scores: Record<string, number> | null
  decade_scores: Record<string, number> | null
  director_affinities: { director: string; score: number }[] | null
  theme_tags: string[] | null
  pacing_pref: string | null
  mood_history: Record<string, unknown>[] | null
  total_ratings: number
  profile_summary: string | null
  computed_at: string
}

export interface Rating {
  id: number
  user_id: string
  movie_id: number
  rating: number | null
  reaction: ReactionType | null
  source: RatingSource
  created_at: string
  updated_at: string
}

export type ReactionType = 'loved' | 'liked' | 'meh' | 'disliked' | 'skip'

export type RatingSource = 'onboarding' | 'manual' | 'recommendation' | 'watchlist' | 'letterboxd' | 'imdb' | 'csv'

export interface RateMovieRequest {
  movie_id: number
  rating?: number
  reaction?: ReactionType
}

export interface TasteVector {
  genre_scores: Record<string, number>
  decade_scores: Record<string, number>
  theme_tags: string[]
  total_ratings: number
}

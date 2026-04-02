export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          onboarding_done: boolean
          plan: 'free' | 'pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          daily_rec_count: number
          daily_rec_reset: string
          country_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          onboarding_done?: boolean
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          daily_rec_count?: number
          daily_rec_reset?: string
          country_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          onboarding_done?: boolean
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          daily_rec_count?: number
          daily_rec_reset?: string
          country_code?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      movies: {
        Row: {
          id: number
          tmdb_id: number
          imdb_id: string | null
          title: string
          original_title: string | null
          overview: string | null
          tagline: string | null
          release_date: string | null
          runtime: number | null
          vote_average: number | null
          vote_count: number | null
          popularity: number | null
          poster_path: string | null
          backdrop_path: string | null
          genres: Json | null
          keywords: Json | null
          cast_crew: Json | null
          production_countries: Json | null
          original_language: string | null
          embedding: string | null
          embedding_text: string | null
          synced_at: string
          created_at: string
        }
        Insert: {
          id?: number
          tmdb_id: number
          imdb_id?: string | null
          title: string
          original_title?: string | null
          overview?: string | null
          tagline?: string | null
          release_date?: string | null
          runtime?: number | null
          vote_average?: number | null
          vote_count?: number | null
          popularity?: number | null
          poster_path?: string | null
          backdrop_path?: string | null
          genres?: Json | null
          keywords?: Json | null
          cast_crew?: Json | null
          production_countries?: Json | null
          original_language?: string | null
          embedding?: string | null
          embedding_text?: string | null
          synced_at?: string
          created_at?: string
        }
        Update: {
          id?: number
          tmdb_id?: number
          imdb_id?: string | null
          title?: string
          original_title?: string | null
          overview?: string | null
          tagline?: string | null
          release_date?: string | null
          runtime?: number | null
          vote_average?: number | null
          vote_count?: number | null
          popularity?: number | null
          poster_path?: string | null
          backdrop_path?: string | null
          genres?: Json | null
          keywords?: Json | null
          cast_crew?: Json | null
          production_countries?: Json | null
          original_language?: string | null
          embedding?: string | null
          embedding_text?: string | null
          synced_at?: string
          created_at?: string
        }
        Relationships: []
      }
      watch_providers: {
        Row: {
          id: number
          movie_id: number | null
          country_code: string
          provider_id: number
          provider_name: string
          provider_logo: string | null
          monetization: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads' | null
          tmdb_link: string | null
          synced_at: string
        }
        Insert: {
          id?: number
          movie_id?: number | null
          country_code: string
          provider_id: number
          provider_name: string
          provider_logo?: string | null
          monetization?: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads' | null
          tmdb_link?: string | null
          synced_at?: string
        }
        Update: {
          id?: number
          movie_id?: number | null
          country_code?: string
          provider_id?: number
          provider_name?: string
          provider_logo?: string | null
          monetization?: 'flatrate' | 'rent' | 'buy' | 'free' | 'ads' | null
          tmdb_link?: string | null
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'watch_providers_movie_id_fkey'
            columns: ['movie_id']
            isOneToOne: false
            referencedRelation: 'movies'
            referencedColumns: ['id']
          }
        ]
      }
      user_streaming_services: {
        Row: {
          id: number
          user_id: string | null
          provider_id: number
          provider_name: string
          provider_logo: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          provider_id: number
          provider_name: string
          provider_logo?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          provider_id?: number
          provider_name?: string
          provider_logo?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_streaming_services_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      ratings: {
        Row: {
          id: number
          user_id: string | null
          movie_id: number | null
          rating: number | null
          reaction: 'loved' | 'liked' | 'meh' | 'disliked' | 'skip' | null
          source: 'onboarding' | 'manual' | 'recommendation' | 'watchlist' | 'letterboxd' | 'imdb' | 'csv'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          movie_id?: number | null
          rating?: number | null
          reaction?: 'loved' | 'liked' | 'meh' | 'disliked' | 'skip' | null
          source?: 'onboarding' | 'manual' | 'recommendation' | 'watchlist' | 'letterboxd' | 'imdb' | 'csv'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          movie_id?: number | null
          rating?: number | null
          reaction?: 'loved' | 'liked' | 'meh' | 'disliked' | 'skip' | null
          source?: 'onboarding' | 'manual' | 'recommendation' | 'watchlist' | 'letterboxd' | 'imdb' | 'csv'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ratings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ratings_movie_id_fkey'
            columns: ['movie_id']
            isOneToOne: false
            referencedRelation: 'movies'
            referencedColumns: ['id']
          }
        ]
      }
      taste_profiles: {
        Row: {
          id: number
          user_id: string | null
          taste_vector: string | null
          genre_scores: Json | null
          decade_scores: Json | null
          director_affinities: Json | null
          theme_tags: Json | null
          pacing_pref: string | null
          mood_history: Json | null
          total_ratings: number
          profile_summary: string | null
          computed_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          taste_vector?: string | null
          genre_scores?: Json | null
          decade_scores?: Json | null
          director_affinities?: Json | null
          theme_tags?: Json | null
          pacing_pref?: string | null
          mood_history?: Json | null
          total_ratings?: number
          profile_summary?: string | null
          computed_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          taste_vector?: string | null
          genre_scores?: Json | null
          decade_scores?: Json | null
          director_affinities?: Json | null
          theme_tags?: Json | null
          pacing_pref?: string | null
          mood_history?: Json | null
          total_ratings?: number
          profile_summary?: string | null
          computed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'taste_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      recommendations: {
        Row: {
          id: number
          user_id: string | null
          session_id: string
          query_text: string | null
          mood_context: Json | null
          movies_recommended: Json | null
          model_used: string | null
          tokens_used: number | null
          latency_ms: number | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          session_id?: string
          query_text?: string | null
          mood_context?: Json | null
          movies_recommended?: Json | null
          model_used?: string | null
          tokens_used?: number | null
          latency_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          session_id?: string
          query_text?: string | null
          mood_context?: Json | null
          movies_recommended?: Json | null
          model_used?: string | null
          tokens_used?: number | null
          latency_ms?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recommendations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      watchlist: {
        Row: {
          id: number
          user_id: string | null
          movie_id: number | null
          priority: number
          notes: string | null
          added_from: 'manual' | 'recommendation' | 'group' | 'letterboxd'
          watched: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          movie_id?: number | null
          priority?: number
          notes?: string | null
          added_from?: 'manual' | 'recommendation' | 'group' | 'letterboxd'
          watched?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          movie_id?: number | null
          priority?: number
          notes?: string | null
          added_from?: 'manual' | 'recommendation' | 'group' | 'letterboxd'
          watched?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'watchlist_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'watchlist_movie_id_fkey'
            columns: ['movie_id']
            isOneToOne: false
            referencedRelation: 'movies'
            referencedColumns: ['id']
          }
        ]
      }
      groups: {
        Row: {
          id: string
          name: string | null
          created_by: string | null
          invite_code: string | null
          merged_vector: string | null
          merged_genres: Json | null
          status: 'active' | 'archived'
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          created_by?: string | null
          invite_code?: string | null
          merged_vector?: string | null
          merged_genres?: Json | null
          status?: 'active' | 'archived'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          created_by?: string | null
          invite_code?: string | null
          merged_vector?: string | null
          merged_genres?: Json | null
          status?: 'active' | 'archived'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      group_members: {
        Row: {
          id: number
          group_id: string | null
          user_id: string | null
          joined_at: string
        }
        Insert: {
          id?: number
          group_id?: string | null
          user_id?: string | null
          joined_at?: string
        }
        Update: {
          id?: number
          group_id?: string | null
          user_id?: string | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey'
            columns: ['group_id']
            isOneToOne: false
            referencedRelation: 'groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'group_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      import_jobs: {
        Row: {
          id: string
          user_id: string | null
          source: 'letterboxd' | 'imdb' | 'csv'
          status: 'pending' | 'parsing' | 'matching' | 'preview' | 'confirmed' | 'processing' | 'completed' | 'failed'
          file_name: string | null
          raw_count: number | null
          matched_count: number | null
          unmatched_count: number | null
          imported_count: number | null
          skipped_count: number | null
          preview_data: Json | null
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          source: 'letterboxd' | 'imdb' | 'csv'
          status?: 'pending' | 'parsing' | 'matching' | 'preview' | 'confirmed' | 'processing' | 'completed' | 'failed'
          file_name?: string | null
          raw_count?: number | null
          matched_count?: number | null
          unmatched_count?: number | null
          imported_count?: number | null
          skipped_count?: number | null
          preview_data?: Json | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          source?: 'letterboxd' | 'imdb' | 'csv'
          status?: 'pending' | 'parsing' | 'matching' | 'preview' | 'confirmed' | 'processing' | 'completed' | 'failed'
          file_name?: string | null
          raw_count?: number | null
          matched_count?: number | null
          unmatched_count?: number | null
          imported_count?: number | null
          skipped_count?: number | null
          preview_data?: Json | null
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'import_jobs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_movies: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: number
          tmdb_id: number
          title: string
          overview: string
          genres: Json
          keywords: Json
          cast_crew: Json
          vote_average: number
          runtime: number
          poster_path: string
          backdrop_path: string
          release_date: string
          original_language: string
          production_countries: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'])
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

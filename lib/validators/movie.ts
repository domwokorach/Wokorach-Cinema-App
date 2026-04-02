import { z } from 'zod'

// ---------------------------------------------------------------------------
// Movie search params schema
// ---------------------------------------------------------------------------

export const movieSearchSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query must not be empty')
    .max(500, 'Search query must be under 500 characters'),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .default(1),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20),
  genres: z
    .array(z.string())
    .optional(),
  min_year: z
    .number()
    .int()
    .min(1888)
    .optional(),
  max_year: z
    .number()
    .int()
    .max(2030)
    .optional(),
  min_rating: z
    .number()
    .min(0)
    .max(10)
    .optional(),
  sort_by: z
    .enum(['relevance', 'rating', 'year', 'popularity'])
    .optional()
    .default('relevance'),
})

export type MovieSearchParams = z.infer<typeof movieSearchSchema>

// ---------------------------------------------------------------------------
// Movie detail response schema
// ---------------------------------------------------------------------------

export const movieDetailSchema = z.object({
  tmdb_id: z.number().int(),
  title: z.string(),
  original_title: z.string().optional(),
  overview: z.string().nullable(),
  tagline: z.string().nullable(),
  release_date: z.string().nullable(),
  runtime: z.number().int().nullable(),
  genres: z.array(z.string()).nullable(),
  director: z.string().nullable(),
  cast: z.array(z.string()).nullable(),
  keywords: z.array(z.string()).nullable(),
  vote_average: z.number().nullable(),
  vote_count: z.number().int().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  original_language: z.string().nullable(),
  budget: z.number().nullable(),
  revenue: z.number().nullable(),
  streaming_providers: z
    .array(
      z.object({
        provider_name: z.string(),
        provider_id: z.number().int(),
        logo_path: z.string().nullable(),
      })
    )
    .nullable(),
  user_rating: z.number().nullable().optional(),
  user_reaction: z
    .enum(['loved', 'liked', 'meh', 'disliked', 'skip'])
    .nullable()
    .optional(),
})

export type MovieDetail = z.infer<typeof movieDetailSchema>

// ---------------------------------------------------------------------------
// Movie list item schema (for search results / lists)
// ---------------------------------------------------------------------------

export const movieListItemSchema = z.object({
  tmdb_id: z.number().int(),
  title: z.string(),
  release_date: z.string().nullable(),
  genres: z.array(z.string()).nullable(),
  vote_average: z.number().nullable(),
  poster_path: z.string().nullable(),
  overview: z.string().nullable(),
})

export type MovieListItem = z.infer<typeof movieListItemSchema>

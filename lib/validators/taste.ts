import { z } from 'zod'

// ---------------------------------------------------------------------------
// Rate movie schema - POST /api/taste/rate
// ---------------------------------------------------------------------------

export const rateMovieSchema = z.object({
  tmdb_id: z
    .number()
    .int()
    .positive('TMDB ID must be a positive integer'),
  rating: z
    .number()
    .min(0.5, 'Rating must be at least 0.5')
    .max(5.0, 'Rating must be at most 5.0')
    .step(0.5, 'Rating must be in 0.5 increments'),
  reaction: z
    .enum(['loved', 'liked', 'meh', 'disliked', 'skip'])
    .optional(),
  review: z
    .string()
    .max(2000, 'Review must be under 2000 characters')
    .optional(),
})

export type RateMovieRequest = z.infer<typeof rateMovieSchema>

// ---------------------------------------------------------------------------
// Taste profile response schema
// ---------------------------------------------------------------------------

export const directorAffinitySchema = z.object({
  name: z.string(),
  avg_rating: z.number(),
  count: z.number().int(),
})

export const tasteProfileSchema = z.object({
  user_id: z.string().uuid(),
  taste_summary: z.string(),
  genre_scores: z.record(z.string(), z.number()),
  decade_scores: z.record(z.string(), z.number()),
  director_affinities: z.array(directorAffinitySchema),
  theme_tags: z.array(z.string()),
  pacing_pref: z.enum(['slow', 'mixed', 'fast', 'neutral']),
  updated_at: z.string().datetime(),
})

export type TasteProfileResponse = z.infer<typeof tasteProfileSchema>

// ---------------------------------------------------------------------------
// Batch rate schema - POST /api/taste/rate/batch
// ---------------------------------------------------------------------------

export const batchRateSchema = z.object({
  ratings: z
    .array(rateMovieSchema)
    .min(1, 'At least one rating is required')
    .max(50, 'Maximum 50 ratings per batch'),
})

export type BatchRateRequest = z.infer<typeof batchRateSchema>

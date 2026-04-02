import { z } from 'zod'

// ---------------------------------------------------------------------------
// Request schema for POST /api/recommend
// ---------------------------------------------------------------------------

export const recommendRequestSchema = z.object({
  query: z
    .string()
    .min(1, 'Query must not be empty')
    .max(1000, 'Query must be under 1000 characters'),
  count: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(5),
  streaming_providers: z
    .array(z.string())
    .optional(),
  max_runtime: z
    .number()
    .int()
    .min(1)
    .max(600)
    .optional(),
  exclude_rated: z
    .boolean()
    .optional()
    .default(true),
  min_tmdb_rating: z
    .number()
    .min(0)
    .max(10)
    .optional(),
  mood: z
    .string()
    .max(200)
    .optional(),
  watching_with: z
    .string()
    .max(200)
    .optional(),
})

export type RecommendRequest = z.infer<typeof recommendRequestSchema>

// ---------------------------------------------------------------------------
// Response schema for POST /api/recommend
// ---------------------------------------------------------------------------

export const recommendationItemSchema = z.object({
  tmdb_id: z.number().int(),
  title: z.string(),
  year: z.number().int(),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  match_reasons: z.array(z.string()),
})

export const recommendResponseSchema = z.object({
  recommendations: z.array(recommendationItemSchema),
  query: z.string(),
  parsed_query: z.object({
    mood: z.string().nullable(),
    themes: z.array(z.string()),
    genre_hints: z.array(z.string()),
    social_context: z.string().nullable(),
    time_constraint: z.number().nullable(),
  }).optional(),
  meta: z.object({
    candidates_searched: z.number(),
    candidates_filtered: z.number(),
    model: z.string(),
    latency_ms: z.number(),
  }).optional(),
})

export type RecommendResponse = z.infer<typeof recommendResponseSchema>
export type RecommendationItem = z.infer<typeof recommendationItemSchema>

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recommend } from '@/lib/ai/recommend'
import { checkRateLimit, incrementRateLimit } from '@/lib/utils/rate-limit'
import { z } from 'zod'

const recommendRequestSchema = z.object({
  query: z.string().min(1).max(500),
  mood: z.string().optional(),
  streaming_only: z.boolean().optional(),
  exclude_watched: z.boolean().optional(),
  count: z.number().min(1).max(20).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = recommendRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { query, mood, streaming_only, exclude_watched, count } = parsed.data

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          remaining: rateLimit.remaining,
          reset_at: rateLimit.reset_at,
        },
        { status: 429 }
      )
    }

    // Fetch taste profile
    const admin = createAdminClient()
    const { data: tasteProfile } = await admin
      .from('taste_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!tasteProfile) {
      return NextResponse.json(
        { error: 'Taste profile not found. Please complete onboarding first.' },
        { status: 400 }
      )
    }

    // Fetch user's streaming providers if streaming_only
    let streamingProviders: string[] | undefined
    if (streaming_only) {
      const { data: services } = await admin
        .from('user_streaming_services')
        .select('provider_name')
        .eq('user_id', user.id)

      streamingProviders = services?.map((s) => s.provider_name) ?? []
    }

    // Adapt the DB row to what the recommend function expects
    const tasteProfileForPipeline = {
      user_id: tasteProfile.user_id ?? user.id,
      taste_vector: null as number[] | null,
      genre_scores: (tasteProfile.genre_scores as Record<string, number>) ?? {},
      decade_scores: (tasteProfile.decade_scores as Record<string, number>) ?? {},
      director_affinities: (tasteProfile.director_affinities as { name: string; avg_rating: number; count: number }[]) ?? [],
      theme_tags: (tasteProfile.theme_tags as string[]) ?? [],
      taste_summary: tasteProfile.profile_summary ?? '',
      pacing_pref: tasteProfile.pacing_pref ?? 'varied',
      updated_at: tasteProfile.computed_at,
    }

    // Run recommendation pipeline
    const results = await recommend({
      query,
      userId: user.id,
      tasteProfile: tasteProfileForPipeline,
      count: count ?? 5,
      streamingProviders,
      excludeRated: exclude_watched ?? true,
    })

    // Enrich results with movie data
    const tmdbIds = results.map((r) => r.tmdb_id)
    const { data: movies } = await admin
      .from('movies')
      .select('tmdb_id, title, poster_path, backdrop_path, overview, vote_average, runtime, genres, release_date')
      .in('tmdb_id', tmdbIds)

    const movieMap = new Map(movies?.map((m) => [m.tmdb_id, m]) ?? [])

    const recommendations = results.map((r) => ({
      tmdb_id: r.tmdb_id,
      title: r.title,
      year: r.year,
      poster_path: movieMap.get(r.tmdb_id)?.poster_path ?? null,
      backdrop_path: movieMap.get(r.tmdb_id)?.backdrop_path ?? null,
      overview: movieMap.get(r.tmdb_id)?.overview ?? '',
      vote_average: movieMap.get(r.tmdb_id)?.vote_average ? Number(movieMap.get(r.tmdb_id)!.vote_average) : 0,
      runtime: movieMap.get(r.tmdb_id)?.runtime ?? null,
      genres: movieMap.get(r.tmdb_id)?.genres ?? [],
      match_score: Math.round(r.confidence * 100),
      explanation: r.explanation,
    }))

    // Log to recommendations table
    await admin.from('recommendations').insert({
      user_id: user.id,
      query_text: query,
      mood_context: mood ? { mood } : null,
      movies_recommended: JSON.parse(JSON.stringify(recommendations)),
      model_used: 'claude-sonnet-4-20250514',
      tokens_used: 0,
    })

    // Increment daily count
    await incrementRateLimit(user.id)

    return NextResponse.json({
      recommendations,
      query,
      model: 'claude-sonnet-4-20250514',
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

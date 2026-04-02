import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateJSON } from '@/lib/ai/anthropic'
import { generateQueryEmbedding } from '@/lib/ai/embeddings'
import { vectorSearch, applyFilters } from '@/lib/ai/recommend'
import { buildGroupMergePrompt } from '@/lib/ai/prompts/group-merge'
import { validateRecommendations } from '@/lib/ai/validators'
import type { RecommendationItem } from '@/lib/ai/validators'
import { z } from 'zod'

const groupRecommendSchema = z.object({
  query: z.string().min(1).max(500),
  mood: z.string().optional(),
  count: z.number().min(1).max(20).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = groupRecommendSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { query, mood, count = 5 } = parsed.data
    const admin = createAdminClient()

    // Get group members
    const { data: members } = await admin
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)

    if (!members || members.length === 0) {
      return NextResponse.json({ error: 'Group not found or empty' }, { status: 404 })
    }

    const memberIds = members.map((m) => m.user_id).filter((id): id is string => id !== null)

    // Get taste profiles for all members
    const { data: tasteProfiles } = await admin
      .from('taste_profiles')
      .select('*')
      .in('user_id', memberIds)

    // Get member display names
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, display_name')
      .in('id', memberIds)

    const nameMap = new Map(
      (profiles ?? []).map((p) => [p.id, p.display_name || 'Member'])
    )

    // Intersect streaming services
    const { data: allServices } = await admin
      .from('user_streaming_services')
      .select('user_id, provider_id, provider_name')
      .in('user_id', memberIds)

    // Find providers shared by ALL members
    const providerCounts = new Map<number, { name: string; count: number }>()
    for (const service of allServices ?? []) {
      const existing = providerCounts.get(service.provider_id)
      if (existing) {
        existing.count++
      } else {
        providerCounts.set(service.provider_id, {
          name: service.provider_name,
          count: 1,
        })
      }
    }

    const sharedProviders: string[] = []
    const sharedProviderIds: number[] = []
    for (const [id, { name, count: cnt }] of providerCounts.entries()) {
      if (cnt >= memberIds.length) {
        sharedProviders.push(name)
        sharedProviderIds.push(id)
      }
    }

    // Compute merged taste summary for vector search
    const tasteSummaries = (tasteProfiles ?? [])
      .map((tp) => tp.profile_summary || '')
      .filter(Boolean)
      .join(' ')

    // Vector search
    const queryEmbedding = await generateQueryEmbedding(query, tasteSummaries)
    const rawCandidates = await vectorSearch(queryEmbedding, 100)

    // Filter by shared streaming
    const filteredCandidates = sharedProviders.length > 0
      ? applyFilters(rawCandidates, { streamingProviders: sharedProviders })
      : rawCandidates

    if (filteredCandidates.length === 0) {
      return NextResponse.json({ recommendations: [], group_id: groupId, member_count: memberIds.length, shared_streaming: sharedProviderIds })
    }

    const topCandidates = filteredCandidates.slice(0, 50)

    // Build group member profiles for prompt
    const groupMembers = (tasteProfiles ?? []).map((tp) => ({
      name: nameMap.get(tp.user_id ?? '') || 'Member',
      taste_summary: tp.profile_summary || '',
      genre_scores: (tp.genre_scores as Record<string, number>) ?? {},
      theme_tags: (tp.theme_tags as string[]) ?? [],
    }))

    const candidateListJson = JSON.stringify(
      topCandidates.map((c) => ({
        tmdb_id: c.tmdb_id,
        title: c.title,
        year: c.year,
        overview: c.overview,
        genres: c.genres,
        vote_average: c.vote_average,
        runtime: c.runtime,
      })),
      null,
      2
    )

    const systemPrompt = buildGroupMergePrompt({
      members: groupMembers,
      query,
      mood: mood ?? null,
      count,
      candidate_list_json: candidateListJson,
    })

    const { data: llmResults } = await generateJSON<RecommendationItem[]>({
      system: systemPrompt,
      prompt: `Select the best ${count} films for this group.`,
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
    })

    // Validate
    const candidateIds = new Set(topCandidates.map((c) => c.tmdb_id))
    const { valid } = validateRecommendations(llmResults, candidateIds)

    // Enrich with movie data
    const tmdbIds = valid.map((r) => r.tmdb_id)
    const { data: movies } = await admin
      .from('movies')
      .select('tmdb_id, title, poster_path, backdrop_path, overview, vote_average, runtime, genres')
      .in('tmdb_id', tmdbIds)

    const movieMap = new Map(movies?.map((m) => [m.tmdb_id, m]) ?? [])

    const recommendations = valid.map((r) => {
      const movie = movieMap.get(r.tmdb_id)
      return {
        tmdb_id: r.tmdb_id,
        title: r.title,
        year: r.year,
        poster_path: movie?.poster_path ?? null,
        backdrop_path: movie?.backdrop_path ?? null,
        overview: movie?.overview ?? '',
        vote_average: movie?.vote_average ? Number(movie.vote_average) : 0,
        runtime: movie?.runtime ?? null,
        genres: movie?.genres ?? [],
        match_score: Math.round(r.confidence * 100),
        explanation: r.explanation,
      }
    })

    return NextResponse.json({
      recommendations,
      group_id: groupId,
      member_count: memberIds.length,
      shared_streaming: sharedProviderIds,
    })
  } catch (error) {
    console.error('Group recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate group recommendations' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get group details
    const { data: group, error: groupError } = await admin
      .from('groups')
      .select('*')
      .eq('id', id)
      .single()

    if (groupError || !group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get members with profiles
    const { data: members } = await admin
      .from('group_members')
      .select(`
        id,
        group_id,
        user_id,
        joined_at,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('group_id', id)

    // Get merged taste profile if available
    const memberIds = (members ?? []).map((m) => m.user_id)
    const { data: tasteProfiles } = await admin
      .from('taste_profiles')
      .select('user_id, genre_scores, decade_scores, theme_tags')
      .in('user_id', memberIds)

    // Compute merged profile
    let mergedProfile = null
    if (tasteProfiles && tasteProfiles.length > 0) {
      const mergedGenres: Record<string, number> = {}
      const mergedDecades: Record<string, number> = {}
      const mergedMoods: Record<string, number> = {}
      const count = tasteProfiles.length

      for (const tp of tasteProfiles) {
        const genres = tp.genre_scores as Record<string, number> | null
        if (genres) {
          for (const [genre, score] of Object.entries(genres)) {
            mergedGenres[genre] = (mergedGenres[genre] ?? 0) + score
          }
        }
        const decades = tp.decade_scores as Record<string, number> | null
        if (decades) {
          for (const [decade, score] of Object.entries(decades)) {
            mergedDecades[decade] = (mergedDecades[decade] ?? 0) + score
          }
        }
        const tags = tp.theme_tags as string[] | null
        if (tags) {
          for (const tag of tags) {
            mergedMoods[tag] = (mergedMoods[tag] ?? 0) + 1
          }
        }
      }

      // Average
      for (const key of Object.keys(mergedGenres)) mergedGenres[key] /= count
      for (const key of Object.keys(mergedDecades)) mergedDecades[key] /= count
      for (const key of Object.keys(mergedMoods)) mergedMoods[key] /= count

      mergedProfile = {
        genre_scores: mergedGenres,
        decade_scores: mergedDecades,
        mood_preferences: mergedMoods,
        avg_rating: 0,
      }
    }

    return NextResponse.json({
      ...group,
      members: members ?? [],
      merged_profile: mergedProfile,
    })
  } catch (error) {
    console.error('Group fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group details' },
      { status: 500 }
    )
  }
}

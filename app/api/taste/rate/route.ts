import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recomputeTasteProfile } from '@/lib/ai/taste-analyzer'
import { z } from 'zod'

const rateMovieSchema = z.object({
  movie_id: z.number().int().positive(),
  rating: z.number().min(0.5).max(5).optional(),
  reaction: z.enum(['loved', 'liked', 'meh', 'disliked', 'skip']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = rateMovieSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { movie_id, rating, reaction } = parsed.data

    if (!rating && !reaction) {
      return NextResponse.json(
        { error: 'Either rating or reaction must be provided' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Upsert rating
    const { error: upsertError } = await admin
      .from('ratings')
      .upsert(
        {
          user_id: user.id,
          movie_id,
          rating: rating ?? null,
          reaction: reaction ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,movie_id' }
      )

    if (upsertError) {
      console.error('Rating upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save rating' },
        { status: 500 }
      )
    }

    // Trigger async taste profile recomputation (fire and forget)
    recomputeTasteProfile(user.id).catch((err) =>
      console.error('Taste recomputation error:', err)
    )

    return NextResponse.json({ success: true, movie_id, rating, reaction })
  } catch (error) {
    console.error('Rate movie error:', error)
    return NextResponse.json(
      { error: 'Failed to rate movie' },
      { status: 500 }
    )
  }
}

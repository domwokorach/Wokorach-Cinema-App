import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const updateStreamingSchema = z.object({
  provider_ids: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      logo: z.string(),
    })
  ),
})

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateStreamingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { provider_ids } = parsed.data

    const admin = createAdminClient()

    // Delete existing services
    await admin
      .from('user_streaming_services')
      .delete()
      .eq('user_id', user.id)

    // Insert new services
    if (provider_ids.length > 0) {
      const rows = provider_ids.map((p) => ({
        user_id: user.id,
        provider_id: p.id,
        provider_name: p.name,
        logo_path: p.logo,
      }))

      const { error: insertError } = await admin
        .from('user_streaming_services')
        .insert(rows)

      if (insertError) {
        console.error('Streaming services insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to update streaming services' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      services: provider_ids,
    })
  } catch (error) {
    console.error('Streaming services error:', error)
    return NextResponse.json(
      { error: 'Failed to update streaming services' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInviteCode } from '@/lib/utils/helpers'
import { z } from 'zod'

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pro plan check
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Group Watch is a Pro feature. Please upgrade to create groups.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = createGroupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name } = parsed.data
    const inviteCode = generateInviteCode()

    // Create group
    const { data: group, error: groupError } = await admin
      .from('groups')
      .insert({
        name,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      console.error('Group create error:', groupError)
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    // Add creator as member
    await admin.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
    })

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cinematch.app'}/group/join?code=${inviteCode}`

    return NextResponse.json(
      {
        group,
        invite_code: inviteCode,
        share_url: shareUrl,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Group create error:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile, error } = await admin
      .from('taste_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Taste profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Taste profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch taste profile' },
      { status: 500 }
    )
  }
}

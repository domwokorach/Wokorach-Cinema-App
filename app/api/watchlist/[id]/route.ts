import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
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

    // Delete only if it belongs to the user
    const { error: deleteError, count } = await admin
      .from('watchlist')
      .delete({ count: 'exact' })
      .eq('id', parseInt(id, 10))
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Watchlist delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove from watchlist' },
        { status: 500 }
      )
    }

    if (count === 0) {
      return NextResponse.json(
        { error: 'Watchlist item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Watchlist delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}

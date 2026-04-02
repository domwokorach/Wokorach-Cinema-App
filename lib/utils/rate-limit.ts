import { createAdminClient } from '@/lib/supabase/admin'
import { FREE_TIER_DAILY_LIMIT } from '@/lib/utils/constants'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  reset_at: string
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = createAdminClient()

  // Get user profile to check plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, daily_rec_count, daily_rec_reset')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { allowed: false, remaining: 0, limit: 0, reset_at: new Date().toISOString() }
  }

  const isPro = profile.plan === 'pro'
  if (isPro) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      reset_at: '',
    }
  }

  // Check if we need to reset the daily count
  const now = new Date()
  const resetDate = profile.daily_rec_reset ? new Date(profile.daily_rec_reset) : null
  const needsReset = !resetDate || resetDate.getDate() !== now.getDate()

  if (needsReset) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    await supabase
      .from('profiles')
      .update({
        daily_rec_count: 0,
        daily_rec_reset: now.toISOString(),
      })
      .eq('id', userId)

    return {
      allowed: true,
      remaining: FREE_TIER_DAILY_LIMIT,
      limit: FREE_TIER_DAILY_LIMIT,
      reset_at: tomorrow.toISOString(),
    }
  }

  const currentCount = profile.daily_rec_count || 0
  const remaining = Math.max(0, FREE_TIER_DAILY_LIMIT - currentCount)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return {
    allowed: currentCount < FREE_TIER_DAILY_LIMIT,
    remaining,
    limit: FREE_TIER_DAILY_LIMIT,
    reset_at: tomorrow.toISOString(),
  }
}

export async function incrementRateLimit(userId: string): Promise<void> {
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_rec_count')
    .eq('id', userId)
    .single()

  const currentCount = profile?.daily_rec_count ?? 0
  await supabase
    .from('profiles')
    .update({ daily_rec_count: currentCount + 1 })
    .eq('id', userId)
}

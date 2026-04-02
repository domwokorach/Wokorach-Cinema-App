export interface PlanConfig {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  stripe_price_id: string
  limits: {
    daily_recommendations: number | null
    group_watch: boolean
    import: boolean
    priority_support: boolean
  }
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with personalized recommendations',
    price: 0,
    currency: 'usd',
    interval: 'month',
    stripe_price_id: '',
    features: [
      '5 recommendations per day',
      'Basic taste profile',
      'Watchlist',
      'Rate & review movies',
    ],
    limits: {
      daily_recommendations: 5,
      group_watch: false,
      import: false,
      priority_support: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited recommendations and premium features',
    price: 999,
    currency: 'usd',
    interval: 'month',
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Unlimited recommendations',
      'Advanced taste profile',
      'Group Watch matching',
      'Import from Letterboxd & IMDb',
      'Priority support',
    ],
    limits: {
      daily_recommendations: null,
      group_watch: true,
      import: true,
      priority_support: true,
    },
  },
} as const

export function getPlan(planId: string): PlanConfig {
  return PLANS[planId] || PLANS.free
}

export function isPro(planId: string | null | undefined): boolean {
  return planId === 'pro'
}

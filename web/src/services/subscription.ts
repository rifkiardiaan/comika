import api from './api'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  formatted_price: string
  duration_days: number
  badge: string
  savings?: string
  tier: 'premium' | 'vvip'
  features: string[]
}

export interface SubscriptionStatus {
  is_premium: boolean
  is_vvip: boolean
  plan: string | null
  expires_at: string | null
  days_remaining: number
}

export const subscription = {
  /** Get available subscription plans. */
  async plans(): Promise<SubscriptionPlan[]> {
    const { data } = await api.get<{ data: SubscriptionPlan[] }>('/subscription/plans')
    return data.data
  },

  /** Get current user's subscription status. */
  async status(): Promise<SubscriptionStatus> {
    const { data } = await api.get<{ data: SubscriptionStatus }>('/subscription/status')
    return data.data
  },

  /** Subscribe to a premium plan. */
  async subscribe(plan: string, paymentMethod?: string): Promise<{ expires_at: string; days_added: number }> {
    const { data } = await api.post<{ data: { expires_at: string; days_added: number } }>(
      '/subscription/subscribe',
      { plan, payment_method: paymentMethod },
    )
    return data.data
  },

  /** Cancel subscription. */
  async cancel(): Promise<void> {
    await api.post('/subscription/cancel')
  },
}

import api from './api'
import type { GamificationProfile } from '../types'

/** Profil gamification user: level, XP, streak & achievement. */
async function profile(): Promise<{ data: GamificationProfile }> {
  const res = await api.get('/me/gamification')
  return { data: res.data.data }
}

export const gamification = { profile }

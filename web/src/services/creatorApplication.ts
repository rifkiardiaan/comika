import api from './api'

export interface CreatorApplication {
  id: number
  user_id: number
  user?: { id: number; name: string; username: string; email: string; avatar_url: string | null }
  bio: string
  reason: string
  experience: string | null
  portfolio_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: number | null
  reviewer?: { id: number; name: string }
  review_note: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

/** Submit pengajuan menjadi creator. */
export async function submitApplication(payload: {
  bio: string
  reason: string
  experience?: string
  portfolio_url?: string
}): Promise<{ message: string; data: CreatorApplication }> {
  const { data } = await api.post('/creator-application', payload)
  return data
}

/** Lihat status pengajuan sendiri. */
export async function getMyApplication(): Promise<{ data: CreatorApplication | null }> {
  const { data } = await api.get('/creator-application')
  return data
}

/** Admin: daftar semua pengajuan. */
export async function listApplications(params?: {
  status?: string
  page?: number
  per_page?: number
}): Promise<PaginatedResponse<CreatorApplication>> {
  const { data } = await api.get('/admin/creator-applications', { params })
  return data
}

/** Admin: setujui pengajuan. */
export async function approveApplication(id: number): Promise<{ message: string; data: CreatorApplication }> {
  const { data } = await api.patch(`/admin/creator-applications/${id}/approve`)
  return data
}

/** Admin: tolak pengajuan. */
export async function rejectApplication(id: number, reviewNote?: string): Promise<{ message: string; data: CreatorApplication }> {
  const { data } = await api.patch(`/admin/creator-applications/${id}/reject`, { review_note: reviewNote })
  return data
}
